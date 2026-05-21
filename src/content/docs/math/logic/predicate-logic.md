---
title: "Predicate Logic"
description: "Predicate logic — predicates, quantifiers (∀ and ∃), negation of quantifiers, and evaluating truth values with examples."
---

Propositional logic deals with fixed true/false statements. Predicate logic adds **variables** and **quantifiers**, letting you express statements like "for all x" or "there exists an x." This is the language of specifications, program correctness, and database queries.

---

## Predicates

A **predicate** is a statement containing variables. It becomes a proposition (true/false) once specific values are substituted.

**Examples:**

| Predicate | P(x) | P(3) | P(−1) |
|---|---|---|---|
| P(x) = "x > 0" | Depends on x | True | False |
| Q(x) = "x² = x" | Depends on x | False | False (but Q(0) = True, Q(1) = True) |
| R(x, y) = "x < y" | Depends on x and y | R(3, 5) = True | R(5, 3) = False |

**Predicate notation:** P(x), Q(x, y), IsEven(n), HasPermission(user, resource).

---

## Quantifiers

Quantifiers specify *how many* elements satisfy a predicate.

### Universal Quantifier — ∀ (For All)

**∀x P(x)** means "P(x) is true for every x in the domain."

```
∀x ∈ ℕ: x ≥ 0
"Every natural number is non-negative."
→ True
```

```
∀x ∈ ℤ: x > 0
"Every integer is positive."
→ False (counterexample: x = −3)
```

**To prove ∀x P(x) is true:** Show it holds for every possible x (often by induction or general proof).

**To prove ∀x P(x) is false:** Find one counterexample.

### Existential Quantifier — ∃ (There Exists)

**∃x P(x)** means "There is at least one x in the domain for which P(x) is true."

```
∃x ∈ ℤ: x² = 4
"There exists an integer whose square is 4."
→ True (x = 2 or x = −2)
```

```
∃x ∈ ℤ: x² = −1
"There exists an integer whose square is −1."
→ False (no real number squares to a negative)
```

**To prove ∃x P(x) is true:** Find one example.

**To prove ∃x P(x) is false:** Show it holds for no x.

---

## Negation of Quantifiers

Negating a quantifier flips it and negates the predicate. This is analogous to De Morgan's laws.

| Original | Negation | Rule |
|---|---|---|
| ∀x P(x) | ∃x ¬P(x) | "Not all" = "there exists one that isn't" |
| ∃x P(x) | ∀x ¬P(x) | "None exist" = "for all, it doesn't hold" |

**Examples:**

```
Original: ∀x ∈ users: isLoggedIn(x)
          "Every user is logged in."

Negation: ∃x ∈ users: ¬isLoggedIn(x)
          "There exists a user who is not logged in."
```

```
Original: ∃x ∈ requests: isValid(x)
          "Some request is valid."

Negation: ∀x ∈ requests: ¬isValid(x)
          "No request is valid."
```

**Practical use:** If your specification says "every input produces a correct output", its negation is "some input does not produce a correct output" — which is what a test tries to find.

---

## Nested Quantifiers

Quantifiers can be nested. **Order matters** — ∀x ∃y is different from ∃y ∀x.

**∀x ∃y P(x, y)** — "For every x, there is some y that works" (y can depend on x)

**∃y ∀x P(x, y)** — "There is a single y that works for every x" (much stronger claim)

**Example with P(x, y) = "x + y = 0":**

```
∀x ∈ ℤ: ∃y ∈ ℤ: x + y = 0
"For every integer, there exists an additive inverse."
→ True (y = −x works for any x)

∃y ∈ ℤ: ∀x ∈ ℤ: x + y = 0
"There is a single y that when added to any integer gives 0."
→ False (there is no such y)
```

---

## Evaluating Truth Values — Step by Step

**Problem:** Domain = {1, 2, 3}. P(x) = "x > 1". Is ∀x P(x) true?

```
Check every element:
P(1) = (1 > 1) = False
→ Found a counterexample! ∀x P(x) is False.
```

**Problem:** Domain = {1, 2, 3}. Q(x) = "x² > 2". Is ∃x Q(x) true?

```
Check elements until one works:
Q(1) = (1 > 2) = False
Q(2) = (4 > 2) = True
→ Found an example! ∃x Q(x) is True.
```

---

## Quantifiers in Programming

Quantifiers appear all the time in code, even when not written mathematically:

```python
# ∀x: valid(x) — all elements satisfy a condition
all(validate(item) for item in requests)

# ∃x: is_admin(x) — some element satisfies a condition
any(user.is_admin for user in team)

# SQL equivalent of ∀
SELECT * FROM users WHERE age >= 18    -- finds violations of ∀age ≥ 18

# SQL equivalent of ∃
SELECT 1 FROM orders WHERE status = 'pending' LIMIT 1
```

---

## Summary

| Concept | Symbol | Meaning | False when |
|---|---|---|---|
| Universal | ∀x P(x) | P holds for all x | At least one counterexample |
| Existential | ∃x P(x) | P holds for some x | No example found anywhere |
| Negation of ∀ | ¬(∀x P(x)) = ∃x ¬P(x) | Not all → some isn't | — |
| Negation of ∃ | ¬(∃x P(x)) = ∀x ¬P(x) | None → all aren't | — |
