---
title: "Counting Rules"
description: "Counting rules in combinatorics — sum rule, product rule, inclusion-exclusion, and generating functions for counting set sizes."
---

Combinatorics answers the question: *how many ways can something happen?* These counting techniques appear throughout algorithm analysis, probability, and cryptography.

---

## Cardinality

The **cardinality** |S| of a set S is the number of elements it contains.

```
|{a, b, c}| = 3
|∅| = 0
|{1, 2, 3, 4, 5}| = 5
```

**Goal:** Count |S| without necessarily listing every element.

---

## Sum Rule

If two sets A and B are **disjoint** (no element in common), then:

**|A ∪ B| = |A| + |B|**

More generally for k pairwise-disjoint sets:

**|S₁ ∪ S₂ ∪ … ∪ Sₖ| = |S₁| + |S₂| + … + |Sₖ|**

**When to use:** When a task can be done in exactly one of several independent ways.

**Example:** A password must be 6 lowercase letters OR 4 digits. How many passwords are there?

```
Lowercase passwords: 26⁶ = 308,915,776
Digit passwords:     10⁴ = 10,000

Total = 308,915,776 + 10,000 = 308,925,776
```

The two cases are disjoint (a password can't be both), so we add.

### Partition

Splitting a set S into smaller pairwise disjoint subsets is a **partition**:

```
S = S₁ ∪ S₂ ∪ … ∪ Sₖ   (pairwise disjoint)
|S| = |S₁| + |S₂| + … + |Sₖ|
```

Partition is a strategy: divide the counting problem into cases, count each case separately, add.

---

## Product Rule

If a task consists of a **sequence of independent steps** — step 1 has n₁ choices, step 2 has n₂ choices, and so on — then the total number of ways is:

**|A × B| = |A| × |B|**

Or more generally: **n₁ × n₂ × … × nₖ**

**When to use:** When a task is broken into stages that can each be chosen independently.

**Example:** How many 3-character passwords of the form [letter][digit][letter] are there?

```
Position 1 (letter): 26 choices
Position 2 (digit):  10 choices
Position 3 (letter): 26 choices

Total = 26 × 10 × 26 = 6,760
```

**Example: A lock has 3 dials, each showing 0–9. How many combinations?**

```
Dial 1: 10 choices
Dial 2: 10 choices
Dial 3: 10 choices

Total = 10 × 10 × 10 = 1,000
```

**Repeated independent selections:** If all selections come from the same set of size n and you make k choices:

**Total = nᵏ**

---

## Inclusion-Exclusion Principle

When sets **overlap**, the sum rule overcounts. Inclusion-exclusion corrects this.

**For two sets:**
```
|A ∪ B| = |A| + |B| − |A ∩ B|
```

We subtract the intersection because it was counted twice.

**Example:** How many integers from 1 to 100 are divisible by 3 or 5?

```
A = divisible by 3: ⌊100/3⌋ = 33 numbers
B = divisible by 5: ⌊100/5⌋ = 20 numbers
A ∩ B = divisible by 15: ⌊100/15⌋ = 6 numbers

|A ∪ B| = 33 + 20 − 6 = 47
```

**For three sets:**
```
|A ∪ B ∪ C| = |A| + |B| + |C|
            − |A ∩ B| − |A ∩ C| − |B ∩ C|
            + |A ∩ B ∩ C|
```

**General pattern:** Add singletons, subtract pairs, add triples, subtract quadruples, …

**Memory rule:**
- Odd number of sets → **add** (inclusion)
- Even number of sets → **subtract** (exclusion)

**Example with 3 sets:**

```
S₁ = {1, 5, 6}
S₂ = {1, 3, 6}
S₃ = {1, 4, 5}

All pairwise intersections:
S₁₂ = S₁ ∩ S₂ = {1, 6}  → |S₁₂| = 2
S₁₃ = S₁ ∩ S₃ = {1, 5}  → |S₁₃| = 2
S₂₃ = S₂ ∩ S₃ = {1}     → |S₂₃| = 1

Triple intersection:
S₁₂₃ = S₁ ∩ S₂ ∩ S₃ = {1}  → |S₁₂₃| = 1

Sum = |S₁| + |S₂| + |S₃| = 3 + 3 + 3 = 9
Exclusion = |S₁₂| + |S₁₃| + |S₂₃| = 2 + 2 + 1 = 5
Inclusion = |S₁₂₃| = 1

|S₁ ∪ S₂ ∪ S₃| = 9 + 1 − 5 = 5

Verify: S₁ ∪ S₂ ∪ S₃ = {1, 3, 4, 5, 6} → 5 elements ✓
```

---

## Counting with Recursion

When elements depend on a parameter n, define a recurrence s(n) for the count.

**Example:** How many binary strings of length n start with 1 or end with 0?

```
Let s(n) = count of such strings of length n.

A = strings starting with 1:  2^(n-1)
B = strings ending with 0:    2^(n-1)
A ∩ B = starting with 1 AND ending with 0: 2^(n-2)

s(n) = 2^(n-1) + 2^(n-1) − 2^(n-2)
     = 2^n − 2^(n-2)
```

---

## Generating Functions

A **generating function** encodes a sequence of counts as the coefficients of a polynomial.

**Idea:** If you want to count how many ways you can make change with coins of values v₁, v₂, …, represent each coin type as a polynomial where the coefficient of xᵏ means "using this coin in way k."

**Example:** Count ways to choose 3 items from {A, B, C, D} where A appears 0–2 times and B appears 0–2 times:

```
Generating function for A: 1 + x + x²   (0, 1, or 2 A's)
Generating function for B: 1 + x + x²

Product: (1 + x + x²)²
       = 1 + 2x + 3x² + 2x³ + x⁴

Coefficient of x³ = 2
→ There are 2 ways to pick 3 items: {A,A,B} and {A,B,B}
```

**Reading the answer:** The coefficient of xⁿ in the product gives the count for total = n.

---

## Summary

| Rule | When to use | Formula |
|---|---|---|
| **Sum rule** | "A or B" (disjoint) | \|A\| + \|B\| |
| **Product rule** | Sequential independent choices | n₁ × n₂ × … × nₖ |
| **Inclusion-exclusion** | "A or B" (overlapping) | \|A\| + \|B\| − \|A ∩ B\| |
| **Recursion** | Count depends on n | Define s(n) recursively |
| **Generating functions** | Structured counting problems | Polynomial coefficients |
