---
title: "Boolean & Logic"
description: "Boolean values and logical operators — AND, OR, NOT, XOR, implication, and equivalence — with truth tables and operator precedence."
---

A boolean is the simplest possible type: it is either **true (1)** or **false (0)**. Despite that simplicity, combining booleans with logical operators is the foundation of all decision-making in programs, circuits, and mathematical proofs.

---

## Boolean Values

| Value | Symbol | Integer equivalent |
|---|---|---|
| True | T, 1 | 1 |
| False | F, 0 | 0 |

---

## Logical Operators

### NOT — Negation (¬)

Flips the value. "The opposite of."

| a | ¬a |
|---|---|
| 0 | 1 |
| 1 | 0 |

```
"Alice is NOT in the building"
If Alice is in the building (1), then the statement is false (0).
```

**Priority:** highest (evaluated first unless there are brackets)

---

### AND — Conjunction (∧)

True only when **both** inputs are true. "Both must hold."

| a | b | a ∧ b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

```
"The file exists AND the user has read permission"
Both must be true for the read to succeed.
```

**Memory trick:** AND is like multiplication — 1 × 0 = 0, 1 × 1 = 1.

---

### OR — Disjunction (∨)

True when **at least one** input is true. "At least one must hold."

| a | b | a ∨ b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

```
"The user is an admin OR has been granted access"
Either condition alone is sufficient.
```

**Memory trick:** OR is like addition but capped at 1 — 0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 1.

---

### XOR — Exclusive Or — Contravalence (⊕)

True when inputs are **different**. "Exactly one must hold."

| a | b | a ⊕ b |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

```
"The light switch is on XOR the light is off"
A classic toggle — flipping the switch changes the state.
```

**In cryptography:** XOR is used in stream ciphers and one-time pads because `a ⊕ key ⊕ key = a` — it is self-inverse.

---

### XNOR — Equivalence (⟺)

True when inputs are **equal**. "They agree."

| a | b | a ⟺ b |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

```
a ⟺ b is true exactly when a = b.
This is the logical definition of "if and only if" (iff).
```

---

### Implication (→)

"If a, then b." The implication `a → b` is **only false** when a is true but b is false.

| a | b | a → b |
|---|---|---|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

**The surprising rows:** When a is false (0), the implication is true regardless of b. This is called *vacuous truth*.

```
"If it rains, I will carry an umbrella."
- It rains and I carry one → True (kept promise)
- It rains and I don't carry one → False (broke promise)
- It doesn't rain and I carry one → True (kept promise — didn't apply)
- It doesn't rain and I don't carry one → True (kept promise — didn't apply)
```

**Equivalence:** a → b ≡ ¬a ∨ b (you can always convert implication to OR/NOT).

---

## Operator Precedence

When there are no brackets, evaluate in this order:

| Priority | Operator | Symbol |
|---|---|---|
| 1 (highest) | NOT | ¬ |
| 2 | AND | ∧ |
| 3 | OR | ∨ |
| 4 | Implication | → |
| 5 (lowest) | Equivalence | ⟺ |

**Brackets override everything.**

**Example:** Evaluate `¬a ∨ b ∧ c`
```
Step 1: ¬a       (NOT first)
Step 2: b ∧ c    (AND before OR)
Step 3: ¬a ∨ (b ∧ c)   (OR last)
```

---

## Truth Tables in Practice

Build a truth table by listing all combinations of inputs (2ⁿ rows for n variables), then evaluating column by column.

**Example: Evaluate `(a ∧ b) → ¬c`**

| a | b | c | a ∧ b | ¬c | (a ∧ b) → ¬c |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 |
| 0 | 0 | 1 | 0 | 0 | 1 |
| 0 | 1 | 0 | 0 | 1 | 1 |
| 0 | 1 | 1 | 0 | 0 | 1 |
| 1 | 0 | 0 | 0 | 1 | 1 |
| 1 | 0 | 1 | 0 | 0 | 1 |
| 1 | 1 | 0 | 1 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 | 0 |

Only one row makes this false: when a=1, b=1, c=1 — the precondition (a ∧ b) is met but ¬c is false.

---

## Classification of Formulas

| Term | Meaning | Example |
|---|---|---|
| **Tautology** (allgemeingültig) | True in every interpretation | a ∨ ¬a |
| **Contradiction** (unerfüllbar) | False in every interpretation | a ∧ ¬a |
| **Satisfiable** (erfüllbar) | True in at least one interpretation | a ∧ b |

**Why this matters:** Tautologies are always safe to use in proofs. Contradictions signal an impossible assumption. Satisfiability checking (SAT) is a famous NP-complete problem.

---

## De Morgan's Laws

These laws let you push negation inside brackets — crucial for simplification.

| Law | Formula |
|---|---|
| NOT of AND | ¬(a ∧ b) ≡ ¬a ∨ ¬b |
| NOT of OR | ¬(a ∨ b) ≡ ¬a ∧ ¬b |

**Memory trick:** When you push NOT through brackets, AND becomes OR and OR becomes AND.

```
¬(isAdmin AND isLoggedIn)
≡ ¬isAdmin OR ¬isLoggedIn
= "not admin, or not logged in"
```

**Example application:**
```sql
-- Original check
NOT (status = 'active' AND role = 'admin')

-- De Morgan applied (equivalent)
status != 'active' OR role != 'admin'
```
