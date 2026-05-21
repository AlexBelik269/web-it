---
title: "NoSQL"
description: "NoSQL database types, MongoDB, the CAP theorem, and when to choose NoSQL over relational databases."
---

**NoSQL** ("Not Only SQL") is a broad category of databases that abandon the rigid table/row/column model in favour of flexible schemas, horizontal scaling, or specialised data models.

## NoSQL Types

| Type | Model | Best For | Examples |
|---|---|---|---|
| **Document** | JSON/BSON documents | Flexible schemas, nested data | MongoDB, CouchDB, Firestore |
| **Key-Value** | Key → arbitrary blob | Cache, sessions, counters | Redis, DynamoDB, etcd |
| **Columnar** | Column families | Analytics, write-heavy, time-series | Cassandra, HBase, BigTable |
| **Graph** | Nodes + edges | Relationships, recommendation engines | Neo4j, Amazon Neptune |
| **Search** | Inverted indexes | Full-text search | Elasticsearch, OpenSearch |

---

## MongoDB

MongoDB is the leading document database. Documents are stored as BSON (binary JSON) and grouped into **collections** (analogous to tables).

**Key concepts:**

| Concept | Equivalent in SQL |
|---|---|
| Database | Database |
| Collection | Table |
| Document | Row |
| Field | Column |
| `_id` | Primary key (auto-generated ObjectId) |
| Embedded document | JOIN (denormalised) |

**Strengths:**
- Schema-less (or schema-flexible with validation)
- Horizontal sharding built in
- Rich query language, aggregation pipeline
- Good for hierarchical/nested data

**Weaknesses:**
- No multi-document ACID transactions before v4.0 (now supported but with overhead)
- JOINs are expensive (`$lookup`); prefer embedding related data
- No foreign key enforcement by default

```js
// Insert
db.users.insertOne({ name: "Alice", email: "alice@example.com", roles: ["admin"] })

// Query with filter and projection
db.users.find({ roles: "admin" }, { name: 1, email: 1 })

// Aggregation pipeline
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$user_id", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])
```

---

## CAP Theorem

The **CAP theorem** (Brewer, 2000) states that a distributed data store can guarantee at most **two** of three properties simultaneously:

```mermaid
graph TD
    CAP["Distributed System"]
    C["Consistency\nEvery read returns\nthe latest write"]
    A["Availability\nEvery request\ngets a response"]
    P["Partition Tolerance\nSystem works despite\nnetwork splits"]

    CAP --- C
    CAP --- A
    CAP --- P

    CP["CP Systems\nMongoDB, HBase,\nZookeeper"]
    AP["AP Systems\nCassandra, CouchDB,\nDynamoDB (default)"]
    CA["CA Systems\nOnly possible with\nno network partitions\n(single node)"]

    C --- CP
    P --- CP
    A --- AP
    P --- AP
    C --- CA
    A --- CA
```

**In practice:** Network partitions happen — every distributed system must tolerate them (P is not optional). The real trade-off is **C vs A** during a partition.

| Choice | Behaviour during partition |
|---|---|
| **CP** | Returns an error or timeout rather than stale data |
| **AP** | Returns potentially stale data rather than an error |

**PACELC** extends CAP: even without partitions, there's a latency/consistency trade-off (lower latency = weaker consistency).

---

## When to Choose NoSQL

| Use NoSQL when… | Use Relational when… |
|---|---|
| Schema changes frequently | Schema is stable and well-defined |
| Data is hierarchical / nested | Data is highly relational |
| Need to shard horizontally | Vertical scaling is sufficient |
| Read/write throughput is extreme | Complex multi-table queries are required |
| Data model maps directly to documents | Strong consistency / ACID is critical |
