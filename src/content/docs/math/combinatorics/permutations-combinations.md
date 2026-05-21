---
title: "Permutations & Combinations"
description: "Ordered and unordered selection — permutations (order matters) and combinations (order does not matter), with and without repetition."
---

The fundamental question in combinatorics is: how many ways can you select k items from n? The answer depends on two choices: does order matter, and can you reuse items?

---

## The Four Cases

| Order matters? | Repetition allowed? | Name | Formula |
|---|---|---|---|
| Yes | Yes | Sequences | nᵏ |
| Yes | No | Permutations | n! / (n−k)! |
| No | Yes | Multisets | C(n+k−1, k) |
| No | No | Combinations | C(n, k) = n! / (k!(n−k)!) |

---

## Factorial

The factorial n! is the product of all integers from 1 to n:

```
n! = n × (n−1) × (n−2) × … × 2 × 1
0! = 1   (by definition)

5! = 5 × 4 × 3 × 2 × 1 = 120
```

Factorial counts the number of ways to arrange n distinct objects in a row.

**Example:** How many ways can 4 people sit in a row?
```
4! = 4 × 3 × 2 × 1 = 24
```

---

## Permutations — Order Matters, No Repetition

**P(n, k)** = number of ordered selections of k items from n distinct items (no reuse).

**Formula:** P(n, k) = n! / (n−k)!

**Why:** First choice has n options, second has n−1 (already used one), …, k-th has n−k+1.

```
P(n, k) = n × (n−1) × … × (n−k+1)
        = n! / (n−k)!
```

**Example:** How many 3-letter codes (no repeated letters) from the alphabet (26 letters)?

```
P(26, 3) = 26! / (26−3)! = 26 × 25 × 24 = 15,600
```

**Example:** 8 teams compete; how many possible orderings for 1st, 2nd, 3rd place?

```
P(8, 3) = 8 × 7 × 6 = 336
```

---

## Combinations — Order Does Not Matter, No Repetition

**C(n, k)** = number of unordered selections of k items from n distinct items (no reuse).

**Formula:** C(n, k) = n! / (k! × (n−k)!)

Also written as: $\binom{n}{k}$ (pronounced "n choose k")

**Why the k!:** Permutations counts each group k! times (once for each ordering). Dividing removes those duplicates.

```
C(n, k) = P(n, k) / k! = n! / (k!(n−k)!)
```

**Example:** How many 5-card hands from a deck of 52?

```
C(52, 5) = 52! / (5! × 47!) = (52 × 51 × 50 × 49 × 48) / (5 × 4 × 3 × 2 × 1)
         = 311,875,200 / 120
         = 2,598,960
```

**Example:** How many ways to choose 3 people from a group of 10 for a committee?

```
C(10, 3) = 10! / (3! × 7!) = (10 × 9 × 8) / (3 × 2 × 1) = 720 / 6 = 120
```

---

## Sequences — Order Matters, With Repetition

Choose k items from n, **allowing reuse**, order matters.

**Formula:** nᵏ

**Example:** 4-digit PIN from 0–9:

```
10⁴ = 10,000
```

**Example:** Number of binary strings of length 8:

```
2⁸ = 256
```

---

## Pascal's Triangle and the Binomial Theorem

**Pascal's Triangle** builds combination values row by row:

```
Row 0:           1
Row 1:          1 1
Row 2:         1 2 1
Row 3:        1 3 3 1
Row 4:       1 4 6 4 1
Row 5:      1 5 10 10 5 1
```

Each number is C(n, k) where n is the row and k is the position.

**Key identity:** C(n, k) = C(n−1, k−1) + C(n−1, k)

The entry in any row equals the sum of the two entries above it.

**Binomial Theorem:**

(a + b)ⁿ = Σₖ₌₀ⁿ C(n,k) × aⁿ⁻ᵏ × bᵏ

**Example:** (a + b)³

```
= C(3,0)a³ + C(3,1)a²b + C(3,2)ab² + C(3,3)b³
= 1×a³ + 3×a²b + 3×ab² + 1×b³
= a³ + 3a²b + 3ab² + b³
```

---

## Mapping Types and Counting

The type of function (see [Sets & Functions](/math/data-types/sets-functions)) determines how many there are:

| Function type | Domain D, Codomain W | Count |
|---|---|---|
| Any function | |D| = n, |W| = m | mⁿ |
| Injective (no reuse in W) | |D| = k ≤ |W| = n | P(n, k) = n!/(n−k)! |
| Bijective (perfect matching) | |D| = |W| = n | n! |

---

## Practical Selection Guide

**Ask two questions:**
1. Does the order of selection matter?
2. Can I select the same item more than once?

**Order matters + no repetition** → Permutations P(n, k)
- Example: Race results, seating arrangements, anagrams of distinct letters

**Order does not matter + no repetition** → Combinations C(n, k)
- Example: Committees, lottery draws, choosing ingredients

**Order matters + repetition** → nᵏ
- Example: PINs, passwords, strings, sequences

**Order does not matter + repetition** → C(n+k−1, k)
- Example: Buying k items from n types (order of purchase doesn't matter, can buy same type multiple times)

---

## Example: Anagrams

**How many distinct arrangements of the letters in "MATHS"?**

5 distinct letters, arrange all 5: 5! = 120

**How many distinct arrangements of "MISSISSIPPI"?**

Total letters: 11 (M×1, I×4, S×4, P×2)

Formula for repeated elements: n! / (n₁! × n₂! × … × nₖ!)
```
11! / (1! × 4! × 4! × 2!)
= 39,916,800 / (1 × 24 × 24 × 2)
= 39,916,800 / 1,152
= 34,650
```

---

## Summary Table

| Scenario | Formula | Example |
|---|---|---|
| Arrange all n items | n! | Seat 5 people: 120 |
| Ordered k from n, no repeat | n!/(n−k)! | Top-3 from 10: 720 |
| Unordered k from n, no repeat | n!/(k!(n−k)!) | Choose 3 from 10: 120 |
| Ordered k from n, with repeat | nᵏ | 4-digit PIN: 10,000 |
| Letters with repeats | n!/(n₁!n₂!…) | MISSISSIPPI: 34,650 |
