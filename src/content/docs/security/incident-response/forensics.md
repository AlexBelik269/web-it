---
title: "Digital Forensics Basics"
description: "Evidence preservation, log analysis, and investigation techniques for security incidents."
---

Digital forensics is the practice of collecting, preserving, and analyzing digital evidence after a security incident. The goal is to understand what happened, when, how, and what was affected — without destroying evidence in the process.

## The Golden Rule: Preserve Before You Touch

Every action taken on a compromised system potentially overwrites evidence. Before remediation, preserve:

```
Priority order (most volatile to least):
1. CPU registers / running processes (lost on reboot)
2. Network connections (lost when connections close)
3. Memory (RAM) contents
4. Running system state (open files, logged-in users)
5. Logs (may rotate)
6. Disk images
7. Remote logs / SIEM data (most persistent)
```

---

## Evidence Collection

### Memory Capture

```bash
# Linux — capture RAM with LiME (Linux Memory Extractor)
# Must be done before reboot — memory is lost on restart
sudo insmod lime-$(uname -r).ko "path=/mnt/forensics/memory.lime format=lime"

# Windows — WinPMem or Magnet RAM Capture (GUI tool)
# Run as Administrator; write to external drive

# Cloud — take a snapshot of the instance memory if the provider supports it
# AWS: create an EBS snapshot; memory state is not captured in standard snapshots
# For memory: take an EC2 instance dump before stopping
```

### Disk Image

```bash
# Create a forensic copy of a disk — bit-for-bit including deleted files
# Never work on the original disk
sudo dd if=/dev/xvda of=/mnt/forensics/disk.img bs=4M status=progress

# More forensics-friendly (with hash verification)
sudo dcfldd if=/dev/xvda of=/mnt/forensics/disk.img \
  hash=sha256 hashlog=/mnt/forensics/disk.sha256 \
  bs=4M

# Verify integrity
sha256sum /mnt/forensics/disk.img
# Compare to the hash in disk.sha256
```

### Log Export

```bash
# Linux — key log files to preserve
/var/log/auth.log          # authentication events
/var/log/syslog            # system events
/var/log/nginx/access.log  # web server access
/var/log/nginx/error.log
~/.bash_history            # user command history (may be cleared by attacker)
/etc/passwd                # user accounts (check for new additions)
/etc/cron*                 # cron jobs (common persistence location)
/tmp/                      # often used by attackers
/proc/net/tcp              # current network connections

# Export in compressed archive with timestamp
tar -czf /mnt/forensics/logs-$(date +%Y%m%d-%H%M%S).tar.gz \
  /var/log/auth.log /var/log/syslog /var/log/nginx/

# AWS CloudTrail — export from S3 or CloudWatch
aws logs create-export-task \
  --log-group-name /aws/cloudtrail \
  --from $(date -d '7 days ago' +%s000) \
  --to $(date +%s000) \
  --destination my-forensics-bucket \
  --destination-prefix incident-2024-01-15
```

---

## Log Analysis

### Finding Attacker Activity in Auth Logs

```bash
# Failed logins in auth.log
grep "Failed password" /var/log/auth.log | \
  awk '{print $11}' | sort | uniq -c | sort -rn | head -20

# Successful logins (after failures — possible brute force success)
grep "Accepted password\|Accepted publickey" /var/log/auth.log

# New sudo usage
grep "sudo:" /var/log/auth.log | grep -v "pam_unix"

# User additions (attacker may create backdoor accounts)
grep "useradd\|adduser" /var/log/auth.log
grep "new user\|new group" /var/log/auth.log
```

### Web Access Log Analysis

```bash
# Find high-frequency requesters (potential scanner/attacker)
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20

# Find 4xx errors (scanning, probing)
grep '" 40[0-9]' /var/log/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Find requests to sensitive paths
grep -E '/(admin|phpmyadmin|wp-admin|.env|config|backup|\.git)' \
  /var/log/nginx/access.log

# Find SQL injection probes in URLs
grep -Ei "union.*select|or.*1=1|'--|xp_cmdshell" \
  /var/log/nginx/access.log

# Requests from a specific IP in time order
grep "^10.0.0.1" /var/log/nginx/access.log | sort -k4
```

### Database Query Log Analysis

```sql
-- PostgreSQL: enable query logging for forensics (on a copy, not production)
ALTER SYSTEM SET log_min_duration_statement = 0;  -- log all queries
SELECT pg_reload_conf();

-- Check pg_audit logs for suspicious queries
-- Look for: UNION SELECT, information_schema queries, large data exports
grep -i "information_schema\|union.*select\|pg_dump" /var/log/postgresql/*.log
```

### Cloud Audit Logs

```bash
# AWS CloudTrail — find all API calls from a suspicious IP
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue="i-abc123" \
  --start-time 2024-01-10T00:00:00Z \
  --end-time 2024-01-15T00:00:00Z \
  --query 'Events[?contains(CloudTrailEvent, `10.0.0.1`)]'

# Find IAM changes (attacker may have escalated privileges)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AttachUserPolicy

# GCP — find audit log events
gcloud logging read \
  'logName="projects/PROJECT_ID/logs/cloudaudit.googleapis.com%2Factivity" AND protoPayload.authenticationInfo.principalEmail="suspect@example.com"' \
  --freshness=72h
```

---

## Timeline Reconstruction

Build a timeline of attacker activity from multiple log sources:

```
2024-01-14 03:22:14 UTC  - 10.5.6.7 begins scanning /admin paths (web log)
2024-01-14 03:24:31 UTC  - 5 failed login attempts for admin@company.com (auth log)
2024-01-14 03:24:58 UTC  - Successful login for admin@company.com from 10.5.6.7 (auth log)
2024-01-14 03:25:04 UTC  - IAM role policy updated (CloudTrail: AttachRolePolicy)
2024-01-14 03:26:12 UTC  - New IAM user 'maintenance' created (CloudTrail: CreateUser)
2024-01-14 03:28:45 UTC  - 50,000 rows queried from users table (DB slow query log)
2024-01-14 03:31:20 UTC  - S3 sync of users-export.csv to external bucket (S3 data events)
2024-01-14 03:33:00 UTC  - Session ends
```

### Correlating Logs from Multiple Sources

```python
# Simple log correlator — merge and sort by timestamp
import json
from datetime import datetime

def parse_nginx_log(line):
    # Parse nginx combined log format
    import re
    pattern = r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\].*'
    m = re.match(pattern, line)
    if m:
        ts = datetime.strptime(m.group('time'), '%d/%b/%Y:%H:%M:%S %z')
        return {'timestamp': ts.isoformat(), 'source': 'nginx', 'ip': m.group('ip'), 'raw': line}

events = []
for source, parser in [(nginx_log_path, parse_nginx_log), ...]:
    with open(source) as f:
        for line in f:
            event = parser(line.strip())
            if event:
                events.append(event)

events.sort(key=lambda e: e['timestamp'])
for e in events:
    print(f"{e['timestamp']} [{e['source']}] {e['raw']}")
```

---

## Indicators of Compromise (IOCs)

Document and share these for threat intelligence and blocking:

```
IP addresses used by attacker:
  - 10.5.6.7 (initial access)
  - 198.51.100.42 (data exfiltration destination)

Files created by attacker:
  - /tmp/.hidden-shell (SHA256: a1b2c3d4...)
  - /etc/cron.d/maintenance (persistence backdoor)

Usernames created:
  - maintenance (IAM user, created 2024-01-14 03:26:12 UTC)

Domain / URLs contacted:
  - evil-exfil.example.com (data upload destination)

Attack tools observed:
  - sqlmap user-agent string in web logs
```

---

## Chain of Custody

For evidence that may be used in legal proceedings, document the chain of custody:

```
Evidence Item: disk.img
Collected by: Jane Smith (Security Lead)
Date/Time: 2024-01-15 09:14:22 UTC
From system: prod-web-01 (IP: 10.0.1.5)
Method: dd via SSH to forensics server
SHA256 hash: 3a4b5c6d...
Storage location: forensics-server:/evidence/incident-2024-01/disk.img
Access log: [list who accessed the file and when]
```

---

## When to Engage External Forensics

Engage an external incident response firm when:

- Breach scope appears large (thousands of records or more)
- Regulatory notification is likely (GDPR, HIPAA, state laws)
- Litigation is possible (customer lawsuits, insurance claims)
- Internal team lacks forensic expertise
- Cyber insurance requires it
- The incident is ongoing and you need immediate containment help

Keep a retainer with an IR firm *before* an incident — response time is dramatically faster, and you've already negotiated rates. Common firms: Mandiant, CrowdStrike Services, Palo Alto Unit 42.
