---
title: "API Keys"
description: "API key design, generation, storage, and management best practices."
---

API keys are long-lived static credentials used primarily for machine-to-machine (M2M) authentication. They identify and authenticate a client application.

## Key Anatomy

Good API keys have a recognizable structure:

```
sk_live_4xK9mN2pQ7rT1vW8yA3bC6eFjH5dL0nP
│  │      └─ 32+ bytes of cryptographic randomness
│  └─ environment: live / test
└─ service prefix
```

Examples: Stripe uses `sk_live_`, GitHub uses `ghp_`, AWS uses `AKIA` prefix.

## Sending API Keys

```http
# Header-based (preferred)
Authorization: Api-Key sk_live_4xK9mN2pQ7rT1vW8yA3bC6eF
X-API-Key: sk_live_4xK9mN2pQ7rT1vW8yA3bC6eF

# Basic auth (also acceptable)
Authorization: Basic base64(api_key:)

# Query parameter (avoid — leaks in logs, browser history)
GET /endpoint?api_key=sk_live_4xK9mN2pQ7...  ← BAD
```

## Generating and Storing API Keys

```javascript
const { randomBytes } = require('crypto');

// Generate — 32 bytes = 43 base64url characters
function generateApiKey(prefix = 'sk_live') {
  const secret = randomBytes(32).toString('base64url');
  return `${prefix}_${secret}`;
}

// Store HASHED in DB — SHA-256 is fine for API keys (not passwords)
// You can use SHA-256 here because keys are long random strings,
// not user-chosen passwords that need slow hashing
function hashApiKey(key) {
  return require('crypto').createHash('sha256').update(key).digest('hex');
}

// On key creation:
const rawKey = generateApiKey();
const keyHash = hashApiKey(rawKey);
const keyPrefix = rawKey.slice(0, 12); // "sk_live_4xK9" — for display

await db.apiKeys.insert({
  hash: keyHash,
  prefix: keyPrefix,   // show user for identification
  userId: user.id,
  scopes: ['read:reports'],
  createdAt: new Date(),
});

// IMPORTANT: Return rawKey to user exactly ONCE — never store it
return { key: rawKey, prefix: keyPrefix };

// On incoming request:
const incomingKey = req.headers['x-api-key'];
const hash = hashApiKey(incomingKey);
const keyRecord = await db.apiKeys.findOne({ hash });
if (!keyRecord) throw new UnauthorizedError();
```

## API Key Best Practices

- **Show once:** Display the full key only at creation time — never again
- **Store hash:** Store SHA-256 hash in DB; keep a human-readable prefix for identification
- **Prefix by environment:** `sk_live_` vs `sk_test_` prevents accidental cross-env use
- **Scopes:** Keys should have limited scopes, not blanket admin access
- **Rotation:** Support key rotation; allow multiple active keys during rotation windows
- **Expiry:** Optionally support key expiration dates
- **Per-key audit logs:** Log every API call attributed to each key
- **Revocation:** Revoke immediately on suspected compromise
