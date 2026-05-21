---
title: "Database Connections"
description: "Connection pools, ORMs, query builders, transactions, migrations, and connection management patterns."
---

Database connections are expensive resources — each TCP connection + auth handshake costs ~10–50 ms and memory. Managing them correctly is the difference between a service that handles 10,000 req/s and one that exhausts connections at 100 req/s.

## Connection pooling

A connection pool maintains a set of open connections that are reused across requests. Without pooling, each request opens and closes a connection — catastrophic at scale.

```mermaid
flowchart LR
    Req1[Request 1] & Req2[Request 2] & Req3[Request 3] --> Pool
    subgraph Pool["Connection Pool (min: 5, max: 20)"]
        C1[Conn 1 — in use]
        C2[Conn 2 — in use]
        C3[Conn 3 — idle]
        C4[Conn 4 — idle]
        C5[Conn 5 — idle]
    end
    Pool --> DB[(Database)]
```

### Pool configuration

```javascript
// Node.js — pg (PostgreSQL)
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max:              20,      // max connections
    idleTimeoutMillis: 30_000, // close idle after 30s
    connectionTimeoutMillis: 5_000, // throw if can't acquire in 5s
});

// Always release — use try/finally
const client = await pool.connect();
try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
} finally {
    client.release();
}

// Or use pool.query — auto-releases
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
```

### PgBouncer

For PostgreSQL at scale, run a connection pooler like **PgBouncer** in front of your DB:

```
App instances (20 each × 10 max) → PgBouncer → PostgreSQL (max_connections 100)
= 200 app connections → 20 actual DB connections
```

PgBouncer modes:
- **Session mode** — one connection per client session (transparent)
- **Transaction mode** — pool conn only during transaction (recommended, high density)
- **Statement mode** — pool per statement (limited use)

## ORMs vs query builders vs raw SQL

| Approach | Tools | Pros | Cons |
|---|---|---|---|
| Raw SQL | `pg`, `mysql2` | Full control | Verbose, injection risk if not careful |
| Query builder | Knex.js, Kysely | Type-safe, composable | Thin abstraction |
| ORM | Prisma, TypeORM, Sequelize, SQLAlchemy, Entity Framework | Migrations, relations, less boilerplate | N+1 risk, complex queries get ugly |

### Prisma example

```typescript
// Schema (prisma/schema.prisma)
model User {
    id       Int      @id @default(autoincrement())
    email    String   @unique
    name     String?
    posts    Post[]
    createdAt DateTime @default(now())
}

model Post {
    id       Int    @id @default(autoincrement())
    title    String
    authorId Int
    author   User   @relation(fields: [authorId], references: [id])
}
```

```typescript
// Query
const users = await prisma.user.findMany({
    where: { name: { contains: 'Alice' } },
    include: { posts: { where: { published: true }, take: 5 } },
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 20,
});
```

### N+1 query problem

```typescript
// BAD — 1 query for users + N queries for posts
const users = await prisma.user.findMany();
for (const user of users) {
    user.postCount = await prisma.post.count({ where: { authorId: user.id } });
}

// GOOD — single query with join
const users = await prisma.user.findMany({
    include: { _count: { select: { posts: true } } },
});
```

## Transactions

A transaction is an atomic unit of work — all statements succeed or all are rolled back.

```javascript
// pg — manual transaction
const client = await pool.connect();
try {
    await client.query('BEGIN');

    const { rows: [order] } = await client.query(
        'INSERT INTO orders (userId, total) VALUES ($1, $2) RETURNING id',
        [userId, total]
    );

    await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE productId = $2',
        [quantity, productId]
    );

    await client.query('COMMIT');
    return order;
} catch (err) {
    await client.query('ROLLBACK');
    throw err;
} finally {
    client.release();
}
```

```typescript
// Prisma — interactive transaction
const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: { userId, total } });
    await tx.inventory.update({
        where: { productId },
        data: { quantity: { decrement: quantity } },
    });
    return order;
});
```

### Isolation levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| Read Uncommitted | Possible | Possible | Possible |
| Read Committed | Prevented | Possible | Possible |
| Repeatable Read | Prevented | Prevented | Possible |
| Serializable | Prevented | Prevented | Prevented |

Most applications use **Read Committed** (PostgreSQL default). Use **Repeatable Read** or **Serializable** for financial operations.

## Database migrations

Migrations track schema changes as version-controlled, sequential files:

```sql
-- 001_create_users.sql
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 002_add_name_to_users.sql
ALTER TABLE users ADD COLUMN name VARCHAR(255);
```

### Migration tools

| Tool | Language | Notes |
|---|---|---|
| Flyway | Java, any DB | Mature, CI-friendly |
| Liquibase | Java, any DB | XML/YAML/SQL changesets |
| Prisma Migrate | TypeScript | Integrated with Prisma ORM |
| Alembic | Python | SQLAlchemy integration |
| EF Core Migrations | C# | Entity Framework |
| golang-migrate | Go | CLI and library |

### Migration best practices

- Never edit a migration once applied — add a new one
- Make migrations idempotent where possible (`CREATE TABLE IF NOT EXISTS`)
- Separate schema migrations from data migrations
- Test rollbacks in staging before production
- Add index migrations as `CONCURRENTLY` to avoid table locks:

```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

## Connection strings and secrets

Never hardcode database credentials. Use environment variables or a secrets manager:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require&pool_max=20
```

Rotate credentials using a secrets manager (Vault, AWS Secrets Manager) without downtime:
1. Create new credentials
2. Add both old and new to DB
3. Deploy app with new credentials
4. Revoke old credentials

## Read replicas

Distribute read traffic to replica instances while writes go to the primary:

```javascript
const primary  = new Pool({ connectionString: process.env.DB_PRIMARY_URL });
const replica  = new Pool({ connectionString: process.env.DB_REPLICA_URL });

async function getUser(id) {
    return replica.query('SELECT * FROM users WHERE id = $1', [id]);
}

async function updateUser(id, data) {
    return primary.query('UPDATE users SET ... WHERE id = $1', [id]);
}
```

Replication lag (typically <1 s on same DC) means replicas may serve slightly stale data — acceptable for most reads.
