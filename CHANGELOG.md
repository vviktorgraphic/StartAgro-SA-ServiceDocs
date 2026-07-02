# Changelog

A projekt fejlesztési naplója.

A verziószámozás a főbb mérföldköveket követi.

---

# v0.2.0 (Development)

## Added

- PDF Engine előkészítése
- PdfService
- FieldExtractor
- PdfParser
- PDF byte olvasás Rustból
- WorkOrder egységes adatmodell

## Changed

- DiscoveredWorkOrder → WorkOrder
- Egységes adatmodell bevezetése
- AppContext módosítása
- MatcherService frissítése

## Architecture

- Rust kizárólag fájlkezelést végez
- PDF parser TypeScriptben működik
- PDF csak adatforrás
- SQLite lesz az elsődleges adatforrás

---

# v0.1.0

## Added

### Projekt

- Tauri 2 projekt
- React
- Material UI
- TypeScript

### Scanner

- Dokumentummappa kiválasztása
- PDF felismerés
- JPG felismerés
- Rust scanner

### Parser

- NameParser
- MatcherService

### UI

- AppContext
- WorkOrderList
- PreviewPanel
- Sidebar
- SearchBar
- Header
- StatusBar

### Core

- WorkOrder modell
- Dokumentum indexelés
- PDF és képek összerendelése

---

# Next

## v0.3

Tervezett funkciók

- SQLite
- Repository
- Index cache
- Gyors keresés
- Partner adatok
- Gépadatok

---

## v0.4

Tervezett funkciók

- PDF Preview
- Fotógaléria
- Nyomtatás
- Export

---

## v1.0

Első éles verzió.