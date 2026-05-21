---
title: "Database Security"
description: "Database security — users, roles, least privilege, encryption, auditing, and SQL injection prevention."
---

Databases hold the most sensitive data in a system. A compromised database typically means a compromised application. Defence-in-depth applies at every layer.

## Principle of Least Privilege

Each application or user should only have the permissions they need.

```sql
-- Postgres: create a limited application user
CREATE ROLE app_user LOGIN PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE mydb TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Read-only user for analytics / reporting
CREATE ROLE readonly_user LOGIN PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE mydb TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

Never use the `postgres` / `root` superuser account from application code.

---

## Users, Roles & Permissions

| Concept | PostgreSQL | MySQL |
|---|---|---|
| Create user | `CREATE ROLE name LOGIN` | `CREATE USER name@host` |
| Grant table access | `GRANT SELECT ON table TO role` | `GRANT SELECT ON db.table TO user` |
| Revoke access | `REVOKE SELECT ON table FROM role` | `REVOKE SELECT ON db.table FROM user` |
| View grants | `\dp tablename` | `SHOW GRANTS FOR user` |
| Row-level security | `CREATE POLICY` (Postgres) | Not native |

---

## Network Security

- **Bind to localhost** or a private network interface — never expose port `5432` / `3306` to the public internet
- Use **SSL/TLS** for all connections in transit
- Use a **VPC / private subnet** in cloud environments; access via bastion or VPN only
- Restrict client IPs in `pg_hba.conf` (Postgres) or firewall rules

```
# pg_hba.conf — allow only app server IP over SSL
hostssl  mydb  app_user  10.0.1.50/32  scram-sha-256
```

---

## Encryption

| What | How |
|---|---|
| **At rest** | OS/volume encryption (dm-crypt, EBS encryption), or Transparent Data Encryption (TDE) where supported |
| **In transit** | TLS — enforce with `ssl = on` in Postgres, `require_secure_transport = ON` in MySQL |
| **Column-level** | `pgcrypto` extension (`pgp_sym_encrypt`), or encrypt in application before storing |
| **Backup encryption** | pgBackRest/Barman support AES-256 backup encryption |

Column-level encryption for highly sensitive fields (SSN, credit card numbers) is worth the complexity — a DB dump without the key is useless.

---

## SQL Injection Prevention

SQL injection is the most common database attack. See [SQL Injection](/security/web/sql-injection) for a full reference.

**Always use parameterised queries:**

```python
# Bad — string interpolation
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# Good — parameterised
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

```sql
-- At the DB layer: use SECURITY DEFINER with caution,
-- validate inputs in stored procedures if you accept dynamic SQL
```

---

## Auditing & Monitoring

- Enable **audit logging** for sensitive operations (`CREATE USER`, `GRANT`, `DROP TABLE`, bulk deletes)
- Postgres: `pgaudit` extension logs fine-grained DDL/DML
- MySQL: `audit_log` plugin (Enterprise) or `general_log` (noisy)
- Alert on: failed logins, unusual query volumes, connections from unexpected IPs, schema changes in production

---

## Security Checklist

- [ ] Application connects with a least-privilege user
- [ ] Superuser login disabled remotely
- [ ] TLS enforced for all connections
- [ ] Database not reachable from the public internet
- [ ] Parameterised queries used everywhere (no string interpolation)
- [ ] Backups are encrypted and access-controlled
- [ ] Audit logging enabled for sensitive operations
- [ ] Passwords rotated; no shared credentials across environments
- [ ] Prod data not used in dev/staging (use anonymised copies)
