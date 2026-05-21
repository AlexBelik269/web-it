---
title: "Transactions"
description: "Database transactions, ACID properties, isolation levels, locks, and deadlocks."
---

A **transaction** is a unit of work that is executed atomically — either all of its changes persist, or none do.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;    -- or ROLLBACK to undo everything
```

---

## ACID Properties

| Property | Guarantee | Mechanism |
|---|---|---|
| **Atomicity** | All-or-nothing — partial writes never persist | Rollback on failure |
| **Consistency** | Constraints, triggers, and rules are never violated | Constraint checking before commit |
| **Isolation** | Concurrent transactions don't see each other's partial work | Locks or MVCC |
| **Durability** | Committed data survives crashes | Write-ahead log (WAL) |

**MVCC** (Multi-Version Concurrency Control) — used by PostgreSQL and MySQL/InnoDB — keeps old row versions so readers never block writers and vice versa.

---

## Isolation Levels

Weaker isolation = better performance but more anomalies. Stronger isolation = fewer anomalies but more contention.

### Anomalies

| Anomaly | Description |
|---|---|
| **Dirty read** | Read uncommitted data from another transaction |
| **Non-repeatable read** | Same row returns different values in the same transaction |
| **Phantom read** | A range query returns different rows on repeated execution |
| **Serialisation anomaly** | Two transactions produce a result that no serial order could produce |

### Levels vs Anomalies

| Isolation Level | Dirty Read | Non-repeatable Read | Phantom Read |
|---|---|---|---|
| **Read Uncommitted** | Possible | Possible | Possible |
| **Read Committed** | Prevented | Possible | Possible |
| **Repeatable Read** | Prevented | Prevented | Possible* |
| **Serializable** | Prevented | Prevented | Prevented |

*PostgreSQL's Repeatable Read also prevents phantoms due to MVCC snapshot semantics.

**Defaults:** PostgreSQL defaults to **Read Committed**. MySQL/InnoDB defaults to **Repeatable Read**.

```sql
-- Set for the session
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- ...
COMMIT;
```

---

## Locks

Locks coordinate concurrent access to the same data.

### Lock Types

| Lock | Also Called | Held by |
|---|---|---|
| **Shared (S)** | Read lock | Readers |
| **Exclusive (X)** | Write lock | Writers |
| **Row-level** | — | `SELECT FOR UPDATE`, `UPDATE`, `DELETE` |
| **Table-level** | — | `ALTER TABLE`, `LOCK TABLE` |
| **Advisory** | Application lock | `pg_advisory_lock()` (Postgres) |

Shared locks are compatible with each other. An exclusive lock blocks all others.

```sql
-- Lock rows for update (prevents concurrent writes to same rows)
SELECT * FROM orders WHERE id = 42 FOR UPDATE;

-- Postgres: skip locked rows (useful for job queues)
SELECT * FROM jobs WHERE status = 'pending' LIMIT 1 FOR UPDATE SKIP LOCKED;
```

### Deadlocks

A deadlock occurs when two transactions each hold a lock the other needs.

```
T1 locks row A, waits for row B
T2 locks row B, waits for row A  → deadlock
```

The database detects this and aborts one transaction (the "victim"). Your application must retry.

**Prevention:**
- Always acquire locks in the same order across transactions
- Keep transactions short
- Use `NOWAIT` or `SKIP LOCKED` where waiting is unacceptable

---

## Savepoints

Savepoints allow partial rollbacks within a transaction.

```sql
BEGIN;
  INSERT INTO audit_log ...;
  SAVEPOINT after_audit;
  
  UPDATE sensitive_table ...;
  -- something went wrong
  ROLLBACK TO after_audit;  -- undo only after the savepoint
COMMIT;
```
