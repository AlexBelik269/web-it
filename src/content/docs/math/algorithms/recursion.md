---
title: "Recursive Algorithms"
description: "Recursive algorithms — recursion trees, divide-and-conquer recurrences, and solving linear recurrence relations."
---

Recursion is a problem-solving technique where a function calls itself on a smaller version of the same problem. Understanding recursion mathematically — through recurrence relations and recursion trees — lets you predict running times and prove correctness.

---

## What is Recursion?

A **recursive algorithm**:
1. Has a **base case** — a version of the problem simple enough to solve directly
2. Calls itself on **strictly smaller** inputs (progress toward the base case)
3. Combines sub-results to form the final answer

```python
def factorial(n):
    if n == 0:        # base case
        return 1
    return n * factorial(n - 1)   # recursive case
```

If there is no base case, or progress is not made toward it, the recursion never terminates (stack overflow).

---

## Recursion Trees

A **recursion tree** shows all the recursive calls and the work done at each level.

### Example: Sum of first n numbers

```python
def sum(n):
    if n == 0: return 0
    return n + sum(n - 1)
```

Tree for sum(5):
```
sum(5)
  └─ 5 + sum(4)
         └─ 4 + sum(3)
                └─ 3 + sum(2)
                       └─ 2 + sum(1)
                              └─ 1 + sum(0)
                                     └─ 0
```

The call depth is n. Each call does O(1) work. Total: O(n).

### Example: Fibonacci

```python
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
```

Tree for fib(5):
```
            fib(5)
           /      \
       fib(4)    fib(3)
       /    \    /    \
   fib(3) fib(2) fib(2) fib(1)
   ...
```

Each call branches into 2. The tree has O(2ⁿ) nodes. This naive Fibonacci is **exponential** — avoid it; use memoization or iteration instead.

### Example: Merge Sort

```
mergeSort([5, 2, 8, 1, 9, 3, 7, 4])
   mergeSort([5, 2, 8, 1])      mergeSort([9, 3, 7, 4])
     mergeSort([5, 2])  ...       ...
       mergeSort([5])  mergeSort([2])
```

- log₂(8) = 3 levels deep
- Each level does O(n) total merge work
- Total: O(n log n)

---

## Divide-and-Conquer Recurrences

Many recursive algorithms follow this pattern:

**T(n) = a × T(n/b) + f(n)**

| Parameter | Meaning |
|---|---|
| T(n) | Total steps for input of size n |
| a | Number of recursive sub-calls |
| n/b | Size of each sub-problem (input divided by b) |
| f(n) | Work to split into sub-problems and merge results |
| T(1) = c | Base case — constant work for size 1 |

### Master Theorem

For T(n) = a × T(n/b) + c × nᵈ:

| Condition | Result | Intuition |
|---|---|---|
| a < bᵈ | T(n) ∈ O(nᵈ) | Merge work dominates |
| a = bᵈ | T(n) ∈ O(nᵈ log n) | Work balanced across levels |
| a > bᵈ | T(n) ∈ O(n^(log_b a)) | Sub-problems dominate |

**Example: Merge Sort**

T(n) = 2 × T(n/2) + n
- a = 2, b = 2, d = 1 (f(n) = n = n¹)
- Check: a = 2, bᵈ = 2¹ = 2 → a = bᵈ
- Result: T(n) ∈ O(n¹ log n) = O(n log n) ✓

**Example: Binary Search**

T(n) = 1 × T(n/2) + 1
- a = 1, b = 2, d = 0 (f(n) = 1 = n⁰)
- Check: a = 1, bᵈ = 2⁰ = 1 → a = bᵈ
- Result: T(n) ∈ O(n⁰ log n) = O(log n) ✓

**Example: Naive matrix multiplication**

T(n) = 8 × T(n/2) + n²
- a = 8, b = 2, d = 2
- Check: a = 8, bᵈ = 2² = 4 → a > bᵈ
- Result: T(n) ∈ O(n^(log₂ 8)) = O(n³) ✓

---

## Linear Recurrence Relations

A **linear recurrence relation** expresses T(n) in terms of previous values:

**T(n) = c₁×T(n−1) + c₂×T(n−2) + … + cₖ×T(n−k) + F(n)**

| Term | Meaning |
|---|---|
| k | Degree (how many previous values are referenced) |
| cᵢ | Constant coefficients |
| F(n) | Non-recursive part |
| F(n) = 0 | Homogeneous recurrence |
| F(n) ≠ 0 | Inhomogeneous recurrence |

### Solving Homogeneous Recurrences (F(n) = 0)

**Degree 1:** T(n) = c₁ × T(n−1)
```
Solution: T(n) = a × c₁ⁿ
Determine a from initial condition T(0) = value.
```

**Example:** T(n) = 3 × T(n−1), T(0) = 2
```
T(n) = a × 3ⁿ
T(0) = a × 3⁰ = a = 2
T(n) = 2 × 3ⁿ
```

**Degree 2:** T(n) = c₁×T(n−1) + c₂×T(n−2)

1. Find the **characteristic roots** by solving: r² = c₁×r + c₂
2. If roots r₁ ≠ r₂: T(n) = a×r₁ⁿ + b×r₂ⁿ
3. If roots r₁ = r₂: T(n) = a×r₁ⁿ + b×n×r₁ⁿ

**Example: Fibonacci recurrence F(n) = F(n−1) + F(n−2)**

Characteristic equation: r² = r + 1 → r² − r − 1 = 0
```
r = (1 ± √5) / 2
r₁ = (1 + √5)/2 ≈ 1.618  (golden ratio φ)
r₂ = (1 − √5)/2 ≈ −0.618
```

Solution: F(n) = a × φⁿ + b × (−0.618)ⁿ

Using F(0) = 0 and F(1) = 1 to solve for a and b gives the **closed-form formula**:
```
F(n) = (φⁿ − (−φ)⁻ⁿ) / √5
```

This means Fibonacci grows as O(φⁿ) ≈ O(1.618ⁿ) — exponential!

### Solving Inhomogeneous Recurrences (F(n) ≠ 0)

**General solution = homogeneous solution + particular solution**

1. Solve the homogeneous part Tₕ(n) (as above, ignoring F(n))
2. Guess a particular solution Tₚ(n) based on the form of F(n):
   - F(n) = c (constant) → try Tₚ(n) = m
   - F(n) = aⁿ → try Tₚ(n) = m × aⁿ
   - F(n) = n → try Tₚ(n) = m×n + b
   - F(n) = nᵏ → try Tₚ(n) = mₖnᵏ + … + m₀
3. Substitute Tₚ into the recurrence to find m, b, etc.
4. Combine: T(n) = Tₕ(n) + Tₚ(n)
5. Use initial conditions to find remaining constants

---

## Divide-and-Conquer Patterns

| Algorithm | Recurrence | Solution |
|---|---|---|
| Binary search | T(n) = T(n/2) + 1 | O(log n) |
| Merge sort | T(n) = 2T(n/2) + n | O(n log n) |
| Quick sort (average) | T(n) = 2T(n/2) + n | O(n log n) |
| Naive matrix mul. | T(n) = 8T(n/2) + n² | O(n³) |
| Strassen's matrix mul. | T(n) = 7T(n/2) + n² | O(n^2.807) |
