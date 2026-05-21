---
title: "JavaScript vs TypeScript vs HTML vs CSS"
description: "How JavaScript, TypeScript, HTML, and CSS relate to each other — roles, differences, when to use TypeScript, and how they work together."
---

These four technologies are the foundation of every web frontend. They are not alternatives to each other — they work together and each has a distinct role. This page explains the relationship between them and the decisions you make when building for the web.

---

## The Four Roles

| Technology | Role | Runs where |
|---|---|---|
| **HTML** | Structure & content | Browser (parsed, not compiled) |
| **CSS** | Visual presentation | Browser (applied after HTML parse) |
| **JavaScript** | Behavior & logic | Browser + Node.js |
| **TypeScript** | Typed JavaScript | Compiled to JS (never runs directly) |

A common analogy: HTML is the skeleton, CSS is the skin and clothes, JavaScript is the muscles (behavior), and TypeScript is wearing a harness that catches wrong movements before they happen.

---

## HTML vs CSS vs JavaScript: Separation of Concerns

```html
<!-- HTML: structure only — what is on the page -->
<button class="btn btn-primary" id="submitBtn">
    Submit
</button>
```

```css
/* CSS: appearance only — how it looks */
.btn {
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}
.btn-primary {
    background: #2563eb;
    color: white;
}
```

```javascript
// JavaScript: behavior only — what it does
document.getElementById("submitBtn").addEventListener("click", () => {
    console.log("Button clicked!");
});
```

**The rule:** keep these concerns separate. Don't use `style=""` inline attributes when you can use a class. Don't manipulate styles directly from JS when a CSS class toggle will do.

```javascript
// Bad: mixing JS and CSS concerns
element.style.backgroundColor = "#2563eb";
element.style.color = "white";

// Good: toggle a class — CSS handles the rest
element.classList.add("active");
element.classList.toggle("open");
```

---

## JavaScript vs TypeScript

TypeScript is **JavaScript with a type layer on top**. Every `.js` file is valid `.ts`. TypeScript compiles to JavaScript — the browser or Node.js never sees TypeScript directly.

### Same Code, Two Versions

```javascript
// JavaScript — no types, errors caught at runtime
function getUser(id) {
    return fetch(`/api/users/${id}`).then(r => r.json());
}

function displayUser(user) {
    console.log(user.nme);  // typo: 'nme' — no error until you run it
}
```

```typescript
// TypeScript — types, errors caught at compile time
interface User {
    id:    number;
    name:  string;
    email: string;
}

async function getUser(id: number): Promise<User> {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
}

function displayUser(user: User): void {
    console.log(user.nme);  // Error: Property 'nme' does not exist on type 'User'
}
```

---

## TypeScript Type System in Depth

```typescript
// Primitive types
let name:    string  = "Alice";
let age:     number  = 30;
let active:  boolean = true;
let nothing: null    = null;
let missing: undefined = undefined;

// Arrays
let nums:  number[]      = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Tuple — fixed structure
let pair: [string, number] = ["Alice", 30];

// Union — one of several types
let id: number | string = "abc";
id = 42;  // valid

// Intersection — combine types
type Named  = { name: string };
type Aged   = { age: number };
type Person = Named & Aged;  // { name: string; age: number }

// Literal types
type Status  = "pending" | "active" | "inactive";
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

// Optional and readonly
interface Config {
    host:     string;
    port?:    number;      // optional
    readonly secret: string;  // can't be reassigned after creation
}

// Generics
function wrap<T>(value: T): { value: T } {
    return { value };
}

// Utility types (built-in helpers)
type PartialUser  = Partial<User>;          // all fields optional
type RequiredUser = Required<PartialUser>;  // all fields required
type ReadonlyUser = Readonly<User>;         // all fields readonly
type UserID       = Pick<User, "id">;       // only 'id' field
type WithoutEmail = Omit<User, "email">;    // all except 'email'
type UserMap      = Record<string, User>;   // { [key: string]: User }
```

---

## CSS Features Side by Side

These are not alternatives — they solve different layout problems:

| Feature | Best for | Dimension |
|---|---|---|
| **Flexbox** | Rows or columns of items, navigation bars, centering | 1D |
| **Grid** | Page layouts, card grids, complex two-axis placement | 2D |
| **Position** | Overlays, sticky headers, tooltips | Absolute placement |
| **Flow** | Normal text and document flow | Default |

### Flexbox vs Grid: Same Visual, Different Code

**Goal:** 3-column card grid that wraps and is responsive.

```css
/* Flexbox approach */
.flex-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}
.flex-grid > .card {
    flex: 1 1 280px;   /* grow, shrink, minimum 280px */
    max-width: calc(33.33% - 16px);
}

/* Grid approach (cleaner for this use case) */
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}
/* Cards just go in — no extra rules needed */
```

Grid is simpler here because the container controls the layout without needing rules on each child.

---

## JavaScript in the Browser: DOM Manipulation

```javascript
// Selecting elements
const btn     = document.getElementById("myBtn");
const heading = document.querySelector("h1");            // first match
const cards   = document.querySelectorAll(".card");      // all matches (NodeList)

// Reading / writing content
heading.textContent = "New Title";         // safe — no HTML injection
heading.innerHTML   = "<em>New</em>";      // HTML — be careful with user input!

// Attributes
btn.setAttribute("disabled", "true");
btn.removeAttribute("disabled");
const href = document.querySelector("a").getAttribute("href");

// Classes
btn.classList.add("active");
btn.classList.remove("hidden");
btn.classList.toggle("open");
btn.classList.contains("active");   // true/false

// Events
btn.addEventListener("click", handleClick);
btn.removeEventListener("click", handleClick);

// Creating elements
const card = document.createElement("div");
card.className = "card";
card.textContent = "New card";
document.body.appendChild(card);
// Or insert before a reference element:
document.body.insertBefore(card, document.getElementById("footer"));
```

---

## CSS Methodologies (How to Organize CSS)

As projects grow, CSS can become a tangled mess. These are the main approaches:

### BEM (Block Element Modifier)

```css
/* .block__element--modifier */
.card { }                     /* block */
.card__header { }             /* element */
.card__header--large { }      /* modifier */
.card--featured { }           /* block modifier */
```

```html
<div class="card card--featured">
    <div class="card__header card__header--large">Title</div>
    <div class="card__body">Content</div>
</div>
```

### Utility Classes (Tailwind CSS style)

```html
<!-- No custom CSS — compose from utilities -->
<div class="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
    <img class="w-12 h-12 rounded-full" src="avatar.jpg" alt="">
    <div class="font-semibold text-gray-900">Alice</div>
</div>
```

### CSS Modules (common in React)

```css
/* Card.module.css */
.card { background: white; border-radius: 8px; }
.title { font-size: 1.25rem; }
```

```javascript
// Card.jsx
import styles from "./Card.module.css";
<div className={styles.card}>
    <h2 className={styles.title}>Hello</h2>
</div>
```

---

## Tooling: JS/TS Ecosystem

The JS/TS ecosystem has a lot of moving parts. Here's what each tool does:

| Tool | Role |
|---|---|
| **Node.js** | Runtime — execute JS outside the browser |
| **npm / pnpm / yarn** | Package manager |
| **Vite / webpack** | Bundler — combine many JS/CSS files into optimized output |
| **Babel** | Transpiler — convert modern JS to older syntax for compatibility |
| **tsc** | TypeScript compiler — type-check + emit JS |
| **ESLint** | Linter — catch JS/TS style and logic errors |
| **Prettier** | Formatter — consistent code style |
| **Vitest / Jest** | Test runner |

Typical project flow:

```
Write TypeScript → tsc type-checks → Vite bundles → Browser runs plain JS
```

---

## When to Use TypeScript

TypeScript adds overhead (compilation, tsconfig, type definitions) but pays off at scale.

**Use TypeScript when:**
- The project has more than 1 developer
- The codebase will live for > 6 months
- You're building a library others will consume
- You're working with complex data shapes (API responses, state management)
- Refactoring confidence matters

**JavaScript alone is fine when:**
- Quick scripts or one-off tooling
- Small projects with a single developer
- Prototyping / throwaway code
- Teams unfamiliar with TS where the learning curve outweighs the benefit

```typescript
// tsconfig.json minimal config
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,           // enable all strict checks
        "noUncheckedIndexedAccess": true,  // arr[i] is T | undefined
        "outDir": "./dist",
        "rootDir": "./src"
    },
    "include": ["src/**/*"]
}
```

---

## Common Pitfalls

### CSS: Forgetting `box-sizing`

```css
/* Default: width doesn't include padding/border — surprising */
.box { width: 200px; padding: 20px; }
/* Actual rendered width: 240px */

/* Fix: always set globally */
*, *::before, *::after { box-sizing: border-box; }
.box { width: 200px; padding: 20px; }
/* Actual rendered width: 200px ✓ */
```

### JS: Async Without Await

```javascript
// Bug: response is a Promise, not the data
async function getUser() {
    const user = fetchUser();   // missing await
    console.log(user.name);    // undefined — user is Promise<User>
}

// Fix
async function getUser() {
    const user = await fetchUser();
    console.log(user.name);    // works
}
```

### TypeScript: `any` Defeats the Point

```typescript
// Bad: silences all errors — might as well use JS
function process(data: any) {
    data.nonExistentMethod();  // no error — but crashes at runtime
}

// Better: use unknown and narrow
function process(data: unknown) {
    if (typeof data === "string") {
        console.log(data.toUpperCase());  // now safe
    }
}
```

### CSS: Specificity Escalation

```css
/* Starting simple */
.button { color: blue; }

/* Later, another dev adds a more specific rule to "fix" it */
.sidebar .widget .button { color: red; }

/* Later still, someone adds !important to "fix" that */
.button { color: green !important; }

/* Now the cascade is broken — never get here */
/* Solution: consistent specificity from the start (all classes, no IDs for style) */
```

### HTML: Missing `alt` on Images

```html
<!-- Bad: screen readers say "image" — useless -->
<img src="hero.jpg">

<!-- Bad: empty alt on informative image — also wrong -->
<img src="chart.png" alt="">

<!-- Good: describe the content -->
<img src="chart.png" alt="Bar chart showing sales grew 40% in Q3">

<!-- OK: empty alt only for decorative images the user doesn't need to know about -->
<img src="divider.svg" alt="" role="presentation">
```

---

## Quick Comparison

| Task | HTML | CSS | JavaScript | TypeScript |
|---|---|---|---|---|
| Page structure | `<div>`, `<section>` | — | — | — |
| Styling | `class="..."` | `.class { prop: val }` | `el.classList.add(...)` | Same as JS |
| Layout | — | Flexbox / Grid | — | — |
| Click handler | `onclick="..."` (avoid) | — | `addEventListener` | Same as JS |
| Type safety | — | — | None | Compile-time |
| Async | — | — | `async/await` | Same as JS |
| Interfaces | — | — | JSDoc only | `interface` / `type` |
| Runs in browser | Yes | Yes | Yes | No (compiled to JS) |
