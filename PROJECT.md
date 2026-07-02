# StartAgro-SA-ServiceDocs

## Cél

A StartAgro-SA-ServiceDocs egy Windows asztali alkalmazás, amely a Start Agro Kft. szervizmunkalapjait dolgozza fel.

Feladata:

- dokumentummappa indexelése
- PDF munkalapok felismerése
- fotódokumentáció automatikus hozzárendelése
- PDF-ekből üzleti adatok kinyerése
- SQLite adatbázis építése
- gyors keresés partner, adószám, munkalapszám és gépadatok alapján

---

# Technológia

- Tauri 2
- React 19
- TypeScript
- Rust
- Material UI
- pdfjs-dist
- SQLite (következő fejlesztési szakasz)

---

# Architektúra

Rust

- fájlkezelés
- dokumentumok keresése
- PDF bájtok beolvasása

↓

TypeScript

- IndexService
- MatcherService
- PdfService
- PdfParser
- FieldExtractor

↓

React

- WorkOrderList
- PreviewPanel
- Search
- Sidebar

---

# Adatfolyam

Dokumentummappa

↓

Scanner

↓

Matcher

↓

WorkOrder

↓

PdfParser

↓

SQLite

↓

Kereső

---

# Adatmodell

WorkOrder

- workOrderNumber
- prefix
- pdfFile
- imageFiles

PDF parser tölti ki:

- partnerName
- taxNumber
- contactName
- email
- phone
- machineType
- serialNumber
- workType
- reportedIssue
- completedWork

---

# Fejlesztési alapelvek

- egyetlen WorkOrder modell
- Rust csak fájlkezelés
- PDF parser TypeScriptben
- PDF csak adatforrás
- SQLite lesz a végleges adatforrás
- egyszerű, olvasható kód
- kis, működő fejlesztési lépések