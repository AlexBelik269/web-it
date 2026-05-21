---
title: "Error Handling"
description: "Error handling strategies — exception types, when to throw vs return, error propagation, defensive programming, and language-specific patterns."
---

Errors are inevitable. Good error handling means your program fails gracefully, gives useful feedback, and leaves the system in a consistent state.

---

## Types of Errors

| Type | Description | Examples |
|---|---|---|
| **Syntax errors** | Code that cannot be parsed | Missing bracket, typo in keyword |
| **Runtime errors** | Valid code that fails during execution | Division by zero, null dereference |
| **Logic errors** | Code runs but produces wrong results | Off-by-one, wrong formula |
| **External errors** | Failure in a system outside your code | Network timeout, disk full, DB down |

The first two are caught by compilers or at startup. Logic errors require testing to find. External errors must be handled in production.

---

## Exceptions vs Return Codes

Two broad strategies for signalling errors:

| | Exceptions | Return codes / Result types |
|---|---|---|
| Mechanism | Throw/catch mechanism unwinds the call stack | Function returns a success or error value |
| Forgettable | No — uncaught exceptions crash the program | Yes — callers can ignore error values |
| Flow | Non-linear — separates happy path from error path | Linear — every call site must check |
| Performance | Small overhead for the throw | Near zero |
| Use in | Python, Java, C#, JavaScript | Go, Rust, C |

### Exceptions (Python / JavaScript)

```python
# Raising an exception
def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    return a / b

# Catching exceptions
try:
    result = divide(10, 0)
except ZeroDivisionError as e:
    print(f"Error: {e}")
except (ValueError, TypeError) as e:
    print(f"Bad input: {e}")
else:
    print(f"Result: {result}")   # runs only if no exception
finally:
    print("Always runs — cleanup here")
```

### Result Types (Rust / Go style)

```python
# Python — simulating Result type
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")
E = TypeVar("E")

@dataclass
class Ok(Generic[T]):
    value: T

@dataclass
class Err(Generic[E]):
    error: E

def parse_age(raw: str):
    if not raw.isdigit():
        return Err("Age must be a number")
    age = int(raw)
    if age < 0 or age > 150:
        return Err("Age out of range")
    return Ok(age)

result = parse_age("30")
match result:
    case Ok(value=age):  print(f"Age: {age}")
    case Err(error=msg): print(f"Error: {msg}")
```

```go
// Go — explicit error return
func ParseAge(raw string) (int, error) {
    age, err := strconv.Atoi(raw)
    if err != nil {
        return 0, fmt.Errorf("age must be a number: %w", err)
    }
    if age < 0 || age > 150 {
        return 0, fmt.Errorf("age out of range: %d", age)
    }
    return age, nil
}

age, err := ParseAge("30")
if err != nil {
    log.Printf("invalid age: %v", err)
    return
}
```

---

## Exception Hierarchy

Python and Java both use class hierarchies for exception types. Catching a parent class catches all its children.

```python
# Python hierarchy (simplified)
BaseException
├── SystemExit
├── KeyboardInterrupt
└── Exception
    ├── ValueError        # bad value (wrong type for context)
    ├── TypeError         # wrong type entirely
    ├── KeyError          # dict key not found
    ├── IndexError        # list index out of range
    ├── FileNotFoundError # specific IOError subclass
    ├── AttributeError
    └── RuntimeError
        └── RecursionError
```

**Custom exceptions** — create your own to give callers precise error types:

```python
class AppError(Exception):
    """Base for all application errors."""

class UserNotFoundError(AppError):
    def __init__(self, user_id: int):
        super().__init__(f"User {user_id} not found")
        self.user_id = user_id

class InsufficientFundsError(AppError):
    def __init__(self, balance: float, required: float):
        super().__init__(f"Balance {balance} < required {required}")
        self.balance  = balance
        self.required = required

# Caller can catch specifically or broadly
try:
    withdraw(account, 500)
except InsufficientFundsError as e:
    show_error(f"Not enough funds. You have £{e.balance:.2f}")
except AppError as e:
    log.error(f"Application error: {e}")
```

---

## When to Throw, When to Return

| Situation | Prefer |
|---|---|
| Truly unexpected / programming error | Raise exception |
| Expected failure in business logic | Return result / error value, or raise domain exception |
| Caller can reasonably recover | Return error, let caller decide |
| Caller cannot recover | Raise exception, let it propagate |
| Public API | Document what exceptions are raised |

```python
# Good — domain exception for a recoverable, expected failure
def find_user(user_id: int) -> User:
    user = db.query("SELECT * FROM users WHERE id = %s", user_id)
    if user is None:
        raise UserNotFoundError(user_id)   # callers can catch this
    return user

# Bad — catching and swallowing an exception with no action
try:
    result = parse_data(raw)
except Exception:
    pass   # silent failure — the error is lost
```

---

## Error Propagation

Errors often originate deep in a call stack and need to travel up to a layer that can handle them meaningfully.

```python
# Wrapping — add context as the error travels up
def load_config(path: str) -> dict:
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise ConfigError(f"Config file not found: {path}") from None
    except json.JSONDecodeError as e:
        raise ConfigError(f"Invalid JSON in config {path}: {e}") from e

# Python `raise X from Y` — attaches the original exception as __cause__
```

```javascript
// JavaScript — async error propagation
async function loadUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new ApiError(`Failed to load user ${id}`, response.status);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;  // re-raise domain error
    throw new ApiError(`Unexpected error loading user: ${err.message}`, 500);
  }
}
```

---

## Defensive Programming

Catch potential errors before they become exceptions.

```python
# Validate at system boundaries (user input, API responses)
def create_user(name: str, email: str, age: int) -> User:
    if not name or not name.strip():
        raise ValueError("Name is required")
    if "@" not in email:
        raise ValueError(f"Invalid email: {email!r}")
    if not 0 <= age <= 150:
        raise ValueError(f"Age out of range: {age}")
    return User(name=name.strip(), email=email.lower(), age=age)
```

**Guard clauses** — fail fast at the top of a function rather than deep inside:

```python
def process_payment(order, card):
    if order is None:
        raise ValueError("Order is required")
    if order.total <= 0:
        raise ValueError(f"Invalid order total: {order.total}")
    if card is None or not card.is_valid():
        raise PaymentError("Invalid payment card")
    # happy path continues here...
```

---

## Logging Errors

Log enough to diagnose the problem. Never log sensitive data.

```python
import logging

logger = logging.getLogger(__name__)

def process_order(order_id: int) -> None:
    try:
        order = order_service.fetch(order_id)
        payment.charge(order.total)
    except PaymentDeclinedError as e:
        logger.warning("Payment declined for order %d: %s", order_id, e)
        raise
    except Exception as e:
        logger.exception("Unexpected error processing order %d", order_id)
        raise

# logger.exception() automatically includes the full stack trace
# Don't log passwords, tokens, card numbers, or PII
```

---

## Language Patterns at a Glance

| Language | Pattern | Notes |
|---|---|---|
| Python | `try / except / else / finally` | Exception hierarchy; use specific types |
| JavaScript | `try / catch / finally`, Promise `.catch()` | Always handle rejected promises |
| TypeScript | Same as JS + `never` return type for unreachable | Use `unknown` in catch, not `any` |
| Go | `val, err := fn()` — check `err != nil` | Explicit, no exceptions |
| Rust | `Result<T, E>` — `.unwrap()` only in tests | Compiler enforces handling |
| Java | Checked vs unchecked exceptions | Checked must be declared or caught |

```typescript
// TypeScript — catch type is `unknown`, not `any`
try {
  await riskyOperation();
} catch (err: unknown) {
  if (err instanceof NetworkError) {
    handleNetworkError(err);
  } else if (err instanceof Error) {
    logger.error(err.message);
  } else {
    logger.error("Unknown error", err);
  }
}
```

---

## Related

- [Testing](/programming/testing) — test error paths, not just the happy path
- [Secure Coding](/programming/secure-coding) — never expose internal error details to users
- [Security / Logging & Monitoring](/security/incident-response/logging-monitoring) — structured error logging for production
