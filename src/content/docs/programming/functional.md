---
title: "Functional Programming"
description: "Functional programming concepts — pure functions, immutability, higher-order functions, closures, map/filter/reduce, and composition."
---

**Functional programming (FP)** treats computation as the evaluation of mathematical functions and avoids shared mutable state. Where OOP organises code around objects, FP organises it around **transformations** — data flows through a pipeline of functions, each of which takes input and returns a new value without modifying the original.

---

## Core Ideas

### Pure Functions

A function is **pure** if:
1. Given the same inputs, it always returns the same output
2. It produces no side effects (no I/O, no mutation of external state)

```python
# Pure — result depends only on inputs
def add(a, b):
    return a + b

# Impure — reads external state; result varies
total = 0
def add_to_total(n):
    global total
    total += n   # mutates external variable — side effect
    return total
```

Pure functions are:
- **Predictable** — easy to reason about
- **Testable** — no setup or mocks needed; call with args, check return value
- **Parallelisable** — no shared state to coordinate

### Immutability

Instead of modifying data in place, create new data with the change applied.

```python
# Mutable approach — modifies the original list
def add_item(cart, item):
    cart.append(item)   # mutates — callers share the same list
    return cart

# Immutable approach — returns a new list, original unchanged
def add_item(cart, item):
    return [*cart, item]   # spread into new list

cart1 = ["apple", "banana"]
cart2 = add_item(cart1, "cherry")
print(cart1)  # ["apple", "banana"] — untouched
print(cart2)  # ["apple", "banana", "cherry"]
```

```javascript
// Immutable object update — Object.assign or spread
const user  = { name: "Alice", age: 30 };
const older = { ...user, age: 31 };   // new object, original unchanged

// Immutable array operations
const nums = [1, 2, 3, 4, 5];
const without3 = nums.filter(n => n !== 3);   // [1, 2, 4, 5]
const doubled  = nums.map(n => n * 2);        // [2, 4, 6, 8, 10]
```

---

## Higher-Order Functions

A **higher-order function** is one that either takes a function as an argument or returns a function (or both). This is possible because in FP, functions are **first-class values** — they can be assigned to variables, stored in data structures, and passed around like any other value.

### `map` — Transform Each Element

```python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
# [1, 4, 9, 16, 25]

# Python comprehension equivalent (often preferred for readability)
squares = [x**2 for x in numbers]
```

```javascript
const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(x => x ** 2);   // [1, 4, 9, 16, 25]
```

### `filter` — Keep Matching Elements

```python
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4]

evens = [x for x in numbers if x % 2 == 0]
```

```javascript
const evens = numbers.filter(x => x % 2 === 0);   // [2, 4]
```

### `reduce` — Collapse to a Single Value

```python
from functools import reduce

total = reduce(lambda acc, x: acc + x, numbers, 0)
# 15

# Python built-in equivalent
total = sum(numbers)
```

```javascript
const total = numbers.reduce((acc, x) => acc + x, 0);   // 15

// Build an object from an array
const freq = ["a","b","a","c","b","a"].reduce((acc, letter) => {
  acc[letter] = (acc[letter] ?? 0) + 1;
  return acc;
}, {});
// { a: 3, b: 2, c: 1 }
```

### Chaining

```python
# Python — chain with generator expressions
result = sum(
    x**2
    for x in range(1, 11)
    if x % 2 == 0
)
# Sum of squares of even numbers 1-10: 220
```

```javascript
// JavaScript — method chaining
const result = Array.from({ length: 10 }, (_, i) => i + 1)
  .filter(n => n % 2 === 0)
  .map(n => n ** 2)
  .reduce((sum, n) => sum + n, 0);
// 220
```

---

## Closures

A **closure** is a function that captures variables from its lexical environment (the scope it was defined in), even after that scope has exited.

```python
def make_multiplier(factor):
    def multiply(x):
        return x * factor   # captures `factor` from the enclosing scope
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)

double(5)   # 10
triple(5)   # 15
```

```javascript
function makeAdder(n) {
  return x => x + n;   // arrow function closes over `n`
}

const add5 = makeAdder(5);
add5(10);   // 15
add5(20);   // 25
```

Closures are the foundation for:
- Factory functions (as above)
- Memoisation
- Partial application and currying
- Callbacks with captured state

---

## Function Composition

Compose small, pure functions into larger pipelines. Each function's output becomes the next function's input.

```python
def compose(*fns):
    def pipeline(x):
        for fn in fns:
            x = fn(x)
        return x
    return pipeline

clean_name = compose(str.strip, str.lower, lambda s: s.replace(" ", "_"))
clean_name("  Hello World  ")   # "hello_world"
```

```javascript
const compose = (...fns) => x => fns.reduce((v, f) => f(v), x);

const processName = compose(
  s => s.trim(),
  s => s.toLowerCase(),
  s => s.replace(/\s+/g, "_"),
);
processName("  Hello World  ");   // "hello_world"
```

---

## Partial Application and Currying

**Partial application** — fix some arguments of a function, return a new function awaiting the rest.

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
cube   = partial(power, exponent=3)

square(5)   # 25
cube(3)     # 27
```

**Currying** — transform a function of `n` arguments into a chain of `n` single-argument functions.

```javascript
const add = a => b => a + b;   // curried

const add10 = add(10);
add10(5);    // 15
add10(20);   // 30

// Practical: curried validator
const validate = rule => value => rule(value)
  ? { ok: true }
  : { ok: false, error: `Failed: ${rule.name}` };

const isEmail = v => /\S+@\S+\.\S+/.test(v);
const validateEmail = validate(isEmail);
validateEmail("user@example.com");   // { ok: true }
validateEmail("not-an-email");        // { ok: false, error: "Failed: isEmail" }
```

---

## Avoiding Side Effects

Side effects are not always avoidable — programs must read from databases, write files, and call APIs. FP manages this by **pushing side effects to the boundaries** of the system and keeping the core logic pure.

```python
# Impure — mixes business logic with I/O
def process_order(order_id):
    order = db.fetch_order(order_id)          # I/O
    if order.total > 100:
        discount = order.total * 0.1
        order.total -= discount
    db.save_order(order)                      # I/O
    email.send(order.customer, "Order confirmed")  # I/O

# Better — pure core, side effects at the edges
def calculate_discount(total: float) -> float:   # pure
    return total * 0.1 if total > 100 else 0

def apply_discount(order: dict) -> dict:          # pure — returns new dict
    discount = calculate_discount(order["total"])
    return {**order, "total": order["total"] - discount}

# Side effects confined to the orchestration layer
def process_order(order_id):
    order         = db.fetch_order(order_id)       # edge: I/O in
    updated_order = apply_discount(order)          # pure transformation
    db.save_order(updated_order)                   # edge: I/O out
    email.send(updated_order["customer"], "...")   # edge: I/O out
```

---

## FP vs OOP

| | Functional | Object-Oriented |
|---|---|---|
| Core unit | Function | Object (data + behaviour) |
| State | Immutable, passed through functions | Mutable, encapsulated in objects |
| Side effects | Minimised, pushed to edges | Accepted, managed via encapsulation |
| Code reuse | Composition, higher-order functions | Inheritance, mixins |
| Testing | Easy — pure functions need no mocks | Requires DI to substitute dependencies |
| Natural fit | Data transformation pipelines, event streams | Stateful simulations, GUIs, domain modelling |

Modern languages blend both. Python, JavaScript, Kotlin, and Scala support functional and OOP style in the same codebase. The best code often uses OOP for structure and FP for transformations.

---

## Related

- [OOP](/programming/oop) — the complementary object-oriented approach
- [Design Patterns](/programming/design-patterns) — patterns like Strategy and Command borrow from FP ideas
- [Testing](/programming/testing) — pure functions are trivially unit-testable
- [Fundamentals](/programming/fundamentals) — functions and closures introduced
