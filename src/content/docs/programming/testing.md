---
title: "Testing"
description: "Software testing strategies — unit tests, integration tests, TDD, mocking, and what to test at each level of the testing pyramid."
---

Testing is the practice of verifying that code behaves as intended. Good tests catch bugs before production, document expected behaviour, and give you confidence to refactor without fear.

---

## The Testing Pyramid

```mermaid
graph TD
    E2E["E2E / UI Tests\nSlow · Brittle · Expensive\nFew"]
    INT["Integration Tests\nVerify components working together\nModerate number"]
    UNIT["Unit Tests\nFast · Isolated · Cheap\nMany"]

    E2E --> INT --> UNIT

    style E2E fill:#8b1a1a,color:#fff
    style INT fill:#856d14,color:#fff
    style UNIT fill:#1a6b1a,color:#fff
```

| Layer | Tests | Speed | Cost | Count |
|---|---|---|---|---|
| Unit | Individual functions / classes | Milliseconds | Low | Many (hundreds) |
| Integration | Multiple components together, real DB/API | Seconds | Medium | Moderate (tens) |
| E2E / UI | Full stack through the browser | Minutes | High | Few (critical paths) |

---

## Unit Testing

A **unit test** verifies a single function, method, or class in isolation. All external dependencies (databases, APIs, file system) are replaced with **test doubles**.

### Anatomy of a Good Test (AAA)

```python
def test_apply_discount_over_100():
    # Arrange — set up inputs
    order = Order(total=120.00)

    # Act — call the code under test
    apply_discount(order)

    # Assert — verify the expected outcome
    assert order.total == 108.00   # 10% discount applied
```

### Python — pytest

```python
# src/pricing.py
def calculate_discount(total: float) -> float:
    if total >= 100:
        return total * 0.10
    return 0.0

# tests/test_pricing.py
import pytest
from src.pricing import calculate_discount

def test_no_discount_below_threshold():
    assert calculate_discount(50) == 0.0

def test_discount_at_threshold():
    assert calculate_discount(100) == 10.0

def test_discount_above_threshold():
    assert calculate_discount(200) == 20.0

@pytest.mark.parametrize("total, expected", [
    (0,   0.0),
    (99,  0.0),
    (100, 10.0),
    (150, 15.0),
])
def test_discount_parametrized(total, expected):
    assert calculate_discount(total) == expected
```

```bash
pytest tests/          # run all tests
pytest -v              # verbose output
pytest -k "discount"   # run tests matching keyword
pytest --cov=src       # coverage report
```

### JavaScript — Jest

```javascript
// src/pricing.js
export function calculateDiscount(total) {
  return total >= 100 ? total * 0.1 : 0;
}

// tests/pricing.test.js
import { calculateDiscount } from "../src/pricing";

describe("calculateDiscount", () => {
  test("returns 0 below threshold", () => {
    expect(calculateDiscount(50)).toBe(0);
  });

  test("applies 10% at and above threshold", () => {
    expect(calculateDiscount(100)).toBe(10);
    expect(calculateDiscount(200)).toBe(20);
  });

  test.each([
    [0, 0], [99, 0], [100, 10], [150, 15],
  ])("calculateDiscount(%d) === %d", (total, expected) => {
    expect(calculateDiscount(total)).toBe(expected);
  });
});
```

```bash
npx jest              # run all tests
npx jest --watch      # rerun on file change
npx jest --coverage   # coverage report
```

---

## Test Doubles

When a unit test needs to isolate the code under test from its real dependencies, you replace those dependencies with **test doubles**.

| Type | Behaviour | Use when |
|---|---|---|
| **Stub** | Returns pre-programmed values | You need a dependency to return specific data |
| **Mock** | Records interactions for verification | You need to assert *how* a dependency was called |
| **Fake** | Working but simplified implementation | You need realistic behaviour without real infrastructure |
| **Spy** | Wraps real object, records calls | You want to observe without fully replacing |

### Mocking with pytest-mock / unittest.mock

```python
from unittest.mock import MagicMock, patch
from src.notification_service import NotificationService

def test_sends_email_on_order():
    # Arrange — create mock dependencies
    mock_emailer = MagicMock()
    mock_logger  = MagicMock()
    service = NotificationService(emailer=mock_emailer, logger=mock_logger)

    # Act
    service.notify(user={"email": "alice@example.com"}, message="Order confirmed")

    # Assert — verify the mock was called correctly
    mock_emailer.send.assert_called_once_with("alice@example.com", "Order confirmed")
    mock_logger.log.assert_called_once()

def test_does_not_send_email_if_user_unsubscribed():
    mock_emailer = MagicMock()
    service = NotificationService(emailer=mock_emailer, logger=MagicMock())

    service.notify(user={"email": "bob@example.com", "unsubscribed": True}, message="...")

    mock_emailer.send.assert_not_called()
```

### Mocking with Jest

```javascript
// Auto-mock an ES module
jest.mock("../src/emailer");
import { sendEmail } from "../src/emailer";

test("sends confirmation email after checkout", async () => {
  sendEmail.mockResolvedValue({ success: true });

  await checkout({ items: ["item1"], token: "tok_123" });

  expect(sendEmail).toHaveBeenCalledWith(
    expect.stringContaining("@"),
    expect.stringContaining("confirmed"),
  );
});
```

---

## Integration Testing

Integration tests verify that **multiple components work correctly together**, often against real infrastructure (a test database, a running server).

```python
# Integration test — real database, real repository
import pytest
from src.user_repository import UserRepository
from tests.fixtures import test_db   # spins up a test Postgres instance

@pytest.fixture
def repo(test_db):
    return UserRepository(db=test_db)

def test_create_and_fetch_user(repo):
    user_id = repo.create({"name": "Alice", "email": "alice@example.com"})
    user    = repo.find_by_id(user_id)
    assert user["name"]  == "Alice"
    assert user["email"] == "alice@example.com"

def test_email_must_be_unique(repo):
    repo.create({"name": "Alice", "email": "alice@example.com"})
    with pytest.raises(IntegrityError):
        repo.create({"name": "Alice 2", "email": "alice@example.com"})
```

### HTTP Integration Tests

```python
# FastAPI / Flask — test the full HTTP layer
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_user_returns_200():
    response = client.get("/users/1", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json()["name"] == "Alice"

def test_unauthenticated_returns_401():
    response = client.get("/users/1")
    assert response.status_code == 401
```

```javascript
// Supertest — HTTP integration test for Express
const request = require("supertest");
const app     = require("../src/app");

describe("GET /users/:id", () => {
  test("returns user for valid ID", async () => {
    const res = await request(app)
      .get("/users/1")
      .set("Authorization", "Bearer test-token");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice");
  });

  test("returns 401 without token", async () => {
    const res = await request(app).get("/users/1");
    expect(res.status).toBe(401);
  });
});
```

### Test Database Strategies

| Strategy | How | Trade-off |
|---|---|---|
| Real test DB | Spin up a separate Postgres/MySQL instance in CI | Most accurate; slower to set up |
| Docker | `docker-compose up` a clean DB before tests | Reproducible; requires Docker |
| SQLite in-memory | Use a lightweight in-process DB | Fast; may miss DB-specific behaviour |
| Transactions + rollback | Wrap each test in a transaction, roll back after | Fast; keeps DB clean |

---

## Test-Driven Development (TDD)

TDD inverts the normal order: **write the test first**, watch it fail, then write just enough code to make it pass, then refactor.

```
Red → Green → Refactor

Red:     Write a failing test
Green:   Write the minimum code to pass the test
Refactor: Clean up the code without changing behaviour (tests stay green)
```

```python
# 1. RED — write a failing test for a function that doesn't exist yet
def test_password_is_strong():
    assert is_strong_password("Tr0ub4dor&3") is True
    assert is_strong_password("password123") is False
    assert is_strong_password("short")       is False

# 2. GREEN — write the minimum implementation to pass
import re

def is_strong_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

# 3. REFACTOR — improve the implementation while tests stay green
def is_strong_password(password: str) -> bool:
    checks = [
        len(password) >= 8,
        bool(re.search(r"[A-Z]", password)),
        bool(re.search(r"[0-9]", password)),
        bool(re.search(r"[^A-Za-z0-9]", password)),
    ]
    return all(checks)
```

**Benefits of TDD:**
- Tests document the intended API before it exists
- Forces you to think about the interface before the implementation
- Prevents over-engineering (you only write what tests require)
- The test suite grows in lock-step with the code

---

## What Makes a Good Test

| Property | Description |
|---|---|
| **Fast** | Runs in milliseconds — slow tests get disabled |
| **Isolated** | Does not depend on other tests or shared state |
| **Repeatable** | Same result every time, on any machine |
| **Self-validating** | Pass/fail is unambiguous — no manual inspection |
| **Focused** | Tests one specific behaviour, not multiple |

### What to Test

- Happy path — does it work for valid, expected input?
- Edge cases — empty input, zero, maximum values, boundary conditions
- Error paths — what happens when dependencies fail or inputs are invalid?
- Contract — does the public interface behave as documented?

### What Not to Test

- Implementation details (private methods, internal state)
- Third-party library behaviour (that's their test suite's job)
- Generated code or boilerplate

---

## Test Coverage

Coverage measures what percentage of your code is executed during tests. It is a useful floor (find untested branches), not a goal (100% coverage does not mean your tests are good).

```bash
# Python
pytest --cov=src --cov-report=term-missing

# JavaScript
npx jest --coverage

# Go
go test ./... -cover
```

**Practical guidance:**
- 80% coverage is a reasonable floor for business-critical code
- Focus on covering the branches that matter (error paths, edge cases)
- A test that executes code but makes no assertions provides coverage but no safety

---

## Related

- [OOP](/programming/oop) — dependency injection makes unit testing possible without real infrastructure
- [Functional Programming](/programming/functional) — pure functions are trivially testable; no mocks needed
- [Error Handling](/programming/error-handling) — test error paths, not just the happy path
- [Secure Coding](/programming/secure-coding) — security logic (validation, auth checks) deserves dedicated tests
