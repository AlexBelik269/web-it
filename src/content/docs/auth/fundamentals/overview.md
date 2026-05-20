---
title: "Overview & Core Concepts"
description: "The foundational concepts behind authentication and authorization systems."
---

Authentication and authorization are the twin pillars of application security. They are distinct but work together to protect resources.

```mermaid
flowchart LR
    U([User]) -->|Credentials| AN["Authentication\nVerify identity"]
    AN -->|"Established identity\n(e.g. user_id: 123)"| AZ["Authorization\nCheck permissions"]
    AZ -->|"Token / Policy"| AC["Access Control\nAllow or Deny"]
    AC --> R[Resource]
    AN -.->|"Issues"| T["Token / Session"]
    T -.->|"Carries identity on\nsubsequent requests"| AZ
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

## The Auth Pipeline

Every authenticated request passes through this sequence:

```mermaid
flowchart TD
    P1["1. Identity Claim\nUser presents credentials or token"]
    P2["2. Authentication\nCredentials verified, identity established"]
    P3["3. Token Issuance\nAccess token + optional refresh token"]
    P4["4. Authorization\nToken claims checked against policies"]
    P5["5. Access Decision\nAllow or Deny the operation"]
    P6["6. Audit\nEvent logged: outcome, identity, resource, timestamp"]

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```
