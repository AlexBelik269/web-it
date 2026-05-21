---
title: "Design Patterns"
description: "Common software design patterns — creational, structural, and behavioural — with annotated code examples and when to apply each."
---

**Design patterns** are reusable solutions to recurring problems in software design. They are not ready-made code you paste in — they are templates that describe *how to solve a class of problem* in a way that is flexible, maintainable, and well-understood by other engineers.

Patterns are divided into three categories (from the original Gang of Four book):

| Category | Concern | Examples |
|---|---|---|
| **Creational** | How objects are created | Factory, Singleton, Builder |
| **Structural** | How objects are composed | Adapter, Decorator, Facade |
| **Behavioural** | How objects communicate | Observer, Strategy, Command |

---

## Creational Patterns

### Factory Method

Define an interface for creating an object, but let subclasses or a factory function decide which class to instantiate. Decouples object creation from the code that uses the object.

```python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"Email: {message}")

class SmsNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"SMS: {message}")

class SlackNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"Slack: {message}")

def notifier_factory(channel: str) -> Notifier:
    channels = {
        "email": EmailNotifier,
        "sms":   SmsNotifier,
        "slack": SlackNotifier,
    }
    if channel not in channels:
        raise ValueError(f"Unknown channel: {channel}")
    return channels[channel]()

notifier = notifier_factory("slack")
notifier.send("Deploy succeeded")   # Slack: Deploy succeeded
```

**Use when:** the exact type of object to create depends on configuration or runtime conditions, and you want to isolate the creation logic.

### Singleton

Ensure a class has only one instance and provide a global access point to it.

```python
class Config:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._data = {}
        return cls._instance

    def set(self, key, val): self._data[key] = val
    def get(self, key): return self._data.get(key)

a = Config()
b = Config()
assert a is b   # same object
a.set("debug", True)
b.get("debug")  # True
```

**Use when:** you genuinely need a single shared instance (logger, config registry, connection pool).
**Caution:** singletons introduce global state, which makes testing harder. Often better replaced by dependency injection.

### Builder

Construct a complex object step-by-step, separating the construction process from the final representation.

```python
class QueryBuilder:
    def __init__(self, table: str):
        self._table      = table
        self._conditions = []
        self._columns    = ["*"]
        self._limit      = None

    def select(self, *cols: str) -> "QueryBuilder":
        self._columns = list(cols)
        return self

    def where(self, condition: str) -> "QueryBuilder":
        self._conditions.append(condition)
        return self

    def limit(self, n: int) -> "QueryBuilder":
        self._limit = n
        return self

    def build(self) -> str:
        sql = f"SELECT {', '.join(self._columns)} FROM {self._table}"
        if self._conditions:
            sql += " WHERE " + " AND ".join(self._conditions)
        if self._limit:
            sql += f" LIMIT {self._limit}"
        return sql

query = (QueryBuilder("users")
    .select("id", "name", "email")
    .where("active = true")
    .where("age > 18")
    .limit(50)
    .build())
# "SELECT id, name, email FROM users WHERE active = true AND age > 18 LIMIT 50"
```

**Use when:** constructing objects with many optional parameters, or when the same construction process must produce different representations.

---

## Structural Patterns

### Adapter

Convert the interface of a class into another interface that clients expect. Lets incompatible interfaces work together.

```python
# Existing interface that code already depends on
class EuroPowerSocket:
    def plug_in(self, euro_plug): ...

# New device with a different interface
class UKDevice:
    def connect(self, uk_plug): print("UK device powered")

# Adapter — makes UKDevice work with EuroPowerSocket
class UKToEuroAdapter:
    def __init__(self, uk_device: UKDevice):
        self.device = uk_device

    def plug_in(self, euro_plug):
        uk_plug = self._convert(euro_plug)
        self.device.connect(uk_plug)

    def _convert(self, euro_plug):
        return "uk_plug"   # translation logic
```

**Use when:** integrating third-party libraries or legacy code whose interface you cannot change.

### Decorator

Attach additional behaviour to an object dynamically, wrapping it in a decorator object that shares its interface.

```python
from abc import ABC, abstractmethod

class TextProcessor(ABC):
    @abstractmethod
    def process(self, text: str) -> str: ...

class PlainText(TextProcessor):
    def process(self, text: str) -> str:
        return text

class UpperCaseDecorator(TextProcessor):
    def __init__(self, wrapped: TextProcessor):
        self._wrapped = wrapped
    def process(self, text: str) -> str:
        return self._wrapped.process(text).upper()

class TrimDecorator(TextProcessor):
    def __init__(self, wrapped: TextProcessor):
        self._wrapped = wrapped
    def process(self, text: str) -> str:
        return self._wrapped.process(text).strip()

# Compose decorators
processor = UpperCaseDecorator(TrimDecorator(PlainText()))
processor.process("  hello world  ")   # "HELLO WORLD"
```

Python's `@decorator` syntax is a language-level implementation of this pattern.

**Use when:** you need to add or vary behaviour at runtime without subclassing, or when subclassing would lead to an explosion of subclass combinations.

### Facade

Provide a simple, unified interface to a complex subsystem. The facade doesn't add new functionality — it simplifies access.

```python
# Complex subsystem
class AuthService:
    def authenticate(self, token): ...

class OrderService:
    def create_order(self, user, items): ...

class InventoryService:
    def reserve(self, items): ...

class NotificationService:
    def send_confirmation(self, user, order): ...

# Facade — single entry point for the checkout flow
class CheckoutFacade:
    def __init__(self):
        self.auth         = AuthService()
        self.orders       = OrderService()
        self.inventory    = InventoryService()
        self.notifications = NotificationService()

    def checkout(self, token: str, items: list) -> str:
        user  = self.auth.authenticate(token)
        self.inventory.reserve(items)
        order = self.orders.create_order(user, items)
        self.notifications.send_confirmation(user, order)
        return order.id
```

**Use when:** you want to simplify a complex API for common use cases, or layer a clean interface over legacy code.

---

## Behavioural Patterns

### Observer (Publish/Subscribe)

Define a one-to-many dependency: when one object changes state, all its dependents are notified automatically.

```python
from abc import ABC, abstractmethod

class Observer(ABC):
    @abstractmethod
    def update(self, event: str, data: dict) -> None: ...

class Subject:
    def __init__(self):
        self._observers: list[Observer] = []

    def subscribe(self, observer: Observer) -> None:
        self._observers.append(observer)

    def unsubscribe(self, observer: Observer) -> None:
        self._observers.remove(observer)

    def notify(self, event: str, data: dict) -> None:
        for observer in self._observers:
            observer.update(event, data)

class StockMarket(Subject):
    def __init__(self):
        super().__init__()
        self._price = 0

    def set_price(self, price: float) -> None:
        self._price = price
        self.notify("price_changed", {"price": price})

class PriceAlert(Observer):
    def __init__(self, threshold: float):
        self.threshold = threshold
    def update(self, event, data):
        if event == "price_changed" and data["price"] > self.threshold:
            print(f"Alert! Price {data['price']} exceeded {self.threshold}")

market = StockMarket()
market.subscribe(PriceAlert(150))
market.subscribe(PriceAlert(200))
market.set_price(160)   # Alert! Price 160 exceeded 150
market.set_price(210)   # Alert! Price 210 exceeded 150 + 200
```

**Use when:** an event in one object should trigger reactions in others, without the two being tightly coupled. Underpins GUI event systems, message queues, and reactive programming.

### Strategy

Define a family of algorithms, encapsulate each one, and make them interchangeable. The strategy can be swapped at runtime.

```python
from abc import ABC, abstractmethod

class SortStrategy(ABC):
    @abstractmethod
    def sort(self, data: list) -> list: ...

class BubbleSort(SortStrategy):
    def sort(self, data):
        arr = data[:]
        for i in range(len(arr)):
            for j in range(len(arr) - i - 1):
                if arr[j] > arr[j+1]:
                    arr[j], arr[j+1] = arr[j+1], arr[j]
        return arr

class QuickSort(SortStrategy):
    def sort(self, data):
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left  = [x for x in data if x < pivot]
        mid   = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + mid + self.sort(right)

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)

sorter = Sorter(QuickSort())
sorter.sort([3, 1, 4, 1, 5, 9])

sorter.set_strategy(BubbleSort())
sorter.sort([3, 1, 4, 1, 5, 9])
```

**Use when:** you need to switch algorithms or behaviours at runtime, or want to avoid large `if/elif` chains based on type.

### Command

Encapsulate a request as an object. This lets you parameterise methods with different requests, queue or log operations, and support undo/redo.

```python
from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...
    @abstractmethod
    def undo(self) -> None: ...

class TextEditor:
    def __init__(self):
        self.text = ""

class InsertCommand(Command):
    def __init__(self, editor: TextEditor, text: str):
        self.editor = editor
        self.text   = text

    def execute(self) -> None:
        self.editor.text += self.text

    def undo(self) -> None:
        self.editor.text = self.editor.text[:-len(self.text)]

class CommandHistory:
    def __init__(self):
        self._history: list[Command] = []

    def execute(self, cmd: Command) -> None:
        cmd.execute()
        self._history.append(cmd)

    def undo(self) -> None:
        if self._history:
            self._history.pop().undo()

editor  = TextEditor()
history = CommandHistory()

history.execute(InsertCommand(editor, "Hello"))
history.execute(InsertCommand(editor, " World"))
print(editor.text)   # "Hello World"
history.undo()
print(editor.text)   # "Hello"
```

**Use when:** you need undo/redo, operation queuing, transaction logging, or want to decouple the invoker from the receiver.

### Template Method

Define the skeleton of an algorithm in a base class, deferring some steps to subclasses.

```python
class DataImporter(ABC):
    def run(self):          # template method — fixed algorithm structure
        data = self.read()
        clean = self.clean(data)
        self.save(clean)

    @abstractmethod
    def read(self) -> list: ...

    def clean(self, data: list) -> list:
        return [row for row in data if row]   # default implementation

    @abstractmethod
    def save(self, data: list) -> None: ...

class CsvImporter(DataImporter):
    def read(self):      return parse_csv("data.csv")
    def save(self, data): db.bulk_insert("records", data)

class JsonImporter(DataImporter):
    def read(self):      return parse_json("data.json")
    def save(self, data): db.bulk_insert("records", data)
```

---

## Choosing a Pattern

```mermaid
flowchart TD
    Q1{"What problem\nare you solving?"}
    Q1 -->|Complex object creation| CREATE["Creational\nFactory · Builder · Singleton"]
    Q1 -->|Connecting incompatible pieces| STRUCT["Structural\nAdapter · Decorator · Facade"]
    Q1 -->|Coordinating behaviour| BEHAV["Behavioural\nObserver · Strategy · Command"]

    CREATE -->|Which type?| C2{""}
    C2 -->|Type determined at runtime| FAC["Factory Method"]
    C2 -->|Many optional params| BUILD["Builder"]
    C2 -->|Single global instance| SING["Singleton"]

    STRUCT -->|Which type?| S2{""}
    S2 -->|Incompatible interfaces| ADAP["Adapter"]
    S2 -->|Add behaviour without subclassing| DECO["Decorator"]
    S2 -->|Simplify complex subsystem| FACA["Facade"]

    BEHAV -->|Which type?| B2{""}
    B2 -->|Event-driven updates| OBS["Observer"]
    B2 -->|Swappable algorithms| STRAT["Strategy"]
    B2 -->|Undo/redo/queuing| CMD["Command"]
```

---

## Anti-Patterns to Avoid

| Anti-pattern | Description | Fix |
|---|---|---|
| God Object | One class that knows and does everything | Break into focused classes (SRP) |
| Magic Numbers | Unexplained literals in logic | Name them as constants |
| Spaghetti Code | Tangled control flow, no structure | Refactor into functions and classes |
| Premature Optimisation | Optimising before measuring | Profile first, then optimise the bottleneck |
| Overengineering | Using patterns where simple code would do | YAGNI — You Aren't Gonna Need It |
| Singleton Abuse | Global singleton for everything | Use dependency injection instead |

---

## Related

- [OOP](/programming/oop) — the principles (SOLID, DI) that make patterns possible
- [Functional Programming](/programming/functional) — patterns like Strategy can be implemented as simple functions in FP
- [Testing](/programming/testing) — patterns like Factory and Adapter make test doubles easier to inject
