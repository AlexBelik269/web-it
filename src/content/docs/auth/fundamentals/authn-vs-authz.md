---
title: "Authentication vs Authorization"
description: "Key differences between AuthN and AuthZ, and why confusing them causes security bugs."
---

These two concepts are frequently confused, with serious security consequences.

```mermaid
flowchart LR
    U([User]) -->|"Credentials\n(password, token, cert)"| AN["Authentication\nWho are you?"]
    AN -->|"❌ Unknown identity"| R401["401 Unauthorized\nMust authenticate"]
    AN -->|"✅ Identity confirmed"| AZ["Authorization\nWhat can you do?"]
    AZ -->|"❌ Not permitted"| R403["403 Forbidden\nIdentity known, access denied"]
    AZ -->|"✅ Permitted"| RES["Resource\nGranted"]
```

## Authentication (AuthN)

- **Question:** "Who are you?"
- **Happens:** First — before any resource access
- **Proven by:** Passwords, biometrics, certificates, hardware tokens, passkeys
- **Result:** A confirmed identity (e.g. `alice@company.com`, `user_id: 123`)
- **On failure:** `401 Unauthorized`
- **Protocols:** OIDC, SAML 2.0, LDAP, WebAuthn, Kerberos

## Authorization (AuthZ)

- **Question:** "What are you allowed to do?"
- **Happens:** After authentication succeeds
- **Expressed as:** Roles, scopes, permissions, ACLs, attribute policies
- **Result:** Allow or Deny for a specific operation on a specific resource
- **On failure:** `403 Forbidden`
- **Protocols:** OAuth 2.0 (authorization framework), XACML, OPA policies

## Critical Distinction: HTTP Status Codes

```mermaid
flowchart LR
    R["Request"] --> C{"Authenticated?"}
    C -->|No| E1["401 Unauthorized\nIdentity unknown\nRe-authenticate"]
    C -->|Yes| P{"Authorized?"}
    P -->|No| E2["403 Forbidden\nIdentity known\nAccess denied"]
    P -->|Yes| S["200 OK\nAccess granted"]
```

> Many APIs return `404` instead of `403` on sensitive resources to avoid leaking that the resource exists.

## Common Mistake: OAuth 2.0 is NOT Authentication

OAuth 2.0 grants a third-party app access to resources — it is an **authorization** framework. Using an OAuth access token to determine *who a user is* is incorrect and can be exploited.

**OpenID Connect (OIDC)** is the correct solution — it adds an identity layer (ID token) on top of OAuth 2.0.

```mermaid
flowchart TD
    OA["OAuth 2.0\n(Authorization)"] -->|"Adds identity layer"| OI["OpenID Connect\n(Authentication + Authorization)"]
    OA -->|"Answers"| Q1["What can this app access?"]
    OI -->|"Also answers"| Q2["Who is the user?"]
    OI --> IT["ID Token (JWT)\ncontains: sub, email, name"]
    OA --> AT["Access Token\ngrants API access"]
```
