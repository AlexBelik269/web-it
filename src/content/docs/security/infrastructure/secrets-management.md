---
title: "Secrets Management"
description: "How to handle API keys, database passwords, certificates, and other secrets across environments and deployments."
---

A secret is any value that grants access or provides cryptographic capability: passwords, API keys, database credentials, private keys, tokens, connection strings. Mismanaged secrets are one of the most common causes of breaches.

## The Problem with Common Approaches

| Approach | Problem |
|---|---|
| Hardcoded in source | Anyone with repo access has the secret; exposed in git history forever |
| `.env` files in source | Accidentally committed; not rotatable without code deploy |
| Passed as CLI arguments | Appear in process list, shell history, CI/CD logs |
| Stored in database | Stolen in a database dump; DB credentials needed to read DB credentials |
| Emailed or Slacked | No audit trail; impossible to revoke; lives in inboxes |

---

## The Correct Pattern: External Secrets Store

Applications should fetch secrets at runtime from a dedicated secrets manager.

```mermaid
flowchart TD
    subgraph Build["Build Time"]
        CODE[App Code]
        IMG[Container Image]
        Note1["⚠ No secrets here"]
    end
    subgraph Runtime["Runtime"]
        AGENT["Vault Agent / SDK\nauthenticates via IAM role"]
        MEM["In-Memory Secret\nnever written to disk"]
        APP[Application Process]
    end
    subgraph Vault["Secrets Store"]
        VS[("Vault / KMS\nHashiCorp / AWS / GCP")]
    end

    CODE --> IMG
    IMG --> AGENT
    AGENT -->|"authenticate via\nIAM / K8s service account"| VS
    VS -->|fetch secret at startup| MEM
    MEM --> APP
    APP -->|uses secret in memory| APP

    style Note1 fill:#f8d7da,stroke:#dc3545
    style VS fill:#fff3cd,stroke:#856404
    style MEM fill:#d4edda,stroke:#28a745
``` The application never stores secrets durably — only the secrets manager does.

```
Build time:    App code + config (no secrets)
         ↓
Runtime:       App starts → fetches secrets from Vault/KMS → uses in memory → never persists
         ↓
Rotate:        Update secret in Vault → restart/reload app → old secret no longer used
```

---

## Tools

### HashiCorp Vault

The most widely used self-hosted secrets manager. Supports static secrets, dynamic secrets (generates short-lived credentials on demand), transit encryption, and PKI.

```bash
# Store a secret
vault kv put secret/myapp/db password="s3cr3t!" host="db.internal"

# Read a secret (in app startup)
vault kv get -format=json secret/myapp/db | jq -r '.data.data.password'
```

```javascript
// Node.js — read from Vault at startup
import vault from 'node-vault';

const client = vault({ endpoint: 'https://vault.internal', token: process.env.VAULT_TOKEN });
const { data } = await client.read('secret/data/myapp/db');

const DB_PASSWORD = data.data.password;  // use in memory; never log or persist
```

**Dynamic database credentials** — Vault generates a unique, time-limited credential per request:
```bash
# Vault generates a Postgres user valid for 1 hour
vault read database/creds/my-app-role
# Key             Value
# username        v-app-AbCdEfGh
# password        A1B2-C3D4-E5F6
# lease_duration  1h
```

### AWS Secrets Manager

Managed service with built-in rotation automation:

```javascript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const response = await client.send(new GetSecretValueCommand({
  SecretId: 'prod/myapp/db',
}));

const secret = JSON.parse(response.SecretString);
const { host, username, password } = secret;
```

Configure automatic rotation (Secrets Manager calls a Lambda to rotate the secret):
```json
{
  "RotationRules": {
    "AutomaticallyAfterDays": 30
  }
}
```

### Kubernetes Secrets

Kubernetes has a built-in Secret resource. It is base64-encoded (not encrypted) by default — you must enable etcd encryption at rest and use an external secrets operator for production workloads.

```yaml
# Store a secret
kubectl create secret generic db-creds \
  --from-literal=password='s3cr3t'

# Mount in a pod (env var)
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-creds
        key: password
```

**External Secrets Operator** — syncs secrets from Vault/AWS/GCP into Kubernetes Secrets:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-creds
spec:
  secretStoreRef:
    name: vault-backend
  target:
    name: db-creds
  data:
    - secretKey: password
      remoteRef:
        key: secret/myapp/db
        property: password
```

---

## Secret Classification

Not all secrets are equal risk:

| Tier | Examples | Rotation | Storage |
|---|---|---|---|
| Critical | Root CA key, KMS master key, HSM PIN | Never regular use; HSM-backed | HSM only |
| High | DB root password, signing keys, OAuth client secrets | 30–90 days | Secrets manager |
| Medium | App database credentials, internal API keys | 90 days | Secrets manager |
| Low | Non-production API keys, internal webhook tokens | 6–12 months | Secrets manager or env vars |

---

## Secret Zero Problem

Every secrets manager requires some initial credential to authenticate — the "secret zero." Strategies:

1. **Cloud IAM:** No secret needed — EC2/Lambda/GKE instances authenticate via their cloud identity (instance role, service account). The credentials are injected by the platform, not your code.

```javascript
// No credentials needed — uses EC2 instance role
const client = new SecretsManagerClient({ region: 'us-east-1' });
// SDK automatically uses the instance metadata service
```

2. **Vault Agent:** Runs alongside the app, authenticates to Vault using a platform identity (AWS IAM role, Kubernetes service account), and writes secrets to a local file or environment.

3. **Sealed bootstrap:** A Vault-wrapped token or SPIFFE SVID is pre-deployed during provisioning, used once to obtain long-term credentials.

---

## Environment Variables: Rules

Environment variables are acceptable for low-sensitivity secrets and local development:

**Do:**
```bash
# .env (local dev only — never commit)
DATABASE_URL=postgres://localhost/mydb
API_KEY=dev-key-not-real
```

**Don't:**
```bash
# ✗ Don't log env at startup
env  # leaks all secrets to stdout

# ✗ Don't pass secrets as CLI args (visible in ps output)
myapp --db-password=s3cr3t

# ✗ Don't set in Dockerfile ENV
ENV DB_PASSWORD=s3cr3t  # baked into image layers
```

**Do use `.gitignore`:**
```
.env
.env.*
!.env.example  # only the template is committed
```

---

## Detection: Find Leaked Secrets

### Pre-commit Scanning

```bash
# Install git-secrets (AWS)
git secrets --install
git secrets --register-aws

# Or use gitleaks
gitleaks detect --source . --verbose
```

### CI/CD Scanning

Add to your pipeline:
```yaml
# GitHub Actions
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2
```

### Repo-Wide Historical Scan

```bash
gitleaks detect --source . --log-opts="--all"  # scan all commits
trufflehog git file://. --since-commit HEAD~50 --only-verified
```

### GitHub Secret Scanning

GitHub automatically scans public repos and notifies service providers when their secret format is detected. Enable it for private repos in **Settings → Security → Secret scanning**.

---

## Incident Response: Leaked Secret

If a secret is exposed (committed to git, logged, found in a dump):

1. **Rotate immediately** — treat the secret as compromised; generate a new one
2. **Revoke the old secret** — disable the API key, invalidate the token, change the password
3. **Audit usage** — check logs for any unauthorized use of the exposed secret
4. **Remove from git history** — `git filter-repo --path .env --invert-paths` then force-push (coordinate with team)
5. **Notify the provider** — for third-party API keys, notify the provider; they may already have detected it
6. **Root-cause fix** — why was the secret in code in the first place? Fix the process

Removing from git history does not help if the repo is public — GitHub caches commit contents, and bots continuously scrape public commits for secrets within seconds of push.
