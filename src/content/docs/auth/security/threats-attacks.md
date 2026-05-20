---
title: "Threats & Attacks"
description: "Common auth attack vectors — credential attacks, token exploits, session hijacking, and infrastructure threats."
---

## Credential-Based Attacks

### Phishing
**What:** Fake login pages that steal credentials. Modern kits (Evilginx2) also relay 2FA codes in real-time.  
**Defense:** Passkeys (FIDO2) — keys are domain-bound; browser will not use them on a fake domain. Security keys (U2F) for second factor.

### Credential Stuffing
**What:** Billions of leaked username/password pairs exist from data breaches. Attackers run them against your login endpoint. Hit rates of 0.1–2% are devastating at scale.  
**Defense:** MFA on all accounts, rate limiting, IP reputation, breach detection API (HaveIBeenPwned), device fingerprinting, anomaly detection.

### Brute Force
**What:** Systematic guessing of passwords or PINs. Distributed attacks use thousands of IPs to bypass simple IP rate limiting.  
**Defense:** Exponential backoff, account lockout after N attempts, CAPTCHA, device fingerprinting, long random passwords.

### Password Spraying
**What:** Reverse of brute force — try one common password (e.g., `Password123!`) against many accounts. Avoids per-account lockout.  
**Defense:** Strong password policy, MFA, anomaly detection for cross-account failures.

## Token Attacks

### JWT "alg:none" Attack
**What:** If the server accepts the algorithm from the token header, an attacker sets `"alg":"none"` and removes the signature. The token validates with no cryptographic check.
```
Before: {"alg":"RS256"}.<payload>.<valid_signature>
After:  {"alg":"none"}.<modified_payload>.  ← empty signature accepted
```
**Defense:** Always specify an explicit algorithm allowlist in `jwt.verify()`. Never accept `none`.

### JWT Algorithm Confusion
**What:** RS256 → HS256 confusion. If the server has an RS256 key pair, an attacker signs a JWT with HS256 using the public key (which is public!) as the HMAC secret.  
**Defense:** Explicitly whitelist allowed algorithms. Use separate secrets/keys per algorithm type.

### Token Leakage
**What:** JWT tokens stored in `localStorage` or URL parameters leak via XSS, browser history, Referer headers, or server logs.  
**Defense:** HttpOnly cookies for refresh tokens, memory storage for access tokens, never put tokens in URLs.

### Replay Attacks
**What:** An attacker captures a valid token or signed request and replays it later.  
**Defense:** Short `exp` on access tokens, `jti` claim for one-time tokens, nonce in authentication flows, request timestamps.

## Session Attacks

### Session Hijacking
**What:** Attacker steals a session cookie via XSS, network sniffing, or log leakage.  
**Defense:** HttpOnly + Secure + SameSite cookies, HTTPS only, regenerate session ID on privilege changes.

### Session Fixation
**What:** Attacker tricks a user into using a known session ID. After login, the attacker knows the session.  
**Defense:** Always regenerate session ID on successful login (`req.session.regenerate()`).

### CSRF (Cross-Site Request Forgery)
**What:** A malicious website causes the victim's browser to make authenticated requests to your app by exploiting automatic cookie sending.
```html
<!-- Victim visits evil.com; this triggers a state change on your app -->
<img src="https://myapp.com/transfer?to=attacker&amount=1000">
```
**Defense:** `SameSite=Lax` or `Strict` cookies, CSRF tokens (double-submit cookie pattern), custom request headers (simple requests can't set custom headers cross-origin).

## Application Attacks

### IDOR (Insecure Direct Object Reference)
**What:** API uses client-supplied IDs without authorization checks. User changes `/api/orders/123` to `/api/orders/124` and accesses another user's data.  
**Defense:** Always check resource ownership in authorization layer. Never trust IDs alone.

### Privilege Escalation
**What:** User gains higher permissions than intended — vertical (user → admin) or horizontal (access another user's data).  
**Defense:** Least-privilege principle, server-side authorization on every request, re-authentication for sensitive actions.

### Open Redirect in OAuth
**What:** Unvalidated `redirect_uri` in OAuth flow lets attacker redirect authorization codes to their server.  
**Defense:** Exact-match `redirect_uri` allowlist on the auth server. Never accept wildcard or partial matches.

## Infrastructure Attacks

### SIM Swap
**What:** Attacker social-engineers mobile carrier to transfer victim's phone number to attacker's SIM. All SMS OTPs now go to attacker.  
**Defense:** Use TOTP apps or hardware keys instead of SMS 2FA. Account-level protection with carriers (SIM lock).

### Supply Chain Attack
**What:** Malicious code in a dependency (npm package, GitHub Action) exfiltrates credentials.  
**Defense:** Lock dependency versions, audit package.json regularly, use private registries, Dependabot/Renovate.

### Secrets in Git
**What:** Developer accidentally commits API keys, private keys, or passwords to a public (or private) repository.  
**Defense:** Pre-commit hooks (git-secrets, trufflehog), `.gitignore` for `.env` files, GitHub secret scanning, secret rotation on exposure.
