---
title: "JavaScript & TypeScript"
description: "JavaScript and TypeScript fundamentals — syntax, variables, functions, async patterns, type system, and common pitfalls."
---

**JavaScript (JS)** is a dynamically typed, interpreted language that runs natively in every web browser and on the server via Node.js. It is the only language that runs directly in browsers, making it essential for frontend development.

**TypeScript (TS)** is a typed superset of JavaScript developed by Microsoft. Every valid JS file is valid TS. TypeScript adds a static type system that compiles away to plain JS — you get type safety at development time, not runtime.

---

## Hello World

```javascript
// JavaScript — browser console or Node.js
console.log("Hello, World!");
```

```typescript
// TypeScript — same syntax, but you can add types
const message: string = "Hello, World!";
console.log(message);
```

```html
<!-- In a browser, via a script tag -->
<script>
  console.log("Hello from browser JS!");
</script>
```

---

## Variables & Data Types

```javascript
// var — function-scoped, hoisted (avoid in modern JS)
var old = "legacy";

// let — block-scoped, reassignable
let count = 0;
count = 1;

// const — block-scoped, cannot be reassigned (binding, not deep immutability)
const MAX = 100;
const person = { name: "Alice" };
person.name = "Bob";   // OK — object is mutated, not the binding itself
// person = {};        // Error — can't reassign const
```

### Dynamic Typing in JS

```javascript
let value = 42;
value = "now a string";   // perfectly legal
value = true;             // still legal

// typeof operator
console.log(typeof 42);           // "number"
console.log(typeof "hello");      // "string"
console.log(typeof null);         // "object" — historical bug!
console.log(typeof undefined);    // "undefined"
console.log(typeof {});           // "object"
console.log(typeof []);           // "object" (arrays are objects)
console.log(typeof function(){}); // "function"
```

### TypeScript Types

```typescript
// Primitives
let age:    number  = 30;
let name:   string  = "Alice";
let active: boolean = true;

// Union types
let id: number | string = "abc-123";
id = 42;  // also valid

// Arrays
let nums:  number[]       = [1, 2, 3];
let names: Array<string>  = ["Alice", "Bob"];

// Tuple — fixed-length, typed array
let pair: [string, number] = ["Alice", 30];

// Object shape with interface
interface User {
    id:      number;
    name:    string;
    email?:  string;   // optional property
}

// Type alias
type ID = string | number;
type Point = { x: number; y: number };

// Literal types
type Direction = "north" | "south" | "east" | "west";
let heading: Direction = "north";
// heading = "up";  // Error!

// Generics
function identity<T>(value: T): T {
    return value;
}
const result = identity<string>("hello");
```

---

## User Input

```javascript
// Browser — prompt dialog (blocks UI, avoid in production)
const name = prompt("Enter your name:");
console.log(`Hello, ${name}!`);

// Browser — form input via DOM
const input = document.getElementById("nameInput");
input.addEventListener("input", (e) => {
    console.log(e.target.value);
});

// Node.js — readline
import readline from "readline";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter your name: ", (name) => {
    console.log(`Hello, ${name}!`);
    rl.close();
});
```

---

## Functions

```javascript
// Function declaration (hoisted — can be called before definition)
function add(a, b) {
    return a + b;
}

// Function expression (not hoisted)
const multiply = function(a, b) {
    return a * b;
};

// Arrow function (concise, no own 'this')
const square = (x) => x * x;
const double = x => x * 2;              // single param: no parens needed
const greet  = (name) => {             // block body needs explicit return
    const msg = `Hello, ${name}!`;
    return msg;
};

// Default parameters
const greetUser = (name, greeting = "Hello") => `${greeting}, ${name}!`;

// Rest parameters
const sum = (...numbers) => numbers.reduce((acc, n) => acc + n, 0);
sum(1, 2, 3, 4);  // 10

// Destructuring parameters
const display = ({ name, age }) => console.log(`${name} is ${age}`);
display({ name: "Alice", age: 30 });
```

```typescript
// TypeScript function signatures
function divide(a: number, b: number): number {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
}

// Optional and default parameters
function connect(host: string, port: number = 3000, secure?: boolean): string {
    return `${secure ? "https" : "http"}://${host}:${port}`;
}
```

---

## Control Flow

```javascript
// Conditional
if (age >= 18) {
    console.log("Adult");
} else if (age >= 13) {
    console.log("Teenager");
} else {
    console.log("Child");
}

// Ternary
const label = age >= 18 ? "Adult" : "Minor";

// Nullish coalescing (returns right side if left is null/undefined)
const display = username ?? "Anonymous";

// Optional chaining
const city = user?.address?.city ?? "Unknown";

// switch
switch (day) {
    case "Mon":
    case "Tue":
    case "Wed":
    case "Thu":
    case "Fri":
        console.log("Weekday");
        break;
    default:
        console.log("Weekend");
}

// Loops
for (let i = 0; i < 5; i++) console.log(i);
for (const item of array)   console.log(item);   // iterables
for (const key in object)   console.log(key);    // object keys
array.forEach((item, idx) => console.log(idx, item));
```

---

## Arrays & Objects

```javascript
const arr = [1, 2, 3, 4, 5];

// Functional array methods
const doubled  = arr.map(x => x * 2);              // [2, 4, 6, 8, 10]
const evens    = arr.filter(x => x % 2 === 0);     // [2, 4]
const total    = arr.reduce((sum, x) => sum + x, 0); // 15
const hasThree = arr.includes(3);                  // true
const found    = arr.find(x => x > 3);             // 4

// Spread operator
const extended = [...arr, 6, 7];
const copy     = [...arr];

// Destructuring
const [first, second, ...rest] = arr;

// Object spread
const base    = { name: "Alice", age: 30 };
const updated = { ...base, age: 31, city: "Berlin" };

// Object destructuring
const { name, age, city = "Unknown" } = updated;
```

---

## Async / Await & Promises

JavaScript is single-threaded with an event loop. Async I/O doesn't block — it schedules a callback.

```javascript
// Promise
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// async/await — syntactic sugar over Promises
async function fetchUser(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const user = await response.json();
        return user;
    } catch (err) {
        console.error("Fetch failed:", err);
        throw err;   // re-throw so callers know it failed
    }
}

// Parallel execution
const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
]);

// Promise.allSettled — doesn't short-circuit on failure
const results = await Promise.allSettled([fetchUser(1), fetchUser(99)]);
results.forEach(r => {
    if (r.status === "fulfilled") console.log(r.value);
    else                          console.error(r.reason);
});
```

---

## Classes (ES6+)

```javascript
class Animal {
    #name;   // private field (ES2022)

    constructor(name) {
        this.#name = name;
    }

    speak() {
        return `${this.#name} makes a sound.`;
    }

    get name() { return this.#name; }
}

class Dog extends Animal {
    #breed;

    constructor(name, breed) {
        super(name);
        this.#breed = breed;
    }

    speak() {
        return `${this.name} barks!`;
    }
}

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak());   // Rex barks!
```

---

## Known Problems & Pitfalls

### Type Coercion Surprises

```javascript
console.log(0 == false);     // true  (loose equality coerces types)
console.log("" == false);    // true
console.log(null == undefined); // true
console.log(null === undefined); // false

// Always use === (strict equality)
console.log(0 === false);    // false
console.log("1" === 1);      // false

// Arithmetic coercion
console.log("5" + 3);    // "53" (string concatenation!)
console.log("5" - 3);    // 2   (numeric subtraction)
console.log("5" * "2");  // 10
console.log([] + []);    // ""
console.log([] + {});    // "[object Object]"
```

### `var` Hoisting

```javascript
console.log(x);   // undefined — not ReferenceError!
var x = 5;
// var declarations are hoisted (moved to top of function), but not the assignment

// let/const are NOT accessible before declaration (temporal dead zone)
console.log(y);   // ReferenceError
let y = 5;
```

### `this` Binding

```javascript
const obj = {
    name: "Alice",
    greetArrow:   () => `Hello, ${this.name}`,          // 'this' is outer scope — probably wrong!
    greetRegular: function() { return `Hello, ${this.name}`; }  // 'this' is obj
};

console.log(obj.greetRegular());   // Hello, Alice
console.log(obj.greetArrow());     // Hello, undefined

// Common fix: bind, or use regular function, or arrow in class method context
const greet = obj.greetRegular.bind(obj);
```

### NaN Is Not Equal to Itself

```javascript
const result = parseInt("abc");  // NaN
console.log(result === NaN);     // false — NaN !== NaN!
console.log(isNaN(result));      // true
console.log(Number.isNaN(result)); // true (stricter — doesn't coerce)
```

### Floating Point

```javascript
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false!

// Workaround
const EPSILON = Number.EPSILON;
Math.abs(0.1 + 0.2 - 0.3) < EPSILON;  // true
// Or use integer arithmetic: store cents instead of dollars
```

---

## Quick Reference

| Task | JavaScript | TypeScript |
|---|---|---|
| Declare variable | `let x = 5` | `let x: number = 5` |
| Constant | `const X = 5` | `const X: number = 5` |
| Arrow function | `(a, b) => a + b` | `(a: number, b: number): number => a + b` |
| Null check | `x ?? "default"` | same |
| Optional chain | `obj?.prop` | same |
| Strict equality | `===` | same |
| Async function | `async function f() { await ... }` | same |
| Type annotation | N/A | `let x: string` |
| Interface | N/A | `interface Foo { bar: string }` |
| Union type | N/A | `string \| number` |
