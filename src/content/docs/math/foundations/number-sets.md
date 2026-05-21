---
title: "Number Sets"
description: "The standard number sets used in mathematics and computer science — natural numbers, integers, rationals, reals, and complex numbers."
---

Every value in a program belongs to a type. Behind those types are mathematical sets that define exactly which values exist and what operations are valid. Understanding these sets prevents bugs like dividing integers and losing decimal precision, or confusing "no element" with "element zero."

## The Hierarchy of Number Sets

The number sets are nested — each one contains all the sets above it:

```
ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
```

Think of it like Russian dolls: natural numbers fit inside integers, integers fit inside rationals, and so on.

---

## Natural Numbers — ℕ

**ℕ = {0, 1, 2, 3, 4, …}** (sometimes starting at 1 depending on convention)

These are the counting numbers. There is no upper limit, but there are no negatives and no fractions.

**What you can do:** Add, multiply.  
**What you cannot do:** Subtract freely (3 − 5 is not in ℕ), divide freely.

**In programming:** `uint`, `size_t`, array indices.

| Operation | Example | Result in ℕ? |
|---|---|---|
| 3 + 5 | = 8 | Yes |
| 3 − 5 | = −2 | No |
| 3 × 5 | = 15 | Yes |
| 3 / 5 | = 0.6 | No |

---

## Integers — ℤ

**ℤ = {…, −3, −2, −1, 0, 1, 2, 3, …}**

The letter comes from the German word *Zahlen* (numbers). Integers extend natural numbers with negative values.

**What you can do:** Add, subtract, multiply.  
**What you cannot do:** Divide freely (5 ÷ 3 is not an integer).

**In programming:** `int`, `long`, `i64`.

| Operation | Example | Result in ℤ? |
|---|---|---|
| 3 − 8 | = −5 | Yes |
| −4 × 7 | = −28 | Yes |
| 7 div 3 | = 2 (floor) | Yes |
| 7 mod 3 | = 1 (remainder) | Yes |
| 7 / 3 | = 2.333… | No |

---

## Rational Numbers — ℚ

**ℚ = { p/q | p ∈ ℤ, q ∈ ℤ, q ≠ 0 }**

Any number expressible as a fraction of two integers. The letter comes from *Quotient*.

**Key insight:** Rational numbers always have either a terminating or a **repeating** decimal expansion.

| Number | Decimal | Rational? |
|---|---|---|
| 1/4 | 0.25 (terminates) | Yes |
| 1/3 | 0.333… (repeats) | Yes |
| 22/7 | 3.142857142857… (repeats) | Yes |
| √2 | 1.41421356… (never repeats) | No |
| π | 3.14159265… (never repeats) | No |

**Spotting repeating decimals:** If you convert 1/7 = 0.142857142857… the block "142857" repeats forever. All fractions p/q produce repeating decimals because there are only finitely many remainders (0 to q−1).

---

## Real Numbers — ℝ

**ℝ = all points on the number line**

Real numbers include all rationals plus all *irrational* numbers — values whose decimal expansion goes on forever without repeating.

| Number | Type |
|---|---|
| 2.5 | Rational (= 5/2) |
| √2 ≈ 1.41421… | Irrational |
| π ≈ 3.14159… | Irrational (transcendental) |
| e ≈ 2.71828… | Irrational (transcendental) |

**In programming:** `float`, `double` — but these are *approximations*. No computer can store all of ℝ; it stores a rational approximation using IEEE 754.

**The precision trap:**
```python
0.1 + 0.2 == 0.3   # False in most languages!
# 0.1 + 0.2 = 0.30000000000000004
```
This happens because 0.1 and 0.2 cannot be represented exactly in binary. See [Floats & IEEE 754](/math/data-types/floats).

---

## Complex Numbers — ℂ

**ℂ = { a + bi | a, b ∈ ℝ, i² = −1 }**

Complex numbers introduce the imaginary unit `i`, defined as √(−1). Every complex number has a real part `a` and an imaginary part `b`.

| Example | Real Part | Imaginary Part |
|---|---|---|
| 3 + 4i | 3 | 4 |
| 5 (= 5 + 0i) | 5 | 0 |
| 2i (= 0 + 2i) | 0 | 2 |

**Why do they matter for CS?** Fourier transforms (used in image compression, audio processing, and signal analysis) rely on complex numbers. Cryptography algorithms also use modular arithmetic over complex-like structures.

---

## Summary Table

| Set | Symbol | Contains | Missing |
|---|---|---|---|
| Natural numbers | ℕ | 0, 1, 2, 3, … | Negatives, fractions |
| Integers | ℤ | …, −2, −1, 0, 1, 2, … | Fractions |
| Rational numbers | ℚ | All fractions p/q | Irrationals (√2, π) |
| Real numbers | ℝ | Everything on the number line | Imaginary numbers |
| Complex numbers | ℂ | a + bi for all a, b ∈ ℝ | Nothing — this is the complete field |

## Infinity

All these sets are **infinite**, but not equally infinite:

- ℕ, ℤ, ℚ are **countably infinite** — you can list them one by one (there is a bijection to ℕ).
- ℝ is **uncountably infinite** — Cantor's diagonal argument proves you cannot list all real numbers. There are "more" real numbers than integers.

This matters in computability theory: programs are countable objects, but problems are uncountable — so most problems have no algorithm that solves them.
