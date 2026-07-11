# AGENTS.md

# StartAgro Service Documents

## Project Goal

Windows desktop application with two main modules:

- Munkalap kereső: PDF/JPG indexing, parsing, SQLite persistence, search and preview
- Munkalapok táblázat: read-only XLSX workbook viewing and filtering

Tech stack:

- Tauri 2
- TypeScript
- Rust
- SQLite

The PDF indexing workflow must remain fast and responsive with 50,000+ files.

Changes in one module must not alter the other module unless the task explicitly requires it.

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

For XLSX workbooks:

- read and parse each selected workbook only once
- keep all parsed worksheets in memory and switch without rereading the file
- preserve MUI DataGrid row virtualization for large tables
- use saved/cached workbook formula results for display
- pagination, sorting and filtering must operate on parsed row values only
- do not add a full Excel formula engine without explicit approval

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
- manual test appropriate to the change
- CHANGELOG update
- ROADMAP update
- one logical git commit
- push to origin/main

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
