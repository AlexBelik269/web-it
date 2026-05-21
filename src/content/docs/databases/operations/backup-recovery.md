---
title: "Backup & Recovery"
description: "Database backup strategies, RTO/RPO, point-in-time recovery, and testing restores."
---

Backups are only valuable if you can restore from them. The goal is to meet your recovery objectives while minimising cost and operational burden.

## Key Metrics

| Metric | Definition | Example |
|---|---|---|
| **RPO** (Recovery Point Objective) | Maximum acceptable data loss | "We can lose at most 1 hour of data" |
| **RTO** (Recovery Time Objective) | Maximum acceptable downtime | "We must be back online within 30 minutes" |

Lower RPO and RTO require more expensive infrastructure (continuous replication, standby servers).

---

## Backup Types

| Type | How It Works | Pros | Cons |
|---|---|---|---|
| **Full backup** | Complete snapshot of all data | Simple to restore | Large, slow for big DBs |
| **Incremental** | Only changes since last backup | Small, fast | Restore requires full + all increments |
| **Differential** | Changes since last full backup | Faster restore than incremental | Grows larger over time |
| **Continuous / WAL archiving** | Archive transaction logs as they're written | Near-zero RPO, point-in-time recovery | Complex setup |

---

## PostgreSQL Backups

### Logical Backup — `pg_dump`

```bash
# Dump a single database
pg_dump -h localhost -U postgres -d mydb -F c -f mydb.dump

# Restore
pg_restore -h localhost -U postgres -d mydb -F c mydb.dump

# Dump all databases
pg_dumpall -h localhost -U postgres > all_databases.sql
```

`-F c` = custom format (compressed, supports parallel restore). `-F p` = plain SQL.

### Physical Backup — `pg_basebackup`

```bash
pg_basebackup -h localhost -U replication_user -D /backup/base -P -Xs -R
```

Physical backups are faster for large databases and support point-in-time recovery (PITR) when combined with WAL archiving.

### Point-in-Time Recovery (PITR)

1. Take a base backup (`pg_basebackup`)
2. Continuously archive WAL files to object storage (S3, GCS)
3. To restore: replay the base backup + WAL files up to the target timestamp

```
# postgresql.conf
archive_mode = on
archive_command = 'aws s3 cp %p s3://my-bucket/wal/%f'
```

**Tools:** **pgBackRest**, **Barman**, **WAL-G** automate this with compression, encryption, and cloud storage.

---

## MySQL Backups

```bash
# Logical backup
mysqldump -u root -p --single-transaction --all-databases > backup.sql

# Restore
mysql -u root -p < backup.sql
```

`--single-transaction` takes a consistent snapshot without locking (InnoDB only).

**Physical backup:** **Percona XtraBackup** — hot backup without locking.

**Binlog-based PITR:** Enable binary logging, archive binlog files, replay to target point.

---

## Backup Strategy Checklist

- [ ] Automate backups — never rely on manual runs
- [ ] Store backups off-site (different region or cloud account)
- [ ] Encrypt backups at rest
- [ ] Retain multiple recovery points (e.g., daily for 30 days, weekly for 12 weeks)
- [ ] Test restores regularly — a backup you've never restored is untested
- [ ] Monitor backup completion and alert on failure
- [ ] Document the restore procedure; run a drill at least annually
