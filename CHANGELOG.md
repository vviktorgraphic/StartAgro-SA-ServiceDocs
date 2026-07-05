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

## v0.18

Sprint 11 parser hotfix

Egyszeru textItem alapu mezokinyeres

PDF sorrend szerinti Preview mezok

Szallitolevel, uzemora es egyeb megallapodas mezok

---

## v0.19

Portable storage review

Jelenlegi startagro.db hely dokumentalva

Mappa melletti hordozhato adatbazis strategia rogzitve

UNC es halozati path kezeles atnezve

---

## v0.20

Global search and filters

Header kereso bekotve a betoltott munkalap listara

Sidebar szurok bekotve

Ures talalati allapot es kijeloles kezeles

---

## v0.21

Filter refinements

Alvazszam szuro cimke

Nativ datumvalaszto mezok

Meglevo memoria alapu szures megtartva

---

## v0.22

Production build and release preparation

Brand primary color frissitve: #b40c0e

Release nev es ablak cim frissitve

Windows Tauri build parancs dokumentalva

---

## v0.23

Release polish and app logo

Hasznalatlan beallitas gomb eltavolitva a headerbol

StartAgro logo hozzaadva a headerhez es Tauri ikonokhoz

NSIS setup exe masolasa release mappaba

---

## v0.24

Install output folder and service team mapping

Installer masolasi cel atnevezve install mappaba

Szervizcsapat szuro teljes prefix-nev listaval boviteve

---

## v0.25

Search team support and final app icon

Globalis kereso Szervizcsapat nev es prefix alapjan is keres

Vegleges app es installer ikon frissitve start_agro_docs_icon.png forrasbol

---

## v0.25.1

Windows shortcut icon hotfix

NSIS installer es uninstaller ikon explicit src-tauri/icons/icon.ico beallitasbol

Start menu es desktop shortcut tovabbra is az ikonozott telepitett exe-re mutat

---

## Jelenlegi allapot

Tallozas nem indit indexelest, az indexeles kompakt header visszajelzest ad, a WorkOrder mezok PDF sorrendben jelennek meg, a globalis kereso Szervizcsapat szerint is keres, es az NSIS setup exe tiszta install mappaba masolhato.

Kovetkezo cel:

SQLite visszaolvasas fejlesztese.
