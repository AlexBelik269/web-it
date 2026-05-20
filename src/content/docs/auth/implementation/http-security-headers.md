---
title: "HTTP Security Headers"
description: "Essential security headers, how to set them in Express and Nginx, and the CSP nonce pattern."
---

Security headers instruct the browser on how to protect users. They are free to implement and critical for defense-in-depth.

## Essential Headers

| Header | Recommended Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years. Prevents SSL stripping. |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{n}'` | Restricts resource loading. Prevents XSS. |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Prevents clickjacking via iframes. |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing attacks. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls Referer header leakage. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables browser features you don't need. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates browsing context from cross-origin windows. |
| `Cross-Origin-Embedder-Policy` | `require-corp` | Enables SharedArrayBuffer; required for isolation. |

## Adding Headers in Code

**Express.js (using Helmet):**
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.myapp.com'],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Nginx:**
```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

## CSP Nonce Pattern (prevents inline script injection)

```javascript
// Generate a unique nonce per request
app.use((req, res, next) => {
  res.locals.nonce = require('crypto').randomBytes(16).toString('base64');
  next();
});

// Set CSP with nonce
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    `script-src 'self' 'nonce-${res.locals.nonce}'; default-src 'self'`
  );
  next();
});

// In HTML template — only scripts with the correct nonce execute
// <script nonce="<%= nonce %>">...</script>
// Injected scripts (via XSS) don't have the nonce and are blocked.
```
