---
title: "Using AI APIs"
description: "Practical guide to calling AI APIs in code — OpenAI and Anthropic SDK examples, streaming, tool use, error handling, and cost management."
---

Both OpenAI and Anthropic provide simple REST APIs and official SDKs for Python, JavaScript/TypeScript, and other languages. This page walks through the core patterns you need to integrate LLMs into your own applications.

---

## Getting Started

### Install SDKs

```bash
# Python
pip install openai anthropic

# Node.js / TypeScript
npm install openai @anthropic-ai/sdk
```

### API Keys

```python
# Set as environment variable (never hardcode in source)
import os
openai_key = os.environ["OPENAI_API_KEY"]
anthropic_key = os.environ["ANTHROPIC_API_KEY"]
```

```bash
# .env file (use python-dotenv or similar to load)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Always store keys in environment variables or a secrets manager — never commit them to source control. See [Auth / API Keys](/auth/tokens/api-keys).

---

## Basic Completion

### OpenAI (Python)

```python
from openai import OpenAI

client = OpenAI()  # reads OPENAI_API_KEY from env

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain what an API is in one paragraph."}
    ]
)

print(response.choices[0].message.content)
```

### Anthropic / Claude (Python)

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system="You are a helpful assistant.",
    messages=[
        {"role": "user", "content": "Explain what an API is in one paragraph."}
    ]
)

print(message.content[0].text)
```

---

## Multi-Turn Conversation

To hold a conversation, include all previous messages in each request. The API is stateless — you maintain the history.

```python
from openai import OpenAI

client = OpenAI()
conversation = [
    {"role": "system", "content": "You are a helpful Python tutor."}
]

def chat(user_message: str) -> str:
    conversation.append({"role": "user", "content": user_message})
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation
    )
    
    assistant_message = response.choices[0].message.content
    conversation.append({"role": "assistant", "content": assistant_message})
    return assistant_message

print(chat("What is a list comprehension?"))
print(chat("Can you show me an example?"))  # model remembers previous turn
```

---

## Streaming Responses

Instead of waiting for the full response, stream tokens as they are generated. This dramatically improves perceived latency.

```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Write a haiku about Python."}],
    stream=True
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
print()  # newline at end
```

```python
# Streaming with Anthropic
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=256,
    messages=[{"role": "user", "content": "Write a haiku about Python."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

---

## Tool Use (Function Calling)

Tool use lets you give the model a set of functions it can call, and it will ask you to run them when needed. This is how AI agents interact with the outside world.

```python
from openai import OpenAI
import json

client = OpenAI()

# Define the tools available to the model
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "The city name, e.g. London"
                    }
                },
                "required": ["city"]
            }
        }
    }
]

def get_weather(city: str) -> dict:
    # In reality: call a real weather API
    return {"city": city, "temperature": "18°C", "condition": "Cloudy"}

messages = [{"role": "user", "content": "What's the weather in Paris?"}]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools
)

# Check if the model wants to call a function
if response.choices[0].finish_reason == "tool_calls":
    tool_call = response.choices[0].message.tool_calls[0]
    args = json.loads(tool_call.function.arguments)
    
    # Execute the function
    result = get_weather(**args)
    
    # Send result back to model
    messages.append(response.choices[0].message)  # add assistant message
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": json.dumps(result)
    })
    
    final = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    print(final.choices[0].message.content)
    # "The current weather in Paris is 18°C and cloudy."
```

---

## Structured Output (JSON Mode)

Force the model to return valid JSON matching a schema.

```python
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI()

class BookSummary(BaseModel):
    title: str
    author: str
    key_themes: list[str]
    difficulty: str  # beginner / intermediate / advanced

response = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[{
        "role": "user",
        "content": "Summarise 'The Pragmatic Programmer' by Andy Hunt and Dave Thomas."
    }],
    response_format=BookSummary
)

book = response.choices[0].message.parsed
print(book.title)        # "The Pragmatic Programmer"
print(book.key_themes)   # ["DRY principle", "automation", "craftsmanship", ...]
```

---

## Error Handling

```python
from openai import OpenAI, RateLimitError, APIError
import time

client = OpenAI()

def call_with_retry(messages, retries=3):
    for attempt in range(retries):
        try:
            return client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
        except RateLimitError:
            if attempt < retries - 1:
                wait = 2 ** attempt  # exponential backoff: 1s, 2s, 4s
                print(f"Rate limited. Waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
        except APIError as e:
            print(f"API error: {e}")
            raise
```

---

## Cost Estimation

Before running a task at scale, estimate the cost:

```python
import tiktoken

def estimate_cost(text: str, model="gpt-4o-mini") -> dict:
    enc = tiktoken.encoding_for_model(model)
    input_tokens = len(enc.encode(text))
    
    # prices per 1M tokens (approximate, check current pricing)
    prices = {
        "gpt-4o":      {"input": 5.00, "output": 15.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    }
    
    price = prices.get(model, prices["gpt-4o-mini"])
    input_cost = (input_tokens / 1_000_000) * price["input"]
    
    return {
        "input_tokens": input_tokens,
        "estimated_input_cost_usd": round(input_cost, 6)
    }

print(estimate_cost("Summarise the entire works of Shakespeare"))
# {'input_tokens': 9, 'estimated_input_cost_usd': 0.0000014}
```

---

## Working with Files and Images

### Sending an image (GPT-4o / Claude 3)

```python
import base64
from openai import OpenAI

client = OpenAI()

with open("screenshot.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_data}"}
            }
        ]
    }]
)
print(response.choices[0].message.content)
```

---

## Quick Reference

| Task | OpenAI | Anthropic |
|---|---|---|
| Basic completion | `client.chat.completions.create()` | `client.messages.create()` |
| Streaming | `stream=True` | `client.messages.stream()` |
| Token count | `tiktoken` library | `client.messages.count_tokens()` |
| Tool use | `tools=` parameter | `tools=` parameter |
| JSON output | `response_format=` | Prompt + instruct |
| Embedding | `client.embeddings.create()` | Third-party or Amazon Titan |

---

## Next Steps

- [Prompt Engineering](/ai/llm/prompting) — making the most of your API calls
- [Tokens & Context](/ai/llm/tokens-and-context) — managing context and costs
- [Training vs Inference](/ai/concepts/training-vs-inference) — RAG and fine-tuning for custom needs
- [Auth / API Keys](/auth/tokens/api-keys) — securely managing API credentials
