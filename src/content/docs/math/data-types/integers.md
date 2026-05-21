---
title: "Integers & Binary"
description: "How integers are represented in binary, integer division, modulo, and converting between number bases."
---

Computers store all data as bits — 0s and 1s. Understanding binary representation helps you reason about overflow, bitwise operations, and why integer division truncates rather than rounds.

---

## The Binary Number System

Decimal (base 10) uses digits 0–9. Binary (base 2) uses only 0 and 1. Each position represents a power of 2.

**Decimal example — what 347 means:**
```
3 × 10² + 4 × 10¹ + 7 × 10⁰
= 300 + 40 + 7
= 347
```

**Binary example — what 1011 means:**
```
1 × 2³ + 0 × 2² + 1 × 2¹ + 1 × 2⁰
= 8  +  0  +  2  +  1
= 11
```

---

## Converting Decimal to Binary

**Method: repeated division by 2**

Divide the number by 2 repeatedly, writing down remainders. Read remainders from bottom to top.

**Example: Convert 43 to binary**
```
43 ÷ 2 = 21 remainder 1  ← least significant bit
21 ÷ 2 = 10 remainder 1
10 ÷ 2 =  5 remainder 0
 5 ÷ 2 =  2 remainder 1
 2 ÷ 2 =  1 remainder 0
 1 ÷ 2 =  0 remainder 1  ← most significant bit

Read remainders upward: 101011
```

**Verification:** 1×32 + 0×16 + 1×8 + 0×4 + 1×2 + 1×1 = 32 + 8 + 2 + 1 = 43 ✓

**Powers of 2 reference:**

| 2⁰ | 2¹ | 2² | 2³ | 2⁴ | 2⁵ | 2⁶ | 2⁷ | 2⁸ |
|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 |

---

## Converting Binary to Decimal

Multiply each bit by its positional power of 2 and add.

**Example: Convert 110101 to decimal**
```
Position: 5  4  3  2  1  0
Bits:      1  1  0  1  0  1

1×32 + 1×16 + 0×8 + 1×4 + 0×2 + 1×1
= 32 + 16 + 0 + 4 + 0 + 1
= 53
```

---

## Hexadecimal (Base 16)

Hex uses digits 0–9 and letters A–F. One hex digit represents exactly 4 binary bits, making it a compact way to write binary.

| Hex | Binary | Decimal |
|---|---|---|
| 0 | 0000 | 0 |
| 1 | 0001 | 1 |
| ... | ... | ... |
| 9 | 1001 | 9 |
| A | 1010 | 10 |
| B | 1011 | 11 |
| C | 1100 | 12 |
| D | 1101 | 13 |
| E | 1110 | 14 |
| F | 1111 | 15 |

**Example: Convert 0xFF to decimal**
```
F = 15, F = 15
FF = 15×16 + 15 = 240 + 15 = 255
```

In programming: `0xFF`, `#FF0000` (red in CSS), `\xAB` (byte escape).

---

## Integer Arithmetic

### Division and Modulo

For integers a and b (b ≠ 0), every division produces an exact quotient and remainder:

```
a = b × (a div b) + (a mod b)
```

The remainder is always in the range 0 ≤ r < b.

**Examples:**

| Expression | Calculation | Result |
|---|---|---|
| 14 div 3 | ⌊14/3⌋ = ⌊4.666…⌋ | 4 |
| 14 mod 3 | 14 − 3×4 = 14 − 12 | 2 |
| −7 div 3 | ⌊−7/3⌋ = ⌊−2.333…⌋ = −3 | −3 |
| −7 mod 3 | −7 − 3×(−3) = −7 + 9 | 2 |

**Check:** 3 × 4 + 2 = 14 ✓ and 3 × (−3) + 2 = −7 ✓

**Warning:** Languages differ on how they handle negative numbers.

| Language | `-7 % 3` | Comment |
|---|---|---|
| Python | 2 | floor division (toward −∞) |
| Java, C | -1 | truncated division (toward 0) |
| C# | -1 | truncated division |

---

## Bitwise Operators

Since integers are stored in binary, you can operate on individual bits directly.

| Operator | Symbol | Meaning | Example (a=5=0101, b=3=0011) |
|---|---|---|---|
| AND | & | 1 only if both bits are 1 | 0101 & 0011 = 0001 = 1 |
| OR | \| | 1 if at least one bit is 1 | 0101 \| 0011 = 0111 = 7 |
| XOR | ^ | 1 if bits differ | 0101 ^ 0011 = 0110 = 6 |
| NOT | ~ | Flip all bits | ~0101 = 1010 (= −6 in signed int) |
| Left shift | << | Multiply by 2ⁿ | 0101 << 1 = 1010 = 10 |
| Right shift | >> | Divide by 2ⁿ | 0101 >> 1 = 0010 = 2 |

**Practical uses:**
```python
# Check if n is even
n & 1 == 0          # faster than n % 2 == 0

# Set bit k
n = n | (1 << k)

# Clear bit k
n = n & ~(1 << k)

# Toggle bit k
n = n ^ (1 << k)

# Fast multiply/divide by power of 2
n << 3  # = n × 8
n >> 2  # = n ÷ 4
```

---

## Integer Overflow

Every integer type has a fixed bit width:

| Type | Bits | Min value | Max value |
|---|---|---|---|
| int8 (signed) | 8 | −128 | 127 |
| uint8 (unsigned) | 8 | 0 | 255 |
| int32 (signed) | 32 | −2,147,483,648 | 2,147,483,647 |
| int64 (signed) | 64 | ≈ −9.2 × 10¹⁸ | ≈ 9.2 × 10¹⁸ |

**Overflow:** When a computation exceeds the max value, it wraps around.
```
uint8: 255 + 1 = 0   (wraps to 0)
int8:  127 + 1 = -128 (wraps to most negative)
```

This is why the classic "check if sum overflows" must be done carefully:
```c
// WRONG — overflow already happened before the check
if (a + b > MAX_INT) { ... }

// CORRECT — check before adding
if (a > MAX_INT - b) { ... }
```
