---
title: "Auth in Code"
description: "Complete auth middleware implementations in Express.js, FastAPI, and Go."
---

## Express.js — Complete Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `${process.env.AUTH_ISSUER}/.well-known/jwks.json`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

async function getPublicKey(header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) reject(err);
      else resolve(key.getPublicKey());
    });
  });
}

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ error: 'Malformed token' });

    const publicKey = await getPublicKey(decoded.header);

    req.user = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],        // explicit allowlist
      audience: process.env.API_AUDIENCE,
      issuer: process.env.AUTH_ISSUER,
    });

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
```

## FastAPI (Python)

```python
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class TokenData(BaseModel):
    sub: Optional[str] = None
    roles: list[str] = []


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload["iat"] = datetime.utcnow()
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, SECRET_KEY,
            algorithms=[ALGORITHM],
            audience="myapi"
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return TokenData(sub=user_id, roles=payload.get("roles", []))
    except JWTError:
        raise credentials_exception


@app.post("/auth/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user.id, "roles": user.roles})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
async def read_me(user: TokenData = Depends(get_current_user)):
    return user
```

## Go — HTTP Auth Middleware

```go
package middleware

import (
    "context"
    "net/http"
    "strings"

    "github.com/golang-jwt/jwt/v5"
)

type contextKey string
const UserKey contextKey = "user"

type Claims struct {
    Sub   string   `json:"sub"`
    Email string   `json:"email"`
    Roles []string `json:"roles"`
    jwt.RegisteredClaims
}

func AuthMiddleware(publicKey interface{}) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            authHeader := r.Header.Get("Authorization")
            if !strings.HasPrefix(authHeader, "Bearer ") {
                http.Error(w, `{"error":"missing token"}`, http.StatusUnauthorized)
                return
            }

            tokenStr := authHeader[7:]
            claims := &Claims{}

            token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
                if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
                    return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
                }
                return publicKey, nil
            }, jwt.WithAudience("myapi"), jwt.WithIssuer("https://auth.myapp.com"))

            if err != nil || !token.Valid {
                http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
                return
            }

            ctx := context.WithValue(r.Context(), UserKey, claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

// Usage in handler
func GetUser(w http.ResponseWriter, r *http.Request) {
    claims := r.Context().Value(UserKey).(*Claims)
    // claims.Sub, claims.Email, claims.Roles
}
```
