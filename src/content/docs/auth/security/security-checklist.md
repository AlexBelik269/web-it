---
title: "Security Checklist"
description: "Pre-launch security checklist covering passwords, transport, tokens, cookies, headers, rate limiting, API keys, OAuth, and general security."
---

Use this before launching any system with authentication.

## Passwords & Credentials

- [ ] Passwords hashed with Argon2id or bcrypt (cost ≥ 12)
- [ ] Minimum password length ≥ 12 characters
- [ ] Common/breached passwords blocked (HaveIBeenPwned integration)
- [ ] Password change requires current password re-entry
- [ ] Secure password reset — time-limited tokens (≤ 1 hour), single-use, no security questions
- [ ] Account enumeration prevented — same response for "user not found" and "wrong password"

## Transport & Encryption

- [ ] HTTPS enforced everywhere, including all subdomains
- [ ] HSTS header set with `max-age=63072000; includeSubDomains; preload`
- [ ] TLS 1.2+ only — TLS 1.0/1.1 disabled
- [ ] Strong cipher suites — no RC4, DES, 3DES, export-grade ciphers
- [ ] Certificate validity monitored — alert 30 days before expiry
- [ ] HTTP → HTTPS redirect in place

## Tokens & Sessions

- [ ] Session IDs generated with CSPRNG — minimum 128 bits entropy
- [ ] Session regenerated on login, logout, and privilege changes
- [ ] Sessions server-side invalidated on logout (not just cookie cleared)
- [ ] JWT `alg` explicitly allowlisted — `none` rejected
- [ ] JWT `iss`, `aud`, `exp` validated on every request
- [ ] Access tokens have short TTL (≤ 60 minutes)
- [ ] Refresh token rotation — new refresh token on every use
- [ ] Token revocation mechanism exists for critical tokens

## Cookies

- [ ] All auth cookies have `HttpOnly` flag
- [ ] All auth cookies have `Secure` flag
- [ ] `SameSite=Lax` or `Strict` set
- [ ] Cookie `Path` scoped appropriately
- [ ] No sensitive data in cookie values (only IDs/tokens)

## Headers & CSP

- [ ] `Content-Security-Policy` header set and tested
- [ ] `X-Frame-Options: DENY` or CSP `frame-ancestors`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` restricts unused browser features
- [ ] Security headers tested with [securityheaders.com](https://securityheaders.com)

## Rate Limiting & Monitoring

- [ ] Login endpoint rate-limited per IP and per account
- [ ] Account lockout after N failed attempts with unlock flow
- [ ] CAPTCHA for high-volume or suspicious activity
- [ ] All auth events logged with timestamp, IP, user agent, outcome
- [ ] Alerts on anomalies (unusual location, many failures, impossible travel)
- [ ] Intrusion detection for credential stuffing patterns

## API & Keys

- [ ] API keys hashed in database — never stored in plaintext
- [ ] Keys shown to user only at creation — never again
- [ ] Keys have scopes — not all-or-nothing
- [ ] Keys can be revoked individually
- [ ] No secrets in source code or committed `.env` files
- [ ] Secrets stored in a secrets manager
- [ ] `.env.example` in repo (not `.env`)
- [ ] Secret scanning enabled on repository (GitHub, GitLab)

## OAuth / OIDC

- [ ] `redirect_uri` validated against exact-match allowlist
- [ ] `state` parameter used and validated (CSRF protection)
- [ ] PKCE enabled for Authorization Code flow
- [ ] `nonce` used in OIDC flows and validated
- [ ] Minimum required scopes requested
- [ ] ID token claims validated: `iss`, `aud`, `exp`, `nonce`

## General

- [ ] MFA available and enforced for sensitive accounts
- [ ] Principle of least privilege applied to all identities
- [ ] Dependency vulnerabilities scanned (Dependabot, Snyk, Trivy)
- [ ] Penetration test or security audit completed before launch
- [ ] Security incident response plan documented
- [ ] Auth-related logs retained for compliance period
