---
title: "Input Validation & Sanitization"
description: "Validating and sanitizing API input to prevent injection attacks, data corruption, and unexpected behavior."
---

Input validation is the first line of defense at the API boundary. All data from external sources — request bodies, URL parameters, query strings, headers, cookies — is untrusted until validated.

## Validation vs Sanitization

| Operation | Definition | When to use |
|---|---|---|
| **Validation** | Check that input conforms to expected format/range; reject if not | Always — at the API boundary |
| **Sanitization** | Transform input to remove or escape dangerous content | When you must accept and store rich content (HTML) |

**Prefer validation over sanitization.** If a field should be an email address, validate it as an email and reject anything that isn't. Sanitization is a fallback for cases where you genuinely need to handle user-provided HTML or markup.

---

## Schema Validation Libraries

Use a schema library — never write ad-hoc validation with `if` statements.

### Zod (TypeScript/Node.js)

```typescript
import { z } from 'zod';

const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(100),
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    country: z.string().length(2),  // ISO 3166-1 alpha-2
    postalCode: z.string().regex(/^[A-Z0-9 -]{3,10}$/i),
  }),
  couponCode: z.string().regex(/^[A-Z0-9-]{4,20}$/).optional(),
});

// In handler
app.post('/api/orders', (req, res) => {
  const result = CreateOrderSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  const order = result.data;  // TypeScript knows the exact type
});
```

### Pydantic (Python)

```python
from pydantic import BaseModel, EmailStr, field_validator, constr
from uuid import UUID
from typing import Optional

class CreateUserRequest(BaseModel):
    email: EmailStr
    name: constr(min_length=1, max_length=100)
    age: int  # Pydantic will coerce and validate

    @field_validator('age')
    @classmethod
    def must_be_adult(cls, v):
        if v < 18:
            raise ValueError('Must be 18 or older')
        return v

    model_config = {'extra': 'forbid'}  # reject unexpected fields

@app.post("/users")
async def create_user(body: CreateUserRequest):
    # body is validated and typed; FastAPI returns 422 on validation failure
    pass
```

### Joi (Node.js)

```javascript
import Joi from 'joi';

const schema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(12).max(128).required(),
  role: Joi.string().valid('user', 'viewer').default('user'),  // enum allowlist
}).options({ allowUnknown: false });  // reject extra fields

const { error, value } = schema.validate(req.body, { abortEarly: false });
if (error) {
  return res.status(400).json({ errors: error.details.map(d => d.message) });
}
```

---

## Validating Different Input Sources

### URL Path Parameters

```javascript
// Express
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  // Validate format before using in a query
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }
  // Or use Zod:
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid ID' });
});
```

### Query Parameters

```javascript
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'name', 'updated_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(100).optional(),
});

app.get('/api/users', (req, res) => {
  const result = QuerySchema.safeParse(req.query);
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() });

  const { page, limit, sort, order, search } = result.data;
  // Use validated values — sort is guaranteed to be a safe column name
});
```

**Never interpolate user-provided sort/order values directly into SQL.** Always validate against an allowlist of known column names.

### Headers

```javascript
// Validate custom headers your API relies on
const apiVersion = req.headers['x-api-version'];
if (!['1', '2'].includes(apiVersion)) {
  return res.status(400).json({ error: 'Unsupported API version' });
}
```

---

## Common Validation Rules

### Strings

```typescript
z.string()
  .min(1)           // non-empty
  .max(500)         // prevent excessive lengths
  .trim()           // normalize whitespace
  .toLowerCase()    // normalize email case
  .regex(/^[a-zA-Z0-9 '-]+$/)  // allowlist characters
```

### Emails

```typescript
z.string().email().max(254).toLowerCase().trim()
// 254 is the RFC 5321 maximum length for an email address
```

### URLs

```typescript
z.string().url().startsWith('https://')  // enforce HTTPS scheme
// Or more specific:
z.string().refine((url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_HOSTS.has(parsed.hostname);
  } catch { return false; }
}, 'Must be a valid HTTPS URL from an allowed domain')
```

**Never pass a URL from user input directly to a server-side fetch** — this is SSRF. Always validate scheme, host, and port against an allowlist.

### Numbers

```typescript
z.number().int().min(0).max(1_000_000)  // explicit bounds
z.coerce.number()  // accepts string "42" and converts; useful for query params
```

### File Uploads

```javascript
// Validate file type, size, and name
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024;  // 5 MB

function validateUpload(file) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new Error('Invalid file type');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }
  // Don't trust the original filename — generate your own
  const ext = file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
  const safeName = crypto.randomUUID() + ext;
  return safeName;
}
```

**MIME type can be spoofed** — validate the file's magic bytes (first few bytes) for sensitive operations.

---

## Sanitization: When You Need It

Sanitization is only needed when you must accept and render user-provided HTML (rich text editors, markdown with HTML support). Never sanitize as a substitute for validation.

```javascript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function sanitizeHtml(dirty) {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}
```

---

## What Happens on Failure

Return a consistent, informative but non-leaking error:

```javascript
// ✓ Helpful but not revealing
res.status(400).json({
  error: 'Validation failed',
  details: {
    email: ['Must be a valid email address'],
    age: ['Must be a number between 18 and 120'],
  }
});

// ✗ Reveals internal field names, types, or database schema
res.status(400).json({
  error: "Column 'user_email' of type VARCHAR(254) cannot accept value..."
});
```

**Never return raw database or ORM error messages to clients.**

---

## Validation Middleware Pattern

Wrap schema validation in reusable middleware:

```typescript
import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';

function validate(schema: ZodSchema) {
  return ((req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;  // replace with validated, typed data
    next();
  }) satisfies RequestHandler;
}

// Usage
app.post('/api/users', validate(CreateUserSchema), createUserHandler);
app.put('/api/orders/:id', validate(UpdateOrderSchema), updateOrderHandler);
```
