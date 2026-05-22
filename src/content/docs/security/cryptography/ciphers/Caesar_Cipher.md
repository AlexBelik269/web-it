---
title: "The Caesar Cipher"
description: "The Caesar Cipher, the oldest and simplest encryption technique."
---

> *"If he had anything confidential to say, he wrote it in cipher..."*
> — Suetonius, *The Twelve Caesars*

---

#### What Is It?

The **Caesar cipher** is one of the oldest and simplest encryption techniques known. It is a **substitution cipher** in which each letter in the plaintext is shifted a fixed number of positions along the alphabet. Named after Julius Caesar, who reportedly used it with a shift of 3 to protect military communications.

---

## How It Works

Each letter is replaced by the letter **N positions** further in the alphabet. The alphabet wraps around — after `Z` comes `A` again.

### Encryption Formula

```
E(x) = (x + n) mod 26
```

### Decryption Formula

```
D(x) = (x - n + 26) mod 26
```

Where:
- `x` = position of the letter (A=0, B=1, … Z=25)
- `n` = shift value (key)

---

## Shift Visualisation (Shift = 3)

```mermaid
graph LR
    A -->|+3| D
    B -->|+3| E
    C -->|+3| F
    D -->|+3| G
    X -->|+3| A
    Y -->|+3| B
    Z -->|+3| C
```

---

## Encryption Flow

```mermaid
flowchart TD
    A([Plaintext Message]) --> B[Split into characters]
    B --> C{Is it a letter?}
    C -- Yes --> D[Convert to number\nA=0 … Z=25]
    D --> E[Add shift key n]
    E --> F[Apply mod 26]
    F --> G[Convert back to letter]
    G --> H([Ciphertext])
    C -- No --> H
```

---

## Example: Encrypting "HELLO" with Shift 3

| Plaintext | Index | + Shift | mod 26 | Ciphertext |
|-----------|-------|---------|--------|------------|
| H         | 7     | 10      | 10     | **K**      |
| E         | 4     | 7       | 7      | **H**      |
| L         | 11    | 14      | 14     | **O**      |
| L         | 11    | 14      | 14     | **O**      |
| O         | 14    | 17      | 17     | **R**      |

**HELLO → KHOOR**

---

## The Cipher Wheel

```mermaid
graph TD
    subgraph "Outer Ring — Plaintext"
        A1[A] --- B1[B] --- C1[C] --- D1[D] --- E1[E]
    end
    subgraph "Inner Ring — Ciphertext (shift 3)"
        D2[D] --- E2[E] --- F2[F] --- G2[G] --- H2[H]
    end
    A1 -.->|maps to| D2
    B1 -.->|maps to| E2
    C1 -.->|maps to| F2
```

---

## Key Space

The Caesar cipher has only **26 possible keys** (shifts 0–25). Shift 0 means no encryption.

```mermaid
pie title Distribution of Key Space
    "Shift 1–12 (weak)" : 12
    "Shift 13 (ROT13)" : 1
    "Shift 14–25 (weak)" : 12
    "Shift 0 (no cipher)" : 1
```

---

## ROT13 — The Special Case

When the shift is exactly **13**, the cipher is its own inverse:

```
Encrypt(ROT13(x)) = Decrypt(ROT13(x))
```

This means applying ROT13 **twice** returns the original text. It is widely used online to hide spoilers or puzzle answers.

---

## Historical Usage

```mermaid
timeline
    title Caesar Cipher Through History
    50 BC  : Julius Caesar uses shift-3 for military dispatches
    ~100 AD : Augustus Caesar uses shift-1 in personal letters
    1000 AD : Arab scholars (Al-Kindi) document frequency analysis, breaking the cipher
    1500s  : Vigenère builds on Caesar to create the polyalphabetic cipher
    1900s  : ROT13 emerges in early internet culture (Usenet)
    Today  : Used in puzzles, education, and as a teaching tool for cryptography
```

---

## Security Analysis

| Property         | Caesar Cipher       |
|------------------|---------------------|
| Key space        | 26 keys             |
| Security         | ❌ Extremely weak    |
| Brute-force      | Trivially possible  |
| Frequency attack | Easy — 1 sample     |
| Modern use       | Educational only    |

### Why It Fails: Frequency Analysis

Because letter frequencies are preserved, an attacker can compare the ciphertext frequency distribution to known language frequencies (e.g. `E` is the most common letter in English). A single ciphertext of ~20 characters is usually enough to crack it.

```mermaid
xychart-beta
    title "English Letter Frequency (%)"
    x-axis [E, T, A, O, I, N, S, H, R, D]
    y-axis "Frequency (%)" 0 --> 14
    bar [12.7, 9.1, 8.2, 7.5, 7.0, 6.7, 6.3, 6.1, 6.0, 4.3]
```

---

## Comparison with Related Ciphers

```mermaid
graph LR
    Caesar["Caesar Cipher\n(fixed shift)"]
    Vigenere["Vigenère Cipher\n(multiple shifts)"]
    Atbash["Atbash Cipher\n(reverse alphabet)"]
    ROT13["ROT13\n(shift = 13)"]
    OTP["One-Time Pad\n(random key)"]

    Caesar -->|extended by| Vigenere
    Caesar -->|special case| ROT13
    Atbash -->|similar concept| Caesar
    Vigenere -->|infinite key →| OTP
```

---

## Quick Reference

```
Alphabet: A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Shift +3: D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
```

To **encrypt**: find the letter in the top row → take the letter below it.
To **decrypt**: find the letter in the bottom row → take the letter above it.

---

## Summary

The Caesar cipher is a cornerstone of cryptography history — simple enough to grasp immediately, yet illustrative of fundamental concepts like **key-based transformation**, **modular arithmetic**, and **the importance of key space size**. While completely insecure by modern standards, it remains the perfect starting point for understanding how encryption works.