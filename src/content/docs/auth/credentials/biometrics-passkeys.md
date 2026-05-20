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

```mermaid
sequenceDiagram
    participant B as Browser / App
    participant D as Device\n(Secure Enclave)
    participant S as Server

    B->>S: Start registration (username)
    S-->>B: challenge (nonce) + rpID (your domain)
    B->>D: navigator.credentials.create()
    D->>D: Biometric / PIN verification
    D->>D: Generate public/private key pair\n(private key never leaves device)
    D-->>B: publicKey + attestation
    B->>S: Send publicKey + attestation
    S->>S: Verify attestation signature
    S->>S: Store publicKey for user
    S-->>B: Registration complete ✓
```

## WebAuthn Authentication Flow

```mermaid
sequenceDiagram
    participant B as Browser / App
    participant D as Device\n(Secure Enclave)
    participant S as Server

    B->>S: Start authentication (username)
    S-->>B: challenge (nonce) + allowedCredentials
    B->>D: navigator.credentials.get()
    D->>D: Biometric / PIN unlocks private key
    D->>D: Sign challenge with private key
    D-->>B: assertion (signature + authenticatorData)
    B->>S: Send assertion
    S->>S: Verify signature with stored publicKey
    S-->>B: Authenticated ✓
```

## Why Passkeys Are Phishing-Resistant

```mermaid
flowchart TD
    A["Attacker creates fake site\nhttps://g00gle.com"] --> V["Victim visits fake site"]
    V --> BR["Browser checks:\nDo I have a passkey for g00gle.com?"]
    BR -->|No passkey for this origin| REF["❌ Browser refuses\nWill not use google.com\npasskey on different origin"]
    BR -->|Real site google.com| OK["✅ Passkey found\nSigns challenge"]

    note["Even if the user is fooled,\nthe browser is not.\nOrigin binding is enforced\ncryptographically."]
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
