---
title: "RBAC & ABAC"
description: "Role-Based and Attribute-Based Access Control — models, code examples, and when to use each."
---

## Role-Based Access Control (RBAC)

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

## Attribute-Based Access Control (ABAC)

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

## RBAC vs ABAC

| | RBAC | ABAC |
|---|---|---|
| **Complexity** | Simple | Complex |
| **Flexibility** | Lower (role boundaries) | Very high (any attribute combination) |
| **Auditability** | Easy (roles are clear) | Harder (many policy conditions) |
| **Best for** | Most apps; clear role boundaries | Complex orgs; context-sensitive access |
| **Example tools** | Casbin, built-in middleware | OPA (Open Policy Agent), AWS IAM |
