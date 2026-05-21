---
title: "Programming Fundamentals"
description: "Core building blocks of programming — variables, data types, scope, loops, functions, and refactoring."
---

Every program — regardless of language or paradigm — is built from the same handful of primitives: values stored in variables, code that repeats with loops, and logic packaged into functions. Mastering these fundamentals is what makes everything else learnable.

---

## Variables

A **variable** is a named binding between an identifier and a value stored in memory.

```python
# Python
name = "Alice"       # string
age  = 30            # integer
pi   = 3.14159       # float
active = True        # boolean
tags = ["py", "js"]  # list (mutable)
```

```javascript
// JavaScript
const name = "Alice";   // block-scoped, immutable binding
let   age  = 30;        // block-scoped, mutable
var   legacy = true;    // function-scoped (avoid in modern JS)
```

### Data Types

| Category | Examples | Notes |
|---|---|---|
| Integer | `int`, `long`, `i32` | Whole numbers; width matters for overflow |
| Float | `float`, `double`, `f64` | IEEE 754; precision errors are real |
| String | `str`, `String`, `&str` | Immutable in many languages |
| Boolean | `bool` | `true` / `false` |
| Null / None | `null`, `None`, `nil` | Absence of a value — handle explicitly |
| Array / List | `[]`, `List<T>` | Ordered, indexed collection |
| Map / Dict | `{}`, `HashMap<K,V>` | Key-value pairs |

### Scope

Scope determines where a variable is visible. Most languages use **block scope** — a variable is only accessible within the `{ }` block it was declared in.

```javascript
function greet() {
  const message = "hello";  // function-scoped to greet()
  if (true) {
    const inner = "world";  // block-scoped to the if block
    console.log(message);   // OK — outer scope is visible
  }
  // console.log(inner);    // ReferenceError — inner is out of scope
}
```

**Key rules:**
- Inner scopes can read outer scopes (closure)
- Outer scopes cannot read inner scopes
- Prefer the narrowest scope possible — reduces unintended mutation

### Mutability

| | Mutable | Immutable |
|---|---|---|
| Default | Python `list`, JS `let` | Python `tuple`, JS `const` |
| Why immutable matters | Shared mutable state is a common source of bugs | Immutable values are safe to share across threads |

```python
# Mutable — list can be changed in-place
items = [1, 2, 3]
items.append(4)   # [1, 2, 3, 4]

# Immutable — tuple cannot be changed
point = (10, 20)
# point[0] = 99   # TypeError
```

---

## Loops

Loops repeat a block of code. There are three main forms.

### `for` loop — iterate over a known range or collection

```python
# Iterate over a collection
for item in ["a", "b", "c"]:
    print(item)

# Range-based
for i in range(5):   # 0, 1, 2, 3, 4
    print(i)
```

```javascript
// for...of iterates values
for (const item of ["a", "b", "c"]) {
  console.log(item);
}

// Classic index loop
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

### `while` loop — repeat while a condition is true

```python
n = 1
while n < 100:
    n *= 2
print(n)  # 128
```

Use `while` when you don't know the iteration count in advance (e.g. reading input, polling, or traversing a linked list).

### `do…while` — execute at least once

```javascript
let attempt = 0;
do {
  attempt++;
} while (attempt < 3);
```

### Loop Control

| Keyword | Effect |
|---|---|
| `break` | Exit the loop immediately |
| `continue` | Skip the rest of the current iteration, go to next |
| `return` (inside function) | Exit the loop and the enclosing function |

```python
for n in range(10):
    if n == 3:
        continue   # skip 3
    if n == 7:
        break      # stop at 7
    print(n)       # prints 0 1 2 4 5 6
```

### Common Patterns

```python
# Enumerate — index + value together
for i, val in enumerate(["a", "b", "c"]):
    print(i, val)    # 0 a / 1 b / 2 c

# List comprehension — transform while iterating
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]

# Filter in comprehension
evens = [x for x in range(10) if x % 2 == 0]  # [0, 2, 4, 6, 8]
```

---

## Functions / Methods

A **function** is a named, reusable block of code that takes inputs (parameters) and produces an output (return value). A **method** is a function attached to an object or class.

```python
def add(a: int, b: int) -> int:
    return a + b

result = add(3, 4)   # 7
```

```javascript
function add(a, b) {
  return a + b;
}

// Arrow function (same behaviour, shorter syntax)
const add = (a, b) => a + b;
```

### Parameters vs Arguments

- **Parameter** — the variable name in the function definition (`a`, `b`)
- **Argument** — the value passed when calling the function (`3`, `4`)

### Default Parameters

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")            # "Hello, Alice!"
greet("Alice", "Hi")      # "Hi, Alice!"
```

### Variadic Parameters

```python
def total(*args):          # any number of positional args
    return sum(args)

def configure(**kwargs):   # any number of keyword args
    for key, val in kwargs.items():
        print(f"{key} = {val}")

total(1, 2, 3, 4)          # 10
configure(debug=True, port=8080)
```

### Return Values

Functions should do one thing and return a single, predictable value. Avoid returning different types based on a condition — it makes callers harder to write.

```python
# Avoid — returns either a user object or None
def find_user(id):
    if id in db:
        return db[id]
    return None          # caller must always check for None

# Better — raise an exception on failure (clear intent)
def find_user(id):
    if id not in db:
        raise KeyError(f"User {id} not found")
    return db[id]
```

### Pure Functions

A **pure function** always returns the same output for the same input and has no side effects (no I/O, no mutation of shared state). Pure functions are trivially testable.

```python
# Pure
def celsius_to_fahrenheit(c):
    return c * 9/5 + 32

# Impure — reads external state, result varies
def current_temp_f():
    return fetch_sensor() * 9/5 + 32
```

### Closures

A closure is a function that captures variables from its enclosing scope.

```javascript
function makeCounter() {
  let count = 0;
  return function() {
    count += 1;
    return count;
  };
}

const counter = makeCounter();
counter();  // 1
counter();  // 2
counter();  // 3
```

---

## Refactoring

Refactoring means restructuring existing code without changing its observable behaviour. The goal is to make code easier to read, test, and modify.

### When to Refactor

- Before adding a new feature to an area of code you don't understand
- After a passing test — the tests protect against regressions while you clean up
- When you notice a code smell (see below)

### Common Code Smells

| Smell | Description | Fix |
|---|---|---|
| Long function | Does too many things | Extract into smaller functions |
| Duplicate code | Same logic in multiple places | Extract to a shared function |
| Magic number | Unexplained literal value (`60 * 60 * 24`) | Name it (`SECONDS_PER_DAY`) |
| Deep nesting | 4+ levels of `if/for` | Early return / extract function |
| Long parameter list | 5+ parameters | Group into an object/struct |
| Dead code | Unreachable or unused code | Delete it |

### Extract Function

```python
# Before — one long function
def process_order(order):
    total = 0
    for item in order.items:
        total += item.price * item.quantity
    tax = total * 0.2
    final = total + tax
    print(f"Order #{order.id}: £{final:.2f}")
    send_confirmation_email(order.customer, final)

# After — each responsibility is named
def calculate_total(items):
    return sum(item.price * item.quantity for item in items)

def apply_tax(amount, rate=0.2):
    return amount * (1 + rate)

def process_order(order):
    subtotal = calculate_total(order.items)
    final    = apply_tax(subtotal)
    print(f"Order #{order.id}: £{final:.2f}")
    send_confirmation_email(order.customer, final)
```

### Early Return (Guard Clause)

```python
# Before — arrow-shaped nesting
def process(user):
    if user is not None:
        if user.is_active:
            if user.has_permission("write"):
                do_work(user)

# After — flat, readable
def process(user):
    if user is None:
        return
    if not user.is_active:
        return
    if not user.has_permission("write"):
        return
    do_work(user)
```

### Replace Magic Number with Named Constant

```python
# Before
if age >= 18:
    ...

# After
LEGAL_DRINKING_AGE = 18
if age >= LEGAL_DRINKING_AGE:
    ...
```

### The Refactoring Rule

> Make it work. Make it right. Make it fast.

Fix correctness first (tests pass), then clarity (refactor), then performance (only if measured as a bottleneck).

---

## Related

- [Data Structures](/programming/data-structures) — how values are stored and organised
- [OOP](/programming/oop) — structuring code around objects and classes
- [Functional Programming](/programming/functional) — functions as first-class values
- [Testing](/programming/testing) — writing tests that make refactoring safe
