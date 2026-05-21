---
title: "C# vs Java vs Python"
description: "Side-by-side comparison of C#, Java, and Python — syntax, type systems, error handling, performance, and when to use each."
---

C#, Java, and Python are all general-purpose, object-oriented languages with garbage collection and large standard libraries. They're often compared because they overlap heavily in application domains (backends, tooling, enterprise software). This page puts them side by side so you can see the difference at a glance.

---

## At a Glance

| | C# | Java | Python |
|---|---|---|---|
| **Typing** | Static (strong) | Static (strong) | Dynamic (duck typing) |
| **Compilation** | IL → JIT (CLR/.NET) | Bytecode → JIT (JVM) | Interpreted (CPython) |
| **Syntax style** | C-family, modern | C-family, verbose | Whitespace/indentation |
| **Null safety** | Optional (`#nullable`) | Optional (`@NotNull`) | None (`None` anywhere) |
| **Primary runtime** | .NET 8+ (cross-platform) | JVM (JRE/JDK) | CPython 3.x |
| **Package manager** | NuGet | Maven / Gradle | pip / conda |
| **Main use cases** | ASP.NET, Unity, desktop | Spring Boot, Android, enterprise | Data science, scripting, AI/ML, Django/FastAPI |
| **Performance** | Fast (JIT, near-native) | Fast (JIT, JVM-tuned) | Slow (interpreted, GIL) |

---

## Hello World

```csharp
// C#
Console.WriteLine("Hello, World!");
```

```java
// Java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

```python
# Python
print("Hello, World!")
```

Python wins for brevity. Java requires the most ceremony. C# (with top-level statements in .NET 6+) is nearly as concise as Python.

---

## Variables & Types

```csharp
// C# — statically typed, type inference with var
int age       = 30;
string name   = "Alice";
double pi     = 3.14;
var city      = "Berlin";   // inferred as string
int? maybeNull = null;       // nullable value type
```

```java
// Java — statically typed, less flexible inference
int    age  = 30;
String name = "Alice";
double pi   = 3.14;
var    city = "Berlin";   // local inference (Java 10+)
Integer boxed = null;     // nullable via wrapper class
```

```python
# Python — dynamically typed, no declarations
age  = 30
name = "Alice"
pi   = 3.14
city = "Berlin"
maybe = None   # can assign to anything later
```

**Key difference:** C# and Java catch type errors at **compile time**. Python catches them at **runtime** (or via tools like mypy).

---

## Functions / Methods

```csharp
// C# — methods inside classes, or top-level in .NET 6+
static int Add(int a, int b) => a + b;

// Default + named parameters
static string Greet(string name, string greeting = "Hello")
    => $"{greeting}, {name}!";

Greet("Alice");                       // "Hello, Alice!"
Greet("Bob", greeting: "Hi");         // "Hi, Bob!"
```

```java
// Java — methods must be in a class
public static int add(int a, int b) {
    return a + b;
}

// Overloading — same name, different signature
public static String greet(String name)                  { return "Hello, " + name; }
public static String greet(String name, String greeting) { return greeting + ", " + name; }
```

```python
# Python — functions are first-class, outside classes
def add(a, b):
    return a + b

# Default + keyword arguments
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")                     # "Hello, Alice!"
greet("Bob", greeting="Hi")        # "Hi, Bob!"
```

---

## String Formatting

```csharp
// C# — string interpolation (cleanest)
string msg = $"Hello, {name}! You are {age} years old.";

// Format with alignment and number formatting
string price = $"Price: {cost:C2}";      // Currency: $3.50
string padded = $"{value,10:F2}";        // Right-aligned, 2 decimal places
```

```java
// Java — printf-style or String.format
String msg = String.format("Hello, %s! You are %d years old.", name, age);

// Java 15+ text blocks
String json = """
    {
        "name": "%s"
    }
    """.formatted(name);
```

```python
# Python — f-strings (Python 3.6+)
msg = f"Hello, {name}! You are {age} years old."

# Format specifiers
price  = f"Price: {cost:.2f}"     # 2 decimal places
padded = f"{value:>10.2f}"        # right-aligned
```

---

## Collections

```csharp
// C# — generic collections
var list = new List<int> { 1, 2, 3 };
list.Add(4);

var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
dict["c"] = 3;

// LINQ for transformation
var evens = list.Where(x => x % 2 == 0).ToList();
var sum   = list.Sum();
```

```java
// Java — collections hierarchy
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
list.add(4);

Map<String, Integer> dict = new HashMap<>(Map.of("a", 1, "b", 2));
dict.put("c", 3);

// Streams for transformation
List<Integer> evens = list.stream().filter(x -> x % 2 == 0).collect(Collectors.toList());
int sum = list.stream().mapToInt(Integer::intValue).sum();
```

```python
# Python — built-in lists, dicts, sets
lst = [1, 2, 3]
lst.append(4)

dct = {"a": 1, "b": 2}
dct["c"] = 3

# Comprehensions for transformation
evens = [x for x in lst if x % 2 == 0]
total = sum(lst)
```

---

## Error Handling

```csharp
// C# — unchecked exceptions only
try
{
    int result = int.Parse("abc");
}
catch (FormatException ex)
{
    Console.Error.WriteLine($"Parse error: {ex.Message}");
}
catch (Exception ex) when (ex.Message.Contains("overflow"))
{
    // Exception filters (C# 6+)
}
finally
{
    // Always runs
}

// Result pattern (C# alternative to exceptions for expected errors)
bool ok = int.TryParse("123", out int value);
```

```java
// Java — checked + unchecked exceptions
try {
    int result = Integer.parseInt("abc");   // unchecked
    Files.readString(Path.of("file.txt")); // checked — must handle IOException
} catch (NumberFormatException e) {
    System.err.println("Parse error: " + e.getMessage());
} catch (IOException e) {
    throw new RuntimeException("File error", e);  // wrap checked as unchecked
} finally {
    // Always runs
}
```

```python
# Python — unchecked exceptions (all RuntimeError subclasses)
try:
    result = int("abc")
except ValueError as e:
    print(f"Parse error: {e}")
except (TypeError, AttributeError):
    print("Type problem")
else:
    print("Success — runs only if no exception")
finally:
    print("Always runs")
```

**Key difference:** Java forces you to declare and handle **checked exceptions** — the compiler won't let you ignore them. C# and Python have only unchecked exceptions — forgetting to handle them causes runtime crashes.

---

## OOP: Classes & Inheritance

```csharp
// C#
public class Animal
{
    public string Name { get; }
    public Animal(string name) { Name = name; }
    public virtual string Speak() => $"{Name} makes a sound.";
}

public class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override string Speak() => $"{Name} barks!";
}
```

```java
// Java
public class Animal {
    protected final String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return name + " makes a sound."; }
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }
    @Override
    public String speak() { return name + " barks!"; }
}
```

```python
# Python
class Animal:
    def __init__(self, name: str):
        self.name = name

    def speak(self) -> str:
        return f"{self.name} makes a sound."

class Dog(Animal):
    def speak(self) -> str:
        return f"{self.name} barks!"
```

---

## Async / Concurrency

```csharp
// C# — async/await, TPL, Tasks
async Task<string> FetchAsync(string url)
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);
}

// Parallel
var results = await Task.WhenAll(FetchAsync(url1), FetchAsync(url2));
```

```java
// Java — CompletableFuture (Java 8+), virtual threads (Java 21+)
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> fetchData());
String result = future
    .thenApply(String::toUpperCase)
    .exceptionally(ex -> "Error: " + ex.getMessage())
    .get();

// Java 21 virtual threads (Project Loom)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> doWork());
}
```

```python
# Python — asyncio (single-threaded, I/O concurrency)
import asyncio, aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(fetch(session, url1), fetch(session, url2))

# For CPU-bound parallelism use multiprocessing (bypasses GIL)
from concurrent.futures import ProcessPoolExecutor
with ProcessPoolExecutor() as pool:
    results = list(pool.map(compute, data))
```

---

## Performance Comparison

| Benchmark area | C# | Java | Python |
|---|---|---|---|
| Startup time | Fast (AOT option with NativeAOT) | Slow (JVM warmup) | Fast |
| Throughput (after warmup) | Near-native | Near-native | 10–100× slower |
| Memory | Moderate | Higher (JVM overhead) | Moderate |
| CPU parallelism | Yes (true multi-thread) | Yes (true multi-thread) | Hampered by GIL |
| GC pauses | Low (generational GC) | Configurable (G1, ZGC, Shenandoah) | Simple, shorter pauses |

Python's slowness rarely matters for I/O-bound work (web requests, DB queries). For CPU-bound tasks, use C extensions (NumPy, PyTorch) or switch languages.

---

## When to Use Which

| Scenario | Best choice | Why |
|---|---|---|
| Enterprise backend / microservices | Java (Spring Boot) or C# (ASP.NET) | Mature ecosystems, tooling, long-term support |
| Windows-first or Microsoft stack | C# | Deep .NET integration, Azure SDKs |
| Cross-platform desktop apps | C# (MAUI) or Java (JavaFX) | Native feel |
| Data science / ML / AI | Python | NumPy, pandas, PyTorch, scikit-learn dominate |
| Scripting & automation | Python | Fast to write, huge stdlib |
| Android apps | Java or Kotlin (Kotlin preferred) | Android SDK |
| Game development | C# (Unity) | Unity's primary language |
| Rapid prototyping | Python | Least ceremony |

---

## Common Gotchas Side by Side

| Gotcha | C# | Java | Python |
|---|---|---|---|
| Null errors | `NullReferenceException` | `NullPointerException` | `AttributeError` / `TypeError` on `None` |
| String equality | `==` works (overloaded) | Use `.equals()` — `==` is reference | `==` compares value (always use `==`) |
| Integer overflow | Silent wrap (use `checked`) | Silent wrap | Arbitrary precision — no overflow |
| Default mutables | Not applicable | `Collections.unmodifiableList` | Mutable default args trap |
| Async pitfall | Forgetting `await` | `.get()` blocks on CompletableFuture | Missing `await` on coroutine |
