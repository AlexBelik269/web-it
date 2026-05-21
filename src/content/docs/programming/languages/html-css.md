---
title: "HTML & CSS"
description: "HTML and CSS fundamentals — page structure, common elements, selectors, the box model, Flexbox, Grid, and practical patterns."
---

**HTML (HyperText Markup Language)** defines the **structure and content** of web pages using nested elements (tags). It is not a programming language — it has no logic, loops, or variables. It describes _what_ is on the page.

**CSS (Cascading Style Sheets)** controls the **visual presentation** — layout, colors, fonts, spacing, animations. CSS rules select HTML elements and apply declarations to style them.

Together, HTML provides the skeleton and CSS provides the skin. JavaScript adds the behavior.

---

## HTML Page Structure

Every HTML document follows the same basic skeleton:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta information — not visible on the page -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Visible content goes here -->
    <h1>Hello, World!</h1>
    <p>This is a paragraph.</p>

    <script src="app.js"></script>   <!-- JS at end of body to not block rendering -->
</body>
</html>
```

| Part | Purpose |
|---|---|
| `<!DOCTYPE html>` | Tells the browser to use modern HTML5 parsing |
| `<html lang="en">` | Root element; `lang` helps screen readers |
| `<head>` | Metadata, styles, scripts — not rendered as content |
| `<meta charset>` | Character encoding (always UTF-8) |
| `<meta viewport>` | Makes the page responsive on mobile |
| `<body>` | All visible content |

---

## Common HTML Elements

### Text & Headings

```html
<h1>Main Heading</h1>   <!-- Only one h1 per page (SEO) -->
<h2>Sub Heading</h2>
<h3>Sub-sub Heading</h3>

<p>This is a paragraph. It wraps automatically.</p>
<p>Text can be <strong>bold</strong>, <em>italic</em>, or <u>underlined</u>.</p>
<p>Inline code: <code>console.log("hi")</code></p>

<br>   <!-- line break — use sparingly, prefer CSS margins -->
<hr>   <!-- horizontal rule / divider -->
```

### Links & Images

```html
<!-- Absolute link -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
    Visit Example
</a>

<!-- Relative link -->
<a href="/about">About</a>
<a href="#section-id">Jump to section</a>

<!-- Image -->
<img src="photo.jpg" alt="Descriptive text for screen readers" width="400" height="300">

<!-- alt is required for accessibility — never leave it empty unless decorative -->
```

### Lists

```html
<!-- Unordered (bullets) -->
<ul>
    <li>Apples</li>
    <li>Bananas</li>
    <li>Oranges</li>
</ul>

<!-- Ordered (numbered) -->
<ol>
    <li>First step</li>
    <li>Second step</li>
    <li>Third step</li>
</ol>

<!-- Description list (term / definition) -->
<dl>
    <dt>HTML</dt>
    <dd>Structure and content</dd>
    <dt>CSS</dt>
    <dd>Presentation and layout</dd>
</dl>
```

### Tables

```html
<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Age</th>
            <th>City</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Alice</td>
            <td>30</td>
            <td>Berlin</td>
        </tr>
        <tr>
            <td>Bob</td>
            <td>25</td>
            <td>London</td>
        </tr>
    </tbody>
</table>
```

### Forms & Inputs

```html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text"     id="name"  name="name"  required placeholder="Alice">

    <label for="email">Email:</label>
    <input type="email"    id="email" name="email" required>

    <label for="age">Age:</label>
    <input type="number"   id="age"   name="age"   min="0" max="120">

    <label for="bio">Bio:</label>
    <textarea id="bio" name="bio" rows="4" cols="40"></textarea>

    <label for="role">Role:</label>
    <select id="role" name="role">
        <option value="">-- Choose --</option>
        <option value="dev">Developer</option>
        <option value="designer">Designer</option>
    </select>

    <label>
        <input type="checkbox" name="agree" value="yes"> I agree
    </label>

    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
</form>
```

### Semantic Elements

Use semantic tags to give meaning — they help screen readers and SEO.

```html
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    <article>
        <h2>Article Title</h2>
        <p>Article content...</p>
    </article>

    <aside>
        <p>Related links or sidebar</p>
    </aside>
</main>

<footer>
    <p>&copy; 2024 My Site</p>
</footer>

<!-- div and span are non-semantic containers -->
<div class="card">          <!-- block-level grouping -->
    <span class="badge">New</span>   <!-- inline grouping -->
</div>
```

---

## CSS Fundamentals

### Selectors

```css
/* Element selector */
p { color: navy; }

/* Class selector */
.card { background: white; }

/* ID selector (use sparingly — too specific) */
#header { position: sticky; top: 0; }

/* Attribute selector */
input[type="text"] { border: 1px solid #ccc; }

/* Descendant: p inside .card */
.card p { margin: 0; }

/* Direct child: li directly inside ul */
ul > li { list-style: square; }

/* Adjacent sibling: h2 immediately followed by p */
h2 + p { font-size: 1.1rem; }

/* General sibling: all p after h2 */
h2 ~ p { color: gray; }

/* Pseudo-class */
a:hover       { text-decoration: underline; }
li:first-child { font-weight: bold; }
li:nth-child(2n) { background: #f0f0f0; }   /* every even item */
input:focus   { outline: 2px solid blue; }

/* Pseudo-element */
p::first-line  { font-weight: bold; }
p::before      { content: "→ "; }

/* Combinators */
.nav a, .footer a { color: inherit; }   /* comma = OR */
```

### The Box Model

Every element is a rectangular box composed of (from inside out): **content → padding → border → margin**.

```css
.box {
    /* Content */
    width:  200px;
    height: 100px;

    /* Padding — space inside the border */
    padding: 16px;             /* all sides */
    padding: 8px 16px;         /* top/bottom left/right */
    padding: 4px 8px 12px 16px; /* top right bottom left */

    /* Border */
    border: 2px solid #333;
    border-radius: 8px;       /* rounded corners */

    /* Margin — space outside the border */
    margin: 24px auto;        /* center horizontally */

    /* box-sizing: border-box makes width include padding+border */
    box-sizing: border-box;
}

/* Apply border-box globally — almost always a good idea */
*, *::before, *::after {
    box-sizing: border-box;
}
```

### Colors, Fonts & Units

```css
.element {
    /* Colors */
    color:            #1a1a1a;       /* hex */
    background-color: rgb(255, 255, 255);
    border-color:     rgba(0, 0, 0, 0.1);  /* with alpha */
    accent-color:     hsl(220, 90%, 56%);

    /* Typography */
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size:   1rem;    /* rem = relative to root, preferred */
    font-weight: 600;
    line-height: 1.5;     /* unitless — relative to font-size */
    letter-spacing: 0.02em;
    text-align:  center;

    /* Units */
    /* px — absolute pixels */
    /* rem — relative to root font-size (usually 16px) */
    /* em  — relative to current element's font-size */
    /* %   — relative to parent */
    /* vw/vh — viewport width/height */
}
```

---

## Flexbox

Flexbox is a one-dimensional layout model — arrange items in a **row or column**.

```css
.container {
    display: flex;
    flex-direction: row;          /* row | column | row-reverse | column-reverse */
    justify-content: space-between; /* main axis: flex-start | center | space-between | space-around */
    align-items: center;          /* cross axis: flex-start | center | stretch | flex-end */
    flex-wrap: wrap;              /* allow items to wrap to next line */
    gap: 16px;                    /* space between items */
}

.item {
    flex: 1;           /* grow to fill space equally */
    flex: 0 0 200px;   /* don't grow, don't shrink, 200px wide */
    order: 2;          /* change visual order without changing HTML */
    align-self: flex-start;   /* override container's align-items for this item */
}
```

**Common Flexbox patterns:**

```css
/* Center anything */
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Navigation bar */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
}

/* Card grid that wraps */
.card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}
.card-grid > * {
    flex: 1 1 280px;   /* grow, shrink, minimum 280px wide */
}
```

---

## CSS Grid

Grid is a two-dimensional layout model — arrange items in **rows and columns simultaneously**.

```css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;           /* 3 equal columns */
    grid-template-columns: repeat(3, 1fr);         /* same */
    grid-template-columns: 200px 1fr 1fr;          /* fixed + flexible */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));  /* responsive */
    grid-template-rows: auto;
    gap: 24px;
}

/* Span multiple cells */
.full-width {
    grid-column: 1 / -1;   /* from first to last column */
}
.tall {
    grid-row: span 2;       /* spans 2 rows */
}

/* Named template areas */
.page {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 240px 1fr;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}

.page-header  { grid-area: header; }
.page-sidebar { grid-area: sidebar; }
.page-main    { grid-area: main; }
.page-footer  { grid-area: footer; }
```

---

## Responsive Design & Media Queries

```css
/* Mobile-first: base styles are for small screens */
.container {
    padding: 16px;
    font-size: 1rem;
}

/* Apply larger-screen styles on top */
@media (min-width: 768px) {
    .container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
    }
}

@media (min-width: 1024px) {
    .container {
        font-size: 1.125rem;
    }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    body {
        background: #0f172a;
        color: #f1f5f9;
    }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## CSS Variables (Custom Properties)

```css
:root {
    --color-primary:   #2563eb;
    --color-secondary: #64748b;
    --color-bg:        #ffffff;
    --spacing-sm:      8px;
    --spacing-md:      16px;
    --spacing-lg:      32px;
    --radius:          8px;
    --font-sans:       'Inter', system-ui, sans-serif;
}

.button {
    background: var(--color-primary);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius);
    font-family: var(--font-sans);
}

/* Override in dark mode */
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #0f172a;
        --color-primary: #3b82f6;
    }
}
```

---

## Common Patterns

### Sticky Header

```css
header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Card Component

```css
.card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s;
}
.card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
```

### Button

```css
.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    user-select: none;
}
.btn:hover  { background: #1d4ed8; }
.btn:active { transform: scale(0.98); }
.btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

### Truncate Text

```css
.truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 200px;
}

/* Multi-line clamp (3 lines) */
.clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

---

## Known Problems & Pitfalls

### Specificity Wars

CSS rules are applied based on **specificity** — more specific selectors win.

```css
/* Specificity: 0-0-1 (element) */
p { color: black; }

/* Specificity: 0-1-0 (class) */
.text { color: blue; }   /* wins over element selector */

/* Specificity: 1-0-0 (ID) */
#main { color: red; }    /* wins over class */

/* Avoid !important — it breaks the cascade */
.override { color: green !important; }  /* nuclear option, last resort */

/* Better: be consistent with classes, avoid IDs for styling */
```

### Margin Collapse

Adjacent vertical margins **collapse** — the larger margin wins instead of both adding.

```css
/* These two paragraphs will have 24px between them, not 32px */
p { margin-bottom: 16px; }
h2 { margin-top: 24px; }

/* Margin does NOT collapse if: padding/border/overflow is set,
   or between flex/grid items */
```

### `inline` Elements Ignore Width/Height

```css
/* This does nothing — span is inline by default */
span { width: 200px; height: 50px; }

/* Fix: change display */
span { display: inline-block; width: 200px; height: 50px; }
/* or */
span { display: block; }
```

### Z-Index Only Works on Positioned Elements

```css
/* z-index: 999 does NOTHING here */
.badge { z-index: 999; }

/* Must add position */
.badge { position: relative; z-index: 999; }
```

---

## Quick Reference

| Task | HTML/CSS |
|---|---|
| Heading | `<h1>` to `<h6>` |
| Link | `<a href="url">text</a>` |
| Image | `<img src="..." alt="...">` |
| Container | `<div class="...">` |
| Text size | `font-size: 1rem` |
| Center (flex) | `display:flex; justify-content:center; align-items:center` |
| 3-col grid | `display:grid; grid-template-columns:repeat(3,1fr)` |
| Responsive | `@media (min-width: 768px) { ... }` |
| CSS variable | `--name: value;` → `var(--name)` |
| Rounded corners | `border-radius: 8px` |
