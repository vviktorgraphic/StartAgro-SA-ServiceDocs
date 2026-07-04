# AGENTS.md

# StartAgro Service Documents

## Project Goal

Desktop application for indexing, parsing and searching agricultural service PDF documents.

Tech stack:

- Tauri 2
- TypeScript
- Rust
- SQLite

The application must remain fast with 50,000+ PDF documents.

---

# Architecture

The project follows a layered architecture.

Rust
- file scanning

Services
- indexing
- parsing
- matching

Repositories
- SQLite access only

Models
- domain objects only

The domain model must never contain infrastructure metadata.

Example:

WorkOrder
    ✅ business data

WorkOrderImport
    ✅ import/index metadata

---

# Development Rules

Always make the smallest possible change.

Never refactor unless it is required for the current task.

Do not redesign working code.

Keep the application buildable after every task.

Prefer readability over clever code.

Reuse existing patterns.

---

# Repository Rules

Repository classes only access SQLite.

Business logic never belongs in repositories.

---

# Import Rules

SQLite is always a mirror of the document folder.

Rules:

- new PDF → parse
- modified PDF → parse
- unchanged PDF → skip
- deleted PDF → remove from SQLite

Import metadata belongs to WorkOrderImport.

Never store import metadata inside WorkOrder.

---

# Sprint Workflow

Every sprint must end with:

- build
- test
- CHANGELOG update
- ROADMAP update
- git commit
- git push

---

# Code Style

Keep functions small.

Avoid duplicated code.

Prefer existing naming.

Do not introduce new libraries unless requested.

Avoid unnecessary comments.

---

# Communication

When implementing:

1. Read the current code first.
2. Follow existing patterns.
3. Change only what is necessary.
4. Keep responses concise.

The goal is a stable application, not perfect architecture.