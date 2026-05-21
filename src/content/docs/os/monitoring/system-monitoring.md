---
title: "System Monitoring"
description: "Tools and metrics for monitoring CPU, memory, disk, and network on Linux and Windows — from command-line basics to what to look for."
---

System monitoring means watching key resources in real time or over time to catch issues before they become outages. The four pillars are **CPU, memory, disk, and network**.

## Linux Monitoring Tools

### top / htop — Process & Resource Overview

```bash
top    # built-in, always available
htop   # better UI (install separately)
```

**Key columns in top:**
| Column | Meaning |
|---|---|
| `%CPU` | CPU usage by this process |
| `%MEM` | Memory usage (% of RAM) |
| `RES` | Resident memory in RAM |
| `S` | State: R=running, S=sleeping, D=uninterruptible I/O wait, Z=zombie |

**Key summary lines:**
```
top - 14:22:01 up 5 days, load average: 0.52, 0.48, 0.41
Tasks: 182 total,   1 running, 181 sleeping
%Cpu(s):  4.2 us,  1.1 sy,  0.0 ni, 93.8 id,  0.7 wa
MiB Mem : 15987.7 total,  3212.4 free,  5841.0 used,  6934.3 buff/cache
```

- **load average** — avg number of processes wanting CPU in last 1/5/15 min. A value ≤ CPU count is healthy.
- **wa (iowait)** — % of CPU cycles wasted waiting for I/O. High iowait → disk bottleneck.
- **id (idle)** — CPU doing nothing.

---

### CPU

```bash
# Real-time per-core breakdown
mpstat -P ALL 1

# CPU usage summary every second
vmstat 1

# Which processes are using the most CPU right now
ps aux --sort=-%cpu | head -10
```

---

### Memory

```bash
free -h                    # RAM and swap summary
vmstat -s                  # detailed memory stats
cat /proc/meminfo          # all memory info from kernel

# Memory per process
ps aux --sort=-%mem | head -10
smem -r -k | head           # per-process memory breakdown (cleaner)
```

---

### Disk I/O

```bash
iostat -xz 1               # per-device I/O stats (extended)
iotop                      # live I/O per process (like top for disk)

# Key iostat columns
# %util — how busy the device is (100% = saturated)
# await — average I/O wait time (ms)
# r/s, w/s — reads/writes per second

df -h                      # disk space by filesystem
du -sh /var/log/* | sort -rh | head -20   # largest directories
```

---

### Network

```bash
ss -tulpn                  # listening sockets with process names
netstat -tulpn             # older equivalent
iftop                      # live bandwidth per connection
nload                      # live bandwidth per interface
ip -s link                 # packet counters per interface

# Check a specific connection
ss -tn dst 10.0.0.1
```

---

### System-wide Snapshot

```bash
sar -u 1 10    # CPU every 1s for 10s (from sysstat package)
sar -r 1 10    # memory
sar -d 1 10    # disk
sar -n DEV 1 10  # network

# dstat — combined view (install separately)
dstat -cdngy 1
```

---

## Windows Monitoring Tools

### Task Manager (`Ctrl+Shift+Esc`)

Good for quick checks:
- **Performance tab** — CPU, memory, disk, network graphs
- **Processes tab** — per-app CPU and memory
- **Startup tab** — programs that run at login

### Resource Monitor (`resmon`)

More detail than Task Manager:
- Per-process disk and network activity
- Which process has a file locked
- Open handles and network connections

### Performance Monitor (`perfmon`)

Logs metrics over time as **Performance Counters**. Useful for baselining and historical analysis.

```powershell
# Collect performance data via PowerShell
Get-Counter '\Processor(_Total)\% Processor Time' -Continuous -SampleInterval 2

Get-Counter @(
    '\Processor(_Total)\% Processor Time',
    '\Memory\Available MBytes',
    '\PhysicalDisk(_Total)\Disk Reads/sec'
) -SampleInterval 5 -MaxSamples 12
```

### Command Line

```powershell
# CPU usage
(Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue

# Memory
Get-CimInstance Win32_OperatingSystem |
    Select-Object TotalVisibleMemorySize, FreePhysicalMemory

# Disk
Get-PSDrive -PSProvider FileSystem

# Top processes by memory
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, Id, @{N='MB';E={[math]::Round($_.WorkingSet64/1MB,1)}}

# Network connections
Get-NetTCPConnection -State Established | Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort
```

---

## Key Metrics and Thresholds

| Metric | Healthy | Warning | Critical |
|---|---|---|---|
| CPU usage (sustained) | < 70% | 70–90% | > 90% |
| Load average (per core) | < 1.0 | 1.0–2.0 | > 2.0 |
| Memory available | > 20% | 10–20% | < 10% |
| Swap usage | < 20% | 20–60% | > 60% |
| Disk I/O await | < 10ms | 10–50ms | > 50ms |
| Disk utilisation | < 80% | 80–95% | > 95% |
| Disk space free | > 20% | 10–20% | < 10% |

---

## Log Files (Linux)

| File | Contents |
|---|---|
| `/var/log/syslog` (Debian) or `/var/log/messages` (RHEL) | General system messages |
| `/var/log/auth.log` | Authentication, sudo, SSH |
| `/var/log/kern.log` | Kernel messages |
| `/var/log/dmesg` | Boot-time kernel messages |
| `/var/log/nginx/` | Web server logs |
| `/var/log/apt/` | Package install history |

```bash
journalctl -xe           # recent error logs with context
journalctl -k            # kernel log
journalctl --since "1 hour ago"
journalctl -u nginx -f   # follow nginx service log
```

---

## Next Steps

- [Troubleshooting](/os/troubleshooting/troubleshooting) — using monitoring data to diagnose problems
- [Processes & Threads](/os/processes/processes-threads) — understanding what you see in top/htop
- [Services & Daemons](/os/services/services-daemons) — monitoring service health
