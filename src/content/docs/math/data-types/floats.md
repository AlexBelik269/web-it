---
title: "Floats & IEEE 754"
description: "How real numbers are stored as floating-point values, including binary fractions, IEEE 754 encoding, precision limits, and common pitfalls."
---

Floating-point numbers let computers work with very large and very small values, but they come with unavoidable approximation. Understanding IEEE 754 helps you predict when precision errors occur and how to avoid them.

---

## The Core Problem

The set of real numbers ℝ is infinite and continuous. Computer memory is finite and discrete. Therefore, computers can only store a *finite subset* of real numbers. Every other value is **rounded to the nearest representable number**.

```python
0.1 + 0.2          # = 0.30000000000000004 in Python/JS
0.1 + 0.2 == 0.3   # False!
```

This is not a bug — it is the correct result given how 0.1 and 0.2 are stored in binary.

---

## Binary Fractions

Just like decimal has fractions after the decimal point (tenths, hundredths, …), binary has fractions after the "binary point" (halves, quarters, eighths, …):

| Position | 2² | 2¹ | 2⁰ | . | 2⁻¹ | 2⁻² | 2⁻³ |
|---|---|---|---|---|---|---|---|
| Value | 4 | 2 | 1 | . | 0.5 | 0.25 | 0.125 |

**Example: Convert 0.625 to binary**
```
0.625 × 2 = 1.25 → bit 1 (0.5 fits once), remainder 0.25
0.25  × 2 = 0.5  → bit 0 (0.25 × 2 = 0.5, not ≥1), remainder 0.5
0.5   × 2 = 1.0  → bit 1 (done)

0.625 in binary = 0.101
Check: 0.5 + 0 + 0.125 = 0.625 ✓
```

**Why 0.1 cannot be represented exactly:**
```
0.1 × 2 = 0.2 → 0
0.2 × 2 = 0.4 → 0
0.4 × 2 = 0.8 → 0
0.8 × 2 = 1.6 → 1, remainder 0.6
0.6 × 2 = 1.2 → 1, remainder 0.2  ← back to 0.2 — it repeats!

0.1 = 0.0001100110011… (binary, repeating forever)
```

Because the pattern repeats, it must be truncated at some bit, causing a tiny error.

---

## IEEE 754 Standard

IEEE 754 is the universal standard for floating-point arithmetic. It defines two main formats:

| Format | Total bits | Sign | Exponent | Fraction (mantissa) |
|---|---|---|---|---|
| **Single precision** (float) | 32 | 1 | 8 | 23 |
| **Double precision** (double) | 64 | 1 | 11 | 52 |

The value of a normal number is:

**value = (−1)^sign × 1.fraction × 2^(exponent − bias)**

where bias = 127 for 32-bit and 1023 for 64-bit.

---

## Encoding a Float — Step by Step

**Example: Encode −6.75 as 32-bit float**

**Step 1: Convert to binary**
```
6.75 = 6 + 0.75
6 = 110 in binary
0.75 = 0.11 in binary (0.5 + 0.25)
6.75 = 110.11 in binary
```

**Step 2: Normalize — move the point until there is exactly one 1 before it**
```
110.11 = 1.1011 × 2²
               ↑
        exponent = 2
```

**Step 3: Set sign bit**
```
Negative number → sign bit = 1
```

**Step 4: Encode exponent — add bias 127**
```
2 + 127 = 129 = 10000001 in binary
```

**Step 5: Write fraction — bits after the leading 1**
```
1.1011 → fraction = 10110000000000000000000 (pad with zeros to 23 bits)
```

**Final 32-bit result:**
```
1 | 10000001 | 10110000000000000000000
↑      ↑              ↑
sign  exponent      fraction
```

---

## Decoding a Float

**Example: Decode 0 10000000 10000000000000000000000**

**Step 1: Read fields**
```
sign     = 0 (positive)
exponent = 10000000 = 128 in decimal
fraction = 10000000000000000000000
```

**Step 2: Compute actual exponent**
```
128 − 127 = 1
```

**Step 3: Reconstruct value**
```
1.fraction = 1.10000000000000000000000 in binary
           = 1.5 in decimal (1 + 0.5)

value = (+1) × 1.5 × 2¹ = 3.0
```

---

## Special Values

IEEE 754 reserves certain bit patterns for special values:

| Pattern | Value | Meaning |
|---|---|---|
| exp = 0, frac = 0 | 0.0 or −0.0 | Zero |
| exp = all 1s, frac = 0 | +∞ or −∞ | Infinity (e.g. 1.0/0.0) |
| exp = all 1s, frac ≠ 0 | NaN | Not a Number (e.g. 0.0/0.0, √−1) |

```python
float('inf') + 1    # = inf
float('inf') * -1   # = -inf
float('nan') == float('nan')  # False! NaN is never equal to itself
```

---

## Precision Limits

| Format | Decimal digits of precision | Approximate range |
|---|---|---|
| float (32-bit) | ~7 digits | ±3.4 × 10³⁸ |
| double (64-bit) | ~15–17 digits | ±1.8 × 10³⁰⁸ |

**Consequence:** Two doubles that "should" be equal may differ in the last few bits.

**Safe comparison:**
```python
# WRONG
if a == b:

# CORRECT — use an epsilon tolerance
if abs(a - b) < 1e-9:
```

---

## Converting Repeating Decimals to Fractions

Given a repeating decimal like 0.142857142857…, you can find the exact fraction:

**Method:**
1. Let x = 0.142857142857…
2. The period "142857" has 6 digits, so multiply by 10⁶: 1000000x = 142857.142857…
3. Subtract: 1000000x − x = 142857, so 999999x = 142857
4. x = 142857 / 999999 = 1/7

**General rule:** For a period of length n, multiply by 10ⁿ and subtract.

---

## Summary

| Situation | What happens | Fix |
|---|---|---|
| `0.1 + 0.2` | Tiny rounding error | Compare with tolerance: `abs(a−b) < ε` |
| Very large + very small | Small value lost (absorption) | Reorder operations |
| Division by zero | ±∞ or NaN | Check denominator before dividing |
| NaN comparisons | Always false | Use `isnan()` function |
