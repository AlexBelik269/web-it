---
title: "Sessions & Cookies"
description: "Session-based authentication, cookie security attributes, and session management with Redis."
---

## Session-Based Authentication

In session-based auth, user data lives on the server. The browser holds only a session ID (a random string) in a cookie.

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server
    participant DB as Session Store<br/>Redis

    B->>S: POST /login { email, password }
    S->>S: Validate credentials
    S->>DB: Store session: sess_abc123 → { userId, role }
    S-->>B: Set-Cookie: session=sess_abc123, HttpOnly, Secure, SameSite=Lax

    B->>S: GET /dashboard<br/>Cookie: session=sess_abc123
    S->>DB: Lookup sess_abc123
    DB-->>S: { userId: "123", role: "admin" }
    S-->>B: 200 Dashboard

    B->>S: POST /logout
    S->>DB: Delete sess_abc123
    S-->>B: Set-Cookie: session=, Max-Age=0
```

## Cookie Security Attributes

| Attribute | Value | Effect |
|---|---|---|
| `HttpOnly` | (flag) | JavaScript cannot access `document.cookie`. **Prevents XSS token theft.** Always set. |
| `Secure` | (flag) | Cookie only sent over HTTPS. **Prevents interception over HTTP. Always set in production.** |
| `SameSite=Strict` | Strict | Cookie never sent in cross-site requests. Maximum CSRF protection. May break cross-origin OAuth flows. |
| `SameSite=Lax` | Lax | Sent on same-site requests + top-level navigations (GET). **Recommended default.** Breaks most CSRF attacks. |
| `SameSite=None` | None | Sent in all contexts (cross-site). Required for third-party cookies. Must also set `Secure`. |
| `Max-Age` | Seconds | Persistent cookie — survives browser close. `Max-Age=0` deletes cookie. |
| `Expires` | Date | Alternative to Max-Age. Prefer Max-Age (relative, not clock-dependent). |
| `Domain` | domain.com | Which hosts receive the cookie. Omit to restrict to exact hostname. |
| `Path` | /path | Restrict cookie to a URL path. Use `/` for app-wide. |

**Recommended session cookie:**
```http
Set-Cookie: session=sess_abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/
```

## Session vs JWT

| | Server Session | JWT (Stateless) |
|---|---|---|
| **Data location** | Server (Redis, database) | Inside the token (client) |
| **Revocation** | Instant — delete session | Hard — must wait for expiry or use allowlist |
| **Scalability** | Requires shared session store | Scales horizontally without shared state |
| **Cookie size** | Tiny (just a random ID) | Large (100–500+ bytes) |
| **Inspection** | Requires DB lookup | Decoded anywhere (but tampering detected) |
| **Best for** | Traditional web apps, admin panels | APIs, microservices, distributed systems |

## Session Management Code

**Node.js with express-session + Redis:**
```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  // rotate periodically
  name: 'sid',                          // don't leak 'connect.sid' default
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Login
app.post('/auth/login', async (req, res) => {
  const user = await authenticateUser(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  // Regenerate session ID on login to prevent session fixation
  req.session.regenerate((err) => {
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ success: true });
  });
});

// Logout
app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('sid');
    res.json({ success: true });
  });
});
```
