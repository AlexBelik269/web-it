---
title: "Secure Coding"
description: "Secure coding practices — input validation, injection prevention, least privilege, secrets management, and common vulnerabilities with code examples."
---

Secure coding means writing code that is correct not just in the happy path, but in the presence of hostile input, misconfigured dependencies, and untrustworthy environments. Most security vulnerabilities are not sophisticated attacks — they are programming mistakes that an attacker exploits.

---

## The Golden Rules

1. **Never trust input** — validate and sanitise everything that enters your system
2. **Least privilege** — every component should have only the access it needs
3. **Fail securely** — errors should not leak information or leave the system in an exploitable state
4. **Defence in depth** — no single control should be the only line of defence
5. **Keep secrets out of code** — credentials, tokens, and keys belong in a secrets manager

---

## Input Validation

Validate all data at system boundaries: HTTP request bodies, query parameters, headers, file uploads, and responses from external APIs.

```python
from pydantic import BaseModel, EmailStr, Field, validator

class CreateUserRequest(BaseModel):
    name:  str       = Field(..., min_length=1, max_length=100)
    email: EmailStr              # validated email format
    age:   int       = Field(..., ge=0, le=150)
    role:  str       = Field("user")

    @validator("role")
    def role_must_be_allowed(cls, v):
        allowed = {"user", "moderator"}
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v

# FastAPI auto-validates and returns 422 Unprocessable Entity on failure
@app.post("/users")
async def create_user(body: CreateUserRequest):
    return user_service.create(body)
```

```javascript
// Zod — TypeScript validation
import { z } from "zod";

const CreateUserSchema = z.object({
  name:  z.string().min(1).max(100),
  email: z.string().email(),
  age:   z.number().int().min(0).max(150),
  role:  z.enum(["user", "moderator"]).default("user"),
});

app.post("/users", (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ errors: result.error.flatten() });
  }
  const user = userService.create(result.data);
  res.json(user);
});
```

**Key principles:**
- Whitelist (allow known good) rather than blacklist (block known bad)
- Validate type, length, format, and range
- Reject invalid input early — do not attempt to sanitise and continue
- Validate server-side even if you also validate client-side

---

## SQL Injection Prevention

SQL injection happens when user input is concatenated into a SQL string. **Always use parameterised queries.**

```python
# VULNERABLE — string concatenation
def find_user(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)
# Input: admin' OR '1'='1
# Query: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
# Returns all users

# SECURE — parameterised query
def find_user(username):
    return db.execute("SELECT * FROM users WHERE username = %s", (username,))

# SECURE — ORM (SQLAlchemy)
def find_user(username):
    return db.query(User).filter(User.username == username).first()
```

```javascript
// VULNERABLE
const query = `SELECT * FROM users WHERE id = ${req.params.id}`;

// SECURE — parameterised (pg / mysql2)
const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);

// SECURE — ORM (Prisma)
const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
```

See [SQL Injection](/security/web/sql-injection) for full coverage.

---

## Cross-Site Scripting (XSS) Prevention

XSS happens when user-supplied content is rendered as HTML without escaping. The attacker's script runs in the victim's browser.

```javascript
// VULNERABLE — innerHTML with user content
element.innerHTML = userInput;

// SECURE — textContent never interprets as HTML
element.textContent = userInput;

// SECURE — DOMPurify for cases where you need to allow some HTML
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userInput);
```

```python
# Flask — Jinja2 auto-escapes by default
# {{ user.name }} → escaped
# {{ user.name | safe }} → NOT escaped — avoid unless intentional

# Express — never interpolate user input into HTML strings
# Use a templating engine (Handlebars, Pug) that escapes by default
```

**Content Security Policy (CSP)** — tells the browser which sources are allowed to execute scripts, providing a second line of defence:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; object-src 'none'
```

See [XSS](/security/web/xss) for full coverage.

---

## Secrets Management

Never put secrets (passwords, API keys, tokens, private keys) in source code, config files committed to git, or environment variables that are logged.

```python
# BAD — secret hardcoded in source
db_password = "supersecret123"
api_key     = "sk-prod-abc123"

# BAD — secret in .env file committed to git
# DATABASE_PASSWORD=supersecret123

# GOOD — read from environment (set by deployment system, never committed)
import os
db_password = os.environ["DATABASE_PASSWORD"]

# BETTER — read from a secrets manager at runtime
import boto3
client = boto3.client("secretsmanager", region_name="eu-west-1")
secret = client.get_secret_value(SecretId="prod/db/password")
db_password = secret["SecretString"]
```

```bash
# Scan your repo for accidentally committed secrets
git secrets --scan
trufflehog git file://. --since-commit HEAD~10
gitleaks detect --source .
```

**Rules:**
- Add `.env` to `.gitignore` — never commit it
- Rotate any secret that has ever been committed to a repo, even briefly
- Use separate secrets per environment (dev / staging / prod)
- Audit secret access — know who read what and when

---

## Authentication and Authorisation

```python
# Always verify the JWT signature server-side
import jwt

def get_current_user(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise AuthError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthError("Invalid token")
    return payload

# Always authorise server-side — never trust client-supplied roles
@app.get("/admin/users")
def list_users(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user_service.get_all()
```

**Common mistakes:**
- Checking auth only in middleware, not in individual route handlers
- Trusting `role` from the request body instead of the authenticated session
- Using `==` instead of a constant-time comparison for tokens

---

## Dependency Security

Your application's attack surface includes all its dependencies. A vulnerability in a library you use is a vulnerability in your application.

```bash
# Scan dependencies for known CVEs
npm audit --audit-level=high    # Node.js
pip-audit                       # Python
trivy fs .                      # any project (Trivy)
grype .                         # any project (Grype)

# Keep dependencies updated — use automated PRs
# GitHub Dependabot, Renovate, or Snyk
```

**Practices:**
- Pin exact versions in lock files (`package-lock.json`, `poetry.lock`)
- Review the changelog of every dependency update — especially major versions
- Prefer widely-used, actively-maintained packages over obscure ones
- Minimise your dependency tree — each package is a potential attack vector

---

## Error Handling and Information Leakage

Stack traces, SQL errors, and internal paths must never reach users or be logged in a way that could be exfiltrated.

```python
# VULNERABLE — exposes internal error details
@app.exception_handler(Exception)
async def generic_error(request, exc):
    return JSONResponse({"error": str(exc), "traceback": traceback.format_exc()})

# SECURE — generic message to client; full detail in server logs only
@app.exception_handler(Exception)
async def generic_error(request, exc):
    request_id = str(uuid.uuid4())
    logger.exception("Unhandled error [%s]", request_id)
    return JSONResponse(
        {"error": "Internal server error", "requestId": request_id},
        status_code=500,
    )
```

---

## Least Privilege

Every component — database user, IAM role, service account, file system permission — should have only the minimum access it needs.

```sql
-- VULNERABLE — application uses root/admin DB user
-- Can read, write, drop tables, create users

-- SECURE — create a dedicated user with scoped permissions
CREATE USER app_user WITH PASSWORD 'secure-password';
GRANT SELECT, INSERT, UPDATE ON TABLE orders TO app_user;
GRANT SELECT ON TABLE users TO app_user;
-- app_user cannot DROP, CREATE, or access other tables
```

```json
// AWS IAM — scoped policy (not AdministratorAccess)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-app-uploads/*"
  }]
}
```

---

## Secure Coding Checklist

| Area | Check |
|---|---|
| Input | All user input validated server-side before use |
| SQL | Parameterised queries everywhere — no string concatenation |
| XSS | Output HTML-escaped; CSP header set |
| Auth | JWT/session verified on every protected route |
| Authz | Role/permission checked server-side, not client-supplied |
| Secrets | No credentials in source code or committed config |
| Dependencies | CVE scan running in CI; lock files committed |
| Errors | No stack traces or internal paths returned to clients |
| Logging | No passwords, tokens, or PII in logs |
| Least privilege | DB user, IAM role, and file permissions scoped to minimum |
| HTTPS | All traffic encrypted; HSTS header set |

---

## Related

- [OWASP Top 10](/security/web/owasp-top-10) — the most common web application vulnerabilities
- [SQL Injection](/security/web/sql-injection) — deep dive on injection attacks
- [XSS](/security/web/xss) — cross-site scripting attacks and defences
- [Secrets Management](/security/infrastructure/secrets-management) — managing credentials at scale
- [Error Handling](/programming/error-handling) — handling errors without leaking internals
- [Testing](/programming/testing) — writing tests for security logic (validation, auth checks)
