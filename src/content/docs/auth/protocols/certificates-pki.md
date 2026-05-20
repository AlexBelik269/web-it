---
title: "Certificates & PKI"
description: "Public Key Infrastructure, X.509 certificates, mTLS, and SSH key authentication."
---

## Public Key Infrastructure (PKI)

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

## X.509 Certificate Contents

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

## mTLS — Mutual TLS

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

## SSH Key Authentication

```bash
# Generate an Ed25519 key pair (preferred over RSA for new keys)
ssh-keygen -t ed25519 -C "alice@company.com"

# Public key (~/.ssh/id_ed25519.pub) — add to server's authorized_keys
# Private key (~/.ssh/id_ed25519) — never share; protect with passphrase

# Connect
ssh -i ~/.ssh/id_ed25519 user@server.com
```
