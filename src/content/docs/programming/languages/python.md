---
title: "Python"
description: "Python language fundamentals — syntax, variables, functions, common pitfalls, and practical patterns."
---

Python is an interpreted, dynamically typed, high-level language designed for readability. It uses **indentation** (not braces) to define code blocks — whitespace is syntax. Python is the dominant language for data science, scripting, automation, and AI/ML, and is widely used for web backends (Django, FastAPI).

**Key traits:** concise syntax · duck typing · batteries-included stdlib · slow single-threaded execution (CPython GIL) · interactive REPL · huge package ecosystem (pip).

---

## Hello World

```python
print("Hello, World!")
```

That's it. No class, no `main`, no semicolons. Python files can be run top-to-bottom as scripts.

```python
# Run only when executed directly, not when imported as a module
if __name__ == "__main__":
    print("Hello, World!")
```

---

## Variables & Data Types

Python is **dynamically typed** — types are inferred at runtime. Variables are just names bound to objects.

```python
age    = 30          # int
pi     = 3.14159     # float
active = True        # bool (capital T/F)
name   = "Alice"     # str
empty  = None        # NoneType (Python's null)

# Type annotations (optional, for readability / tooling)
score: int   = 95
label: str   = "test"

# Multiple assignment
x, y, z = 1, 2, 3
a = b = c = 0

# Strings
greeting = f"Hello, {name}! Age: {age}"   # f-string (Python 3.6+)
multi    = """
This is a
multi-line string.
"""

# Type check
print(type(age))    # <class 'int'>
print(isinstance(age, int))  # True
```

### Common Types

```python
# Lists (mutable, ordered)
nums = [1, 2, 3, 4, 5]
nums.append(6)
nums[0] = 10

# Tuples (immutable, ordered)
point = (10, 20)
x, y  = point       # unpacking

# Dictionaries (key-value, ordered in Python 3.7+)
person = {"name": "Alice", "age": 30}
person["city"] = "Berlin"
age = person.get("age", 0)   # safe get with default

# Sets (unordered, unique)
tags = {"python", "web", "python"}   # {"python", "web"}

# List comprehension
squares  = [x**2 for x in range(10)]
evens    = [x for x in range(20) if x % 2 == 0]
flat     = [n for row in [[1,2],[3,4]] for n in row]
```

---

## User Input

```python
name = input("Enter your name: ")  # always returns a string

try:
    age = int(input("Enter your age: "))
    print(f"Hello {name}, you are {age} years old.")
except ValueError:
    print("Invalid age — please enter a number.")
```

---

## Functions

```python
# Basic function
def add(a, b):
    return a + b

# Default arguments
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# *args — variable positional arguments
def total(*numbers):
    return sum(numbers)

# **kwargs — variable keyword arguments
def describe(**info):
    for key, value in info.items():
        print(f"  {key}: {value}")

describe(name="Alice", age=30, city="Berlin")

# Type-annotated function (Python 3.5+)
def multiply(a: int, b: int) -> int:
    return a * b

# Lambda (anonymous, single-expression)
square = lambda x: x ** 2
double = lambda x: x * 2

# Closures — inner functions capture outer variables
def make_counter(start=0):
    count = start
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
```

---

## Control Flow

```python
# if / elif / else
if age < 13:
    category = "Child"
elif age < 18:
    category = "Teenager"
elif age < 65:
    category = "Adult"
else:
    category = "Senior"

# Ternary (inline if)
label = "even" if age % 2 == 0 else "odd"

# for loop (iterates over any iterable)
for i in range(5):
    print(i, end=" ")

for item in ["a", "b", "c"]:
    print(item)

# enumerate — get index and value
for idx, val in enumerate(["x", "y", "z"]):
    print(idx, val)

# while
n = 0
while n < 3:
    print(n)
    n += 1

# break / continue
for i in range(10):
    if i == 3: continue    # skip 3
    if i == 7: break       # stop at 7
    print(i, end=" ")
```

---

## Classes

```python
class Person:
    species = "Homo sapiens"   # class attribute (shared)

    def __init__(self, name: str, age: int):
        self.name = name       # instance attribute
        self.age  = age

    def introduce(self) -> str:
        return f"Hi, I'm {self.name}, {self.age} years old."

    def __repr__(self) -> str:
        return f"Person(name={self.name!r}, age={self.age})"

    def __str__(self) -> str:
        return self.name


class Employee(Person):
    def __init__(self, name: str, age: int, company: str):
        super().__init__(name, age)
        self.company = company

    def introduce(self) -> str:
        return super().introduce() + f" I work at {self.company}."


alice = Person("Alice", 30)
bob   = Employee("Bob", 25, "Acme Corp")
print(alice.introduce())
print(bob.introduce())
```

---

## Decorators

Decorators are a Python-specific pattern for wrapping functions with reusable behavior.

```python
import time
import functools

def timer(func):
    @functools.wraps(func)   # preserves func metadata
    def wrapper(*args, **kwargs):
        start  = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.1)
    return "done"

slow_function()  # prints: slow_function took 0.1002s
```

---

## Generators

Generators produce values lazily — great for large datasets.

```python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

gen = fibonacci()
for _ in range(10):
    print(next(gen), end=" ")   # 0 1 1 2 3 5 8 13 21 34

# Generator expression (like a lazy list comprehension)
big_squares = (x**2 for x in range(1_000_000))
first_five  = [next(big_squares) for _ in range(5)]
```

---

## Known Problems & Pitfalls

### Mutable Default Arguments

This is the most famous Python gotcha — mutable defaults are shared across all calls.

```python
# BAD: the list is created once and reused!
def append_item(item, container=[]):
    container.append(item)
    return container

print(append_item(1))   # [1]
print(append_item(2))   # [1, 2] — not [2]!

# GOOD: use None as sentinel
def append_item(item, container=None):
    if container is None:
        container = []
    container.append(item)
    return container
```

### Late Binding Closures

```python
# BAD: all lambdas capture the same 'i' variable
funcs = [lambda x: x * i for i in range(5)]
print(funcs[0](1))   # 4 — not 0!
print(funcs[2](1))   # 4 — not 2!

# GOOD: bind i at creation time with a default argument
funcs = [lambda x, i=i: x * i for i in range(5)]
print(funcs[0](1))   # 0 ✓
print(funcs[2](1))   # 2 ✓
```

### The GIL (Global Interpreter Lock)

CPython (the standard Python) only executes one thread at a time due to the GIL. CPU-bound multi-threaded code won't parallelize.

```python
# For CPU-bound parallelism: use multiprocessing or concurrent.futures
from concurrent.futures import ProcessPoolExecutor

def compute(n):
    return sum(i * i for i in range(n))

with ProcessPoolExecutor() as pool:
    results = list(pool.map(compute, [10**6, 10**6, 10**6]))

# For I/O-bound concurrency: asyncio or threading are fine
import asyncio

async def fetch(url): ...  # actual HTTP call would use aiohttp
```

### `is` vs `==`

```python
a = [1, 2, 3]
b = [1, 2, 3]

print(a == b)   # True  — same contents
print(a is b)   # False — different objects in memory

# 'is' checks identity (same object), not equality
# Use 'is' only for None checks: if x is None
```

### Bare `except` Hides Bugs

```python
# Bad: catches EVERYTHING, including KeyboardInterrupt
try:
    risky()
except:
    pass

# Good: catch specific exceptions
try:
    risky()
except ValueError as e:
    print(f"Value error: {e}")
except (TypeError, AttributeError) as e:
    print(f"Type problem: {e}")
```

---

## Quick Reference

| Task | Python |
|---|---|
| Print | `print(x)` |
| Read input | `input("prompt")` |
| String format | `f"Hello {name}"` |
| List | `[1, 2, 3]` |
| Dict | `{"key": "value"}` |
| Comprehension | `[x for x in xs if cond]` |
| Null check | `if x is None:` |
| Type check | `isinstance(x, SomeType)` |
| Try/catch | `try: ... except ExType as e:` |
| Decorator | `@my_decorator` above `def` |
