# Changelog

## v0.1

Projekt letrehozasa

React + Tauri

Material UI

---

## v0.2

PDF feldolgozas

pdf.js integracio

FieldExtractor

Parser

---

## v0.3

ServiceVisit parser

2. oldal feldolgozasa

Tablazat felismeres

---

## v0.4

SQLite

Schema

Migration

Database

Repository

WorkOrderRepository

ServiceVisitRepository

---

## v0.5

SQLite mentes mukodik

Foreign key javitva

Parser hibak javitva

Telefon

Email

Service Visit javitas

---

## v0.6

WorkOrderImport model

WorkOrderImportRepository

work_order_imports SQLite tabla

Build hibak javitva

---

## v0.7

IndexService incremental indexing

WorkOrderImportRepository hasznalata indexeleshez

Valtozatlan PDF-ek kihagyasa

Torolt PDF-ek eltavolitasa SQLite-bol

openai-api-key.txt gitignore

---

## v0.8

Repository separation

WorkOrderRepository csak domain persistence

WorkOrderImportRepository import lookup/update/delete

IndexService import metadata tisztitas

---

## v0.9

Schema cleanup

work_orders import metadata oszlopok eltavolitva

MigrationService compatibility cleanup

---

## v0.10

Incremental indexing regression fixes

PDF worker bundled for Tauri/Vite

Normalized path compare for import mirror

Image file paths saved and loaded

IndexService concise counters

---

## v0.11

UI refresh fix

Indexeles utan lista ujratoltese

Tallozas gomb cimke

---

## v0.12

Image thumbnails

Kivalasztott munkalap foto thumbnail megjelenites

Tauri file src hasznalata kepekhez

---

## v0.13

Sprint 7 regression fixes

Tallozas csak mappat valaszt

Tauri asset protocol engedelyezve thumbnail kepekhez

---

## v0.14

Fotodokumentacio UI refinement

Egységes thumbnail meretek

Lightbox kepnezo billentyuzet navigacioval

Ures foto allapot megjelenites

---

## v0.15

Indexing status and user feedback

Indexeles kozbeni lathato allapot

Indexeles gomb tiltasa futas kozben

Indexelesi osszesito megjelenites

Felhasznalobarat hibauzenet

---

## v0.16

Sticky header and filter UX cleanup

Sticky fo header

Sticky global keresosav

Kompakt indexelesi allapot a headerben

Duplikalt gyorskereso eltavolitva a szurok kozul

---

## v0.17

Extended parsed WorkOrder fields

Szamlazasi cim es szerviz helyszine mezok

Osszesito es lezaro munkalap mezok

Atado es atvevo mezok

SQLite schema es repository bovites

---

## Jelenlegi allapot

Tallozas nem indit indexelest, az indexeles kompakt header visszajelzest ad, es a WorkOrder adatok bovultek uj parser mezokkel.

Kovetkezo cel:

SQLite visszaolvasas fejlesztese.
