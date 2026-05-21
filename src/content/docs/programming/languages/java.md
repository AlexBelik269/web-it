---
title: "Java"
description: "Java language fundamentals — syntax, variables, functions, OOP, common pitfalls, and practical patterns."
---

Java is a statically typed, compiled-to-bytecode, object-oriented language that runs on the **JVM (Java Virtual Machine)**. It follows the principle of _"write once, run anywhere"_ — the same `.class` bytecode runs on any OS with a JVM. Java is widely used for enterprise backends (Spring Boot), Android apps, and large-scale distributed systems.

**Key traits:** strong typing · garbage collected · verbose but explicit · huge ecosystem (Maven/Gradle) · backward-compatible · multi-threaded by design.

---

## Hello World

```java
// Every Java program lives inside a class
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Java 21+ allows **unnamed classes** (preview) — but the classic form is still the norm.

---

## Variables & Data Types

Java has **primitive types** (stored directly) and **reference types** (objects on the heap).

```java
// Primitives
int     age    = 30;
double  pi     = 3.14159;
boolean active = true;
char    grade  = 'A';
long    big    = 9_000_000_000L;  // L suffix for long literals
float   small  = 3.14f;           // f suffix for float

// Reference types
String  name   = "Alice";
Integer boxed  = 42;              // wrapper / autoboxed int

// var — local type inference (Java 10+)
var city = "Berlin";

// Final (constant binding)
final double G = 9.81;

// String formatting
String greeting = String.format("Hello, %s! Age: %d", name, age);
// Or Java 15+ text blocks:
String json = """
    {
        "name": "%s"
    }
    """.formatted(name);
```

### Collections

```java
import java.util.*;

List<Integer>        list = new ArrayList<>(List.of(1, 2, 3));
Map<String, Integer> map  = new HashMap<>(Map.of("a", 1, "b", 2));
Set<String>          set  = new HashSet<>(Set.of("x", "y"));

// Immutable (Java 9+)
List<String> immutable = List.of("a", "b", "c");
```

---

## User Input

```java
import java.util.Scanner;

public class InputDemo {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = scanner.nextLine();

        System.out.print("Enter your age: ");
        int age = scanner.nextInt();

        System.out.printf("Hello %s, you are %d years old.%n", name, age);
        scanner.close();
    }
}
```

---

## Functions (Methods)

```java
// Static utility method
public static int add(int a, int b) {
    return a + b;
}

// Varargs — accept any number of arguments
public static int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) total += n;
    return total;
}

// Generic method
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

// Method overloading — same name, different signature
public static String greet(String name)                  { return "Hello, " + name + "!"; }
public static String greet(String name, String greeting) { return greeting + ", " + name + "!"; }
```

---

## Control Flow

```java
// if / else if / else
if (age < 13)      System.out.println("Child");
else if (age < 18) System.out.println("Teenager");
else               System.out.println("Adult");

// switch expression (Java 14+)
String category = switch (age / 10) {
    case 0, 1 -> "Child";
    case 2, 3, 4, 5 -> "Adult";
    default  -> "Senior";
};

// Traditional for
for (int i = 0; i < 5; i++) System.out.print(i + " ");

// Enhanced for (for-each)
for (String item : list) System.out.println(item);

// while / do-while
int n = 0;
while (n < 3)        { System.out.print(n++); }
do { System.out.print(n++); } while (n < 5);
```

---

## Classes & OOP

```java
public class Person {
    private String name;
    private int    age;

    // Constructor
    public Person(String name, int age) {
        this.name = name;
        this.age  = age;
    }

    // Getters / setters (Java convention)
    public String getName() { return name; }
    public int    getAge()  { return age; }
    public void   setAge(int age) {
        if (age >= 0) this.age = age;
    }

    // Override Object methods
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

// Inheritance
public class Employee extends Person {
    private String company;

    public Employee(String name, int age, String company) {
        super(name, age);   // call parent constructor
        this.company = company;
    }

    @Override
    public String toString() {
        return super.toString() + ", company='" + company + "'";
    }
}
```

---

## Streams (Java 8+)

Streams are Java's functional-style pipeline for processing collections — similar to LINQ in C#.

```java
import java.util.List;
import java.util.stream.Collectors;

var numbers = List.of(3, 1, 4, 1, 5, 9, 2, 6);

// Filter → map → collect
List<Integer> result = numbers.stream()
    .filter(n -> n > 3)
    .sorted()
    .map(n -> n * 2)
    .collect(Collectors.toList());  // [8, 8, 10, 12, 18]

// Aggregations
int    sum = numbers.stream().mapToInt(Integer::intValue).sum();
double avg = numbers.stream().mapToInt(Integer::intValue).average().orElse(0);

// String joining
String joined = numbers.stream()
    .map(String::valueOf)
    .collect(Collectors.joining(", "));  // "3, 1, 4, 1, 5, 9, 2, 6"
```

---

## Exception Handling

Java has two kinds of exceptions:
- **Checked exceptions** — must be declared (`throws`) or caught. e.g., `IOException`
- **Unchecked exceptions** — subclass of `RuntimeException`. e.g., `NullPointerException`

```java
import java.io.*;

// Checked exception — must handle
public static String readFile(String path) throws IOException {
    try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) sb.append(line).append("\n");
        return sb.toString();
    }
    // try-with-resources automatically closes the reader
}

// Multi-catch
try {
    int result = Integer.parseInt("abc");
} catch (NumberFormatException | ArithmeticException e) {
    System.err.println("Error: " + e.getMessage());
} finally {
    System.out.println("Always runs");
}
```

---

## Known Problems & Pitfalls

### NullPointerException (NPE)
The infamous "billion-dollar mistake." Any reference type can be `null`.

```java
String name = null;
name.length();   // NullPointerException at runtime!

// Safer with Optional (Java 8+)
Optional<String> opt = Optional.ofNullable(getName());
String upper = opt.map(String::toUpperCase).orElse("unknown");

// Or null checks
if (name != null) System.out.println(name.length());
```

### `==` vs `.equals()` on Strings

```java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);        // false! — different objects in memory
System.out.println(a.equals(b));   // true  — compares content

// String literals are interned, so this is a trap:
String x = "hello";
String y = "hello";
System.out.println(x == y);   // true (both point to interned constant) — don't rely on this
```

### Integer Cache Gotcha

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);   // true (JVM caches -128 to 127)

Integer c = 128;
Integer d = 128;
System.out.println(c == d);   // false! — different objects
// Always use .equals() for boxed types
```

### Checked Exceptions Boilerplate

Checked exceptions force callers to handle errors, which is good in theory but leads to verbose, swallowed exceptions in practice.

```java
// Bad: silently swallows the exception
try {
    readFile("config.txt");
} catch (IOException e) { /* ignore */ }

// Better: wrap in unchecked or log + rethrow
try {
    readFile("config.txt");
} catch (IOException e) {
    throw new RuntimeException("Failed to read config", e);
}
```

### Mutable Default Collections

```java
// List.of() returns immutable — good
List<String> safe = List.of("a", "b");

// new ArrayList() is mutable — fine, but be explicit
List<String> mutable = new ArrayList<>(List.of("a", "b"));
mutable.add("c");

// Unmodifiable wrapper (view, not deep copy)
List<String> view = Collections.unmodifiableList(mutable);
// view.add("d");  // throws UnsupportedOperationException
```

---

## Quick Reference

| Task | Java |
|---|---|
| Print | `System.out.println(x)` |
| Print (no newline) | `System.out.print(x)` |
| Read line | `scanner.nextLine()` |
| String format | `String.format("%s %d", s, n)` |
| List | `new ArrayList<>(List.of(...))` |
| Map | `new HashMap<>(Map.of(...))` |
| Null-safe | `Optional.ofNullable(x).orElse(def)` |
| Stream filter | `.stream().filter(x -> ...).collect(...)` |
| Try/catch | `try { } catch (ExType e) { }` |
| Checked throws | `public void foo() throws IOException { }` |
