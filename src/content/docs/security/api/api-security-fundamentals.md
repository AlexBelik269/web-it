---
title: "API Security Fundamentals"
description: "Core security controls for REST APIs — authentication, authorization, transport security, and common attack patterns."
---

APIs are the primary attack surface for modern applications. Unlike web UIs, APIs are directly machine-readable, making automated exploitation easy. Every API endpoint needs explicit security controls.

## Transport Security

All API traffic must use TLS 1.2 or higher. No exceptions.

```nginx
# Nginx — reject non-TLS and older TLS versions
server {
    listen 443 ssl http2;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    # HSTS — tell browsers to always use HTTPS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

server {
    listen 80;
    return 301 https://$host$request_uri;  # redirect HTTP to HTTPS
}
```

---

## Authentication

Every API endpoint should require authentication unless explicitly public. See the [Auth section](/auth) for full coverage — quick reference:

| Scenario | Mechanism |
|---|---|
| User-facing API (web/mobile) | Short-lived JWT access tokens + refresh token rotation |
| Server-to-server | API keys or mTLS client certificates |
| Third-party integrations | OAuth 2.0 (client credentials flow for M2M, auth code for user-delegated) |
| Internal microservices | mTLS via service mesh (Istio, Linkerd) |

```javascript
// Express — auth middleware applied globally
app.use('/api', requireAuth);

// Then explicitly opt-out for public endpoints
app.get('/api/health', skipAuth, healthHandler);
app.post('/api/auth/login', skipAuth, loginHandler);
```

Never rely on the client to tell you whether they're authenticated. Always validate the token server-side on every request.

---

## Authorization: Enforce on Every Request

Authentication proves who you are; authorization enforces what you're allowed to do. Both must happen server-side.

```javascript
// ✗ Missing ownership check — IDOR vulnerability
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);  // returns any user's order if they know the ID
});

// ✓ Ownership check
app.get('/api/orders/:id', async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id,  // must match authenticated user
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});
```

**Common authorization failures:**
- **IDOR (Insecure Direct Object Reference):** Using sequential IDs that can be guessed; no ownership check
- **Missing function-level authorization:** Endpoint exists but no role check (e.g., `/api/admin/users` accessible by any user)
- **Mass assignment:** Binding all request fields to a model, including fields like `role` or `isAdmin`

```javascript
// ✗ Mass assignment — user can set their own role
const user = await User.create(req.body);

// ✓ Allowlist only expected fields
const { email, name, password } = req.body;
const user = await User.create({ email, name, password });
```

---

## Input Validation

Validate all incoming data at the API boundary. Never trust client input.

See [Input Validation](/security/api/input-validation) for full coverage. Key principles:

- Validate type, format, length, and range for all fields
- Use a schema validation library (Zod, Joi, Yup, Pydantic)
- Reject unexpected fields (strict mode)
- Return consistent 400 errors on validation failure

```javascript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100),
  age: z.number().int().min(18).max(120),
});

app.post('/api/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  // result.data is typed and validated
});
```

---

## Rate Limiting

Rate limiting prevents brute force, credential stuffing, scraping, and denial of service.

See [Rate Limiting](/security/api/rate-limiting) for full coverage. Apply different limits by endpoint sensitivity:

```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per window
  standardHeaders: true,
  store: new RedisStore({ client: redisClient }),
  handler: (req, res) => res.status(429).json({ error: 'Too many attempts' }),
});

// General API limit
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

---

## Error Handling

Errors must not leak implementation details:

```javascript
// ✗ Leaks stack trace, file paths, database schema
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// ✓ Generic client error; detailed server log
app.use((err, req, res, next) => {
  const id = crypto.randomUUID();
  logger.error({ err, requestId: id }, 'Unhandled error');
  res.status(500).json({ error: 'An unexpected error occurred', requestId: id });
});
```

**Consistent error format:** Don't reveal whether a user exists ("No account found" vs "Wrong password" — both should say "Invalid credentials").

**HTTP status codes matter:**
- `400` — bad input (validation failure)
- `401` — not authenticated
- `403` — authenticated but not authorized
- `404` — resource not found (use this even for unauthorized resources to avoid enumeration)
- `429` — rate limited
- `500` — server error (never include internal details)

---

## API Versioning and Deprecation

Versioning enables you to change APIs without breaking clients, and to retire old versions that may have known vulnerabilities.

```
https://api.example.com/v1/users
https://api.example.com/v2/users  (breaking change)
```

Set sunset headers on deprecated versions:

```
Deprecation: Tue, 31 Dec 2024 00:00:00 GMT
Sunset: Mon, 30 Jun 2025 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="successor-version"
```

---

## Security Headers for APIs

Even APIs (JSON endpoints) need security headers:

```javascript
import helmet from 'helmet';

// For JSON APIs — some browser-focused headers less relevant but still good practice
app.use(helmet({
  contentSecurityPolicy: false,  // not needed for JSON APIs
  crossOriginEmbedderPolicy: false,
}));

// Or set manually
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');    // prevent caching of sensitive data
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
```

---

## GraphQL-Specific Security

GraphQL APIs have unique risks:

- **Introspection in production:** Disable or restrict it — it exposes your entire schema to attackers
- **Query depth limiting:** Prevent deeply nested queries that cause database storms
- **Query complexity limiting:** Limit total query cost to prevent resource exhaustion
- **Batching attacks:** Attackers can run many queries in one request; apply rate limiting to resolvers

```javascript
import { depthLimit } from 'graphql-depth-limit';
import { createComplexityRule } from 'graphql-query-complexity';

const server = new ApolloServer({
  validationRules: [
    depthLimit(5),  // max query depth
    createComplexityRule({ maxComplexity: 1000 }),
  ],
  introspection: process.env.NODE_ENV !== 'production',
});
```

---

## API Security Checklist

- [ ] All endpoints use TLS; HTTP redirected to HTTPS
- [ ] Every endpoint authenticated except explicitly public ones
- [ ] Authorization checks on every resource access (ownership + role)
- [ ] Input validated with a schema library on every endpoint
- [ ] Rate limiting applied — tighter on auth endpoints
- [ ] No internal errors or stack traces exposed to clients
- [ ] Consistent error responses (no user enumeration via error messages)
- [ ] Security headers set on all responses
- [ ] API keys and tokens never logged
- [ ] Versioning with defined deprecation/sunset dates for old versions
