---
title: "Trees"
description: "Trees in graph theory — definitions, properties, k-ary trees, counting nodes and leaves, and connections to data structures."
---

A tree is the simplest connected graph without redundancy. Trees appear everywhere in computer science: file systems, compilers (parse trees), databases (B-trees), networking (spanning trees), and decision algorithms.

---

## Definition

A **tree** is a simple undirected graph that is:
1. **Connected** — there is a path between every pair of vertices
2. **Acyclic** — it contains no cycles

These two conditions together are equivalent to: **any two vertices are connected by exactly one path**.

**Alternative equivalent definitions:**
- A connected graph with |V| − 1 edges
- An acyclic graph where adding any edge creates exactly one cycle
- A connected graph where removing any edge disconnects it

---

## Basic Properties

| Property | Formula | Meaning |
|---|---|---|
| Edges | \|E\| = \|V\| − 1 | A tree with n vertices has exactly n−1 edges |
| Connectivity | Every vertex reachable from every other | By definition |
| No cycles | No path returns to its starting vertex | By definition |

**Example: Tree with 5 vertices**
```
    A
    |
    B
   / \
  C   D
      |
      E

|V| = 5, |E| = 4 = 5 − 1 ✓
```

---

## Rooted Trees

A **rooted tree** is a tree with one designated vertex as the **root**. This gives the tree a natural top-down hierarchy.

| Term | Meaning |
|---|---|
| Root | The topmost vertex (no parent) |
| Parent | The vertex one step closer to the root |
| Child | A vertex one step away from the root |
| Leaf | A vertex with no children (degree 1, unless it is the root) |
| Internal node | A vertex with at least one child |
| Depth of v | Length of the path from root to v |
| Height of tree | Maximum depth of any vertex |

**Example:**
```
Depth 0:       A        ← root
Depth 1:      / \
             B   C      ← internal nodes
Depth 2:    / \   \
           D   E   F    ← leaves (no children)
```

---

## k-ary Trees

A **k-ary tree** is a rooted tree where every internal node has **at most k children**.

| Name | k | Description |
|---|---|---|
| Binary tree | 2 | At most 2 children per node |
| Ternary tree | 3 | At most 3 children per node |
| k-ary tree | k | At most k children per node |

A **full k-ary tree** has every internal node with exactly k children.  
A **complete k-ary tree** of depth t has all internal nodes at depths 0 through t−1 having exactly k children, and all leaves at depth t.

---

## Counting Nodes in Complete k-ary Trees

For a **complete k-ary tree of depth t** (root at depth 0, leaves at depth t):

| Quantity | Formula | Example (k=3, t=4) |
|---|---|---|
| Nodes at depth d | kᵈ | depth 4: 3⁴ = 81 |
| Total nodes | (kᵗ⁺¹ − 1) / (k − 1) | (3⁵ − 1)/(3−1) = 242/2 = 121 |
| Leaf nodes | kᵗ | 3⁴ = 81 |
| Total edges | \|V\| − 1 | 121 − 1 = 120 |

**Why total nodes = (kᵗ⁺¹ − 1)/(k − 1)?**

This is the geometric series:
```
1 + k + k² + k³ + … + kᵗ = (kᵗ⁺¹ − 1) / (k − 1)
↑     ↑    ↑    ↑         ↑
d=0  d=1  d=2  d=3    sum formula
```

### Binary Tree Example (k=2)

```
Depth:
  0:              A               ← 2⁰ = 1 node
  1:           B     C            ← 2¹ = 2 nodes
  2:         D   E F   G          ← 2² = 4 nodes
  3:        H I J K L M N O      ← 2³ = 8 nodes

Total nodes (depth 3): 1+2+4+8 = 15 = (2⁴−1)/(2−1) = 15 ✓
Leaves: 2³ = 8
Height = log₂(leaves) = log₂(8) = 3
```

**Key insight:** The height of a binary tree with n nodes is O(log n). This is why binary search trees and heaps are efficient.

---

## Tree Height and Algorithm Efficiency

| Tree type | Height | Operations |
|---|---|---|
| Balanced binary tree | O(log n) | Search, insert, delete in O(log n) |
| Unbalanced (worst case) | O(n) | Degenerates to a linked list |
| Complete k-ary tree | O(log_k n) | Used in k-ary heaps |

**Why height = log_k(n)?**

A complete k-ary tree of height h has kʰ leaves.  
If there are n leaves: kʰ = n → h = log_k(n).

---

## Special Tree Types in CS

### Binary Search Tree (BST)

A binary tree where for every node:
- Left subtree contains only smaller values
- Right subtree contains only larger values

```
       5
      / \
     3   7
    / \   \
   2   4   9
```

Search: compare at each node, go left or right → O(log n) if balanced.

### Spanning Tree

A **spanning tree** of a graph G is a tree that:
- Contains all vertices of G
- Uses only edges from G
- Has no cycles

Every connected graph has at least one spanning tree.

**Minimum Spanning Tree (MST):** The spanning tree with minimum total edge weight. Found by Kruskal's or Prim's algorithm in O(E log V).

### Parse Tree / Syntax Tree

Used in compilers to represent the grammatical structure of source code:

```
Expression: 3 + 4 * 2

      +
     / \
    3   *
       / \
      4   2
```

Evaluating the tree gives the correct result (respecting operator precedence).

---

## Removing/Adding Edges

- **Remove any edge** from a tree → the graph becomes disconnected (two components)
- **Add any edge** to a tree → exactly one cycle is created

These properties make trees "minimal connected graphs" — they have exactly the edges needed to stay connected.

---

## Summary

| Property | Tree |
|---|---|
| Connected | Yes |
| Acyclic | Yes |
| Edges | \|V\| − 1 |
| Simple | Yes (no self-loops, no parallel edges) |
| Bipartite | Yes (all trees are bipartite) |
| Spanning tree exists | Every connected graph has one |
