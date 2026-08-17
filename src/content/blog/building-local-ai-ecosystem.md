---
title: "Building a Local-First Multi-Agent AI Ecosystem: Emma, Luna & Aqua"
description: "How I built three specialized AI agents running entirely on a ThinkPad T490 with Void Linux, using Ollama, Vosk, Piper TTS, and ChromaDB — no cloud dependencies."
pubDate: 2025-01-15
updatedDate: 2025-01-20
tags: ["AI", "Local LLMs", "Python", "FastAPI", "Void Linux", "Agent Orchestration"]
draft: false
---

## The Vision

Most AI assistants today are cloud-dependent, privacy-invasive, and generic. I wanted something different: **a personal AI ecosystem that runs entirely locally**, understands my workflow, and respects my data. Three agents, each with a distinct role:

| Agent | Role | Specialization |
|-------|------|----------------|
| **Emma** | Personal OS | Planning, tasks, reminders, voice, scheduling |
| **Luna** | Coding Agent | Code generation, tool calling, file ops, LSP |
| **Aqua** | Research Agent | Quizzes, literature review, web search, vector search |

All running on a **ThinkPad T490 (i7-8th gen, 16GB RAM)** with **Void Linux (runit + XBPS)**.

---

## Why Local-First?

```bash
# Zero cloud dependencies
$ ollama serve                    # Local LLM inference
$ python -m vosk                   # Offline speech recognition  
$ piper --model amy.onnx           # Neural TTS, fully offline
$ chroma run --path ./data         # Local vector database
```

**Benefits:**
- **Privacy**: No data leaves your machine
- **Cost**: $0 API fees, runs on hardware you own
- **Control**: Custom models, prompts, tooling
- **Reliability**: Works offline, no rate limits

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VOID ECOSYSTEM                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│      Emma       │      Luna       │         Aqua            │
│  (Personal OS)  │  (Code Agent)   │    (Research)           │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • FastAPI       │ • Rich TUI      │ • FastAPI               │
│ • 4-tier memory │ • Tool calling  │ • ChromaDB vectors      │
│ • Vosk + Piper  │ • Session persist│ • DuckDuckGo search     │
│ • runit service │ • Multi-provider│ • Quiz generation       │
└────────┬────────┴────────┬────────┴───────────┬──────────────┘
         │                 │                    │
         └─────────────────┴────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Shared Infrastructure │
              ├─────────────────────────┤
              │ • Ollama (LLM inference)│
              │ • SQLite (structured)   │
              │ • ChromaDB (vectors)    │
              │ • Void Linux + runit    │
              └─────────────────────────┘
```

---

## Emma: The Personal OS

Emma started as a simple task manager but evolved into a **four-tier memory system**:

```python
# core/memory/__init__.py
class MemoryManager:
    """Four completely separate SQLite tables"""
    
    def __init__(self, db_path: str):
        self.long_term = LongTermMemory(db_path)      # Permanent facts
        self.project = ProjectMemory(db_path)         # Project-scoped
        self.daily = DailyMemory(db_path)             # Today's context
        self.conversation = ConversationMemory(db_path)  # Chat history
```

**Key insight**: Separate memory tiers prevent context pollution. Your grocery list doesn't mix with your code architecture decisions.

### Voice Interface (Fully Offline)

```bash
# Wake word → STT → Intent gate → LLM → TTS → Audio
hey emma → "schedule meeting tomorrow 2pm" → Emma confirms → speaks response
```

- **Vosk** for speech recognition (~40MB model)
- **Piper TTS** with Chatterbox voice cloning (350M params)
- **Intent gate** filters false wake-word triggers
- **Streaming SSE** — Emma starts speaking before full response generated

---

## Luna: The Coding Agent

Luna is an **opencode-style CLI agent** with tool calling:

```python
# core/tools/file_ops.py
class ReadFileTool(BaseTool):
    name = "read_file"
    description = "Read a file from the workspace"
    parameters = {
        "type": "object",
        "properties": {
            "path": {"type": "string", "description": "File path"}
        }
    }
    
    async def execute(self, path: str) -> str:
        return Path(path).read_text()
```

**Tools available**: `read_file`, `write_file`, `edit_file`, `shell`, `grep`, `glob`, `lsp_hover`, `lsp_goto_def`

### Session Persistence

```python
# core/session/manager.py
class SessionManager:
    """SQLite-backed, resume exactly where you left off"""
    
    async def save(self, session: Session) -> None:
        # Serializes: messages, tool calls, working directory, env
        pass
    
    async def load(self, session_id: str) -> Session:
        # Restores full context
        pass
```

Run `./luna` — pick up yesterday's refactoring instantly.

---

## Aqua: The Research Agent

Aqua focuses on **knowledge work**: quizzes, literature review, document ingestion.

### Vector Search with ChromaDB

```python
# core/knowledge/vector_store.py
class KnowledgeBase:
    def __init__(self, path: str, embedding_model: str = "all-MiniLM-L6-v2"):
        self.client = chromadb.PersistentClient(path=path)
        self.collection = self.client.get_or_create_collection("knowledge")
        self.embedder = SentenceTransformer(embedding_model)
    
    async def ingest(self, documents: list[Document]) -> None:
        embeddings = self.embedder.encode([d.content for d in documents])
        self.collection.add(
            embeddings=embeddings,
            documents=[d.content for d in documents],
            metadatas=[d.metadata for d in documents],
            ids=[d.id for d in documents]
        )
    
    async def search(self, query: str, k: int = 5) -> list[Result]:
        query_emb = self.embedder.encode(query)
        return self.collection.query(query_embeddings=[query_emb], n_results=k)
```

### Quiz Generation Pipeline

```python
async def generate_quiz(topic: str, num_questions: int = 10) -> Quiz:
    # 1. Search web + local knowledge base
    context = await gather_context(topic)
    
    # 2. LLM generates questions with explanations
    prompt = QUIZ_PROMPT.format(topic=topic, context=context, n=num_questions)
    raw = await llm.generate(prompt, schema=QuizSchema)
    
    # 3. Validate & format
    return Quiz.parse(raw)
```

---

## Running on Void Linux

Void's **runit** makes service management clean:

```bash
# /etc/sv/emma/run
#!/bin/sh
exec 2>&1
cd /home/void/AI/emma
exec ./run.sh
```

```bash
# Enable
sudo ln -s /etc/sv/emma /var/service/
sv status emma  # ✓ running
```

**Why Void?**
- `runit` > systemd for simplicity
- `XBPS` source-based, fast, reproducible
- Musl libc option, minimal attack surface
- Rolling release, no version upgrade hell

---

## Hardware Reality Check

| Component | Spec | Handles |
|-----------|------|---------|
| CPU | i7-8650U (4C/8T) | Ollama 7B-13B models |
| RAM | 16GB DDR4 | ChromaDB + LLM + OS |
| Storage | NVMe SSD | Fast model loading |
| Audio | Built-in mic/speakers | Vosk + Piper TTS |

**Model recommendations for 16GB:**
- `llama3.1:8b` — general chat, coding
- `codellama:7b` — specialized code
- `nomic-embed-text` — embeddings (tiny, fast)

---

## What's Next

- [ ] **Inter-agent communication** — Emma delegates coding to Luna, research to Aqua
- [ ] **Shared memory bus** — Cross-agent context without duplication
- [ ] **ESP32 voice satellite** — Hardware wake-word device for whole-house coverage
- [ ] **ChromaDB semantic recall** — Fuzzy memory search across all agents

---

## Getting Started

```bash
# Clone all three
git clone https://github.com/DankChamp/emma
git clone https://github.com/DankChamp/luna
git clone https://github.com/DankChamp/aqua

# Each has ./setup.sh for one-command install
cd emma && ./setup.sh
cd ../luna && ./setup.sh
cd ../aqua && ./setup.sh
```

All MIT licensed. Contributions welcome.

---

*Built on Void Linux • ThinkPad T490 • Zero cloud dependencies*