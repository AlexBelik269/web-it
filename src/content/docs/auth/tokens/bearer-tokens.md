---
title: "Bearer Tokens"
description: "How bearer authentication works, access vs refresh tokens, and the refresh flow."
---

Bearer tokens implement the principle: "whoever bears (holds) this token gets access." They are the dominant API authentication mechanism, defined in RFC 6750.

## How Bearer Auth Works

```
Client → POST /auth/login → Auth Server
                         ← { access_token, refresh_token, expires_in }

Client → GET /api/users (Authorization: Bearer <token>) → Resource API
                                                        ← 200 { data }
                                                        ← 401 { expired }
```

## Request Format

```http
GET /api/users/me HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json
```

**Rules:**
- Always use the `Authorization` header — never query parameters (they appear in server logs)
- Always use HTTPS — bearer tokens in plain HTTP are trivially intercepted
- The scheme `Bearer` is case-insensitive but `Bearer` is conventional

## Bearer Token in Code

**JavaScript / fetch:**
```javascript
const response = await fetch('https://api.example.com/users/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});

if (response.status === 401) {
  // Token expired — try refreshing
  const newToken = await refreshAccessToken();
  // Retry request with new token
}

if (response.status === 403) {
  // Authenticated but not authorized for this resource
}
```

**Python — requests:**
```python
import requests

response = requests.get(
    'https://api.example.com/users/me',
    headers={'Authorization': f'Bearer {access_token}'}
)
```

**cURL:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
     https://api.example.com/users/me
```

## Access Token vs Refresh Token

| Property | Access Token | Refresh Token |
|---|---|---|
| **Lifetime** | Short: 5–60 minutes | Long: hours to months |
| **Purpose** | Authorizes API calls (sent every request) | Gets new access tokens without re-login |
| **Sent to** | Resource servers (APIs) | Auth server only |
| **Storage** | Memory (JS) or secure storage | HttpOnly cookie or secure encrypted storage |
| **Format** | Usually JWT (self-contained) | Usually opaque (random string + DB lookup) |
| **On compromise** | Expires soon | Must revoke immediately |
| **Rotation** | Issued fresh by refresh flow | Rotate on every use (refresh token rotation) |

## Refresh Token Flow

```javascript
async function callApiWithRefresh(url) {
  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` }
  });

  if (response.status === 401) {
    // Try to get a new access token using the refresh token
    const refreshed = await fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends HttpOnly refresh token cookie
    });

    if (!refreshed.ok) {
      // Refresh token expired/revoked — user must log in again
      redirectToLogin();
      return;
    }

    const { access_token } = await refreshed.json();
    setAccessToken(access_token);

    // Retry original request
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
  }

  return response;
}
```
