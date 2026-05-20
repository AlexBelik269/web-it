---
title: "Biometrics & Passkeys (FIDO2 / WebAuthn)"
description: "How biometric authentication works, passkey design, and implementing WebAuthn."
---

## Biometric Authentication

Biometrics verify identity using biological characteristics. Unlike passwords, they cannot be forgotten — but they also cannot be changed if compromised.

| Type | Technology | Strength | Use Case |
|---|---|---|---|
| Fingerprint | Capacitive/optical sensor | High | Mobile unlock, Touch ID |
| Face recognition | 3D structured light / IR | High | Face ID, Windows Hello |
| Iris scan | Near-infrared camera | Very high | High-security access control |
| Voice print | Neural audio matching | Medium | Phone banking, smart speakers |
| Behavioral | Typing cadence, mouse patterns | Low-medium | Continuous authentication |

**Critical:** Biometrics are used locally to unlock a key — the biometric data itself is never sent over the network. On a phone, Face ID unlocks a private key stored in the secure enclave; the server only sees a cryptographic signature.

## Passkeys (FIDO2 / WebAuthn)

Passkeys are the modern replacement for passwords. They use public-key cryptography and are phishing-resistant by design.

**Key properties:**
- **Passwordless** — no password to steal, forget, or reuse
- **Phishing-resistant** — keys are bound to the exact origin (domain); a fake site gets nothing
- **Biometric-backed** — device PIN or biometric unlocks the private key
- **Synced across devices** — via iCloud Keychain, Google Password Manager, or hardware key

## WebAuthn Registration Flow

```
1. App → Server:  "Start registration for user alice"
2. Server → App:  challenge (random nonce), relying party ID (your domain)
3. App → Device:  Request credential creation
4. Device:        Biometric/PIN check → generates public/private key pair
5. Device → App:  publicKey + attestation (signed by device)
6. App → Server:  publicKey + attestation
7. Server:        Verify attestation → store publicKey for user
```

## WebAuthn Authentication Flow

```
1. App → Server:  "Start authentication for alice"
2. Server → App:  challenge (random nonce) + allowedCredentials
3. App → Device:  Request assertion
4. Device:        Biometric/PIN unlocks private key → signs challenge
5. Device → App:  assertion (signature + authenticatorData)
6. App → Server:  assertion
7. Server:        Verify signature with stored publicKey → authenticated ✓
```

## Why Passkeys Are Phishing-Resistant

```
Attacker sets up:  https://g00gle.com  (fake Google)
User visits:       https://g00gle.com
Browser checks:   "Do I have a passkey for g00gle.com?"  → NO
Browser refuses:  Will not use the google.com passkey on a different origin

Even if the user is fooled, the browser is not.
```

## WebAuthn Code (Server-side, Node.js)

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
