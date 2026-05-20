---
title: "Permissions & Scopes"
description: "Permission modeling with resource:action format, JWT permission claims, and IDOR prevention."
---

## Permission Modeling

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

## JWT with Permissions

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

## Scope Validation in Code

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

## Resource Ownership Check (prevents IDOR)

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
