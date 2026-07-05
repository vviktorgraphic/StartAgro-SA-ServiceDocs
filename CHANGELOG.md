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

## v0.25.2

Desktop shortcut icon hotfix

NSIS desktop shortcut explicit StartAgro-ServiceDocs.ico ikonfajlt kap

Shortcut ikon forrasa: start_agro_docs_icon.png alapjan generalt src-tauri/icons/icon.ico

---

## v0.26

Sprint 19: Final Windows identity and status bar data

Desktop shortcut ujra letrehozva explicit ikonfajllal AppUserModelID nelkul, hogy inditas utan ne valtson vissza regi shell ikon cache-re

Status bar lathato munkalap darabszamot, utolso lathato munkalapszamot es utolso sikeres indexelesi idopontot mutat

---

## v0.26.1

Status bar hotfix

Utolso index mezo eltavolitva, mert csak munkamenet allapot volt es ujrainditas utan elveszett

Status bar megtartja a lathato dokumentumszamot es az utolso lathato munkalapszamot

---

## v0.26.2

Windows desktop shortcut icon cache hotfix

Desktop shortcut ikonja verziozott telepitett StartAgro-ServiceDocs-icon-v2.ico fajlra mutat

Regi StartAgro-ServiceDocs.ico telepitett ikonfajl torolve a cache utkozes elkerulesehez

---

## v0.27

Sprint 20: Release Candidate validation

0.1.0 internal release candidate build ellenorizve: frontend build, Tauri NSIS build es release copy lefutott

Install artifact ellenorizve: install/StartAgro-ServiceDocs-Setup.exe

Manualis release tesztlepesek es ismert hatralevo validacios pontok dokumentalva

---

## 0.1.0 Internal Release

Internal 0.1.0 release veglegesitve

Verzio ellenorizve: package.json, package-lock.json, src-tauri/Cargo.toml es src-tauri/tauri.conf.json mind 0.1.0

Build ellenorzes lefutott: npm.cmd run build, npm.cmd run tauri build, npm.cmd run release:copy

Installer: install/StartAgro-ServiceDocs-Setup.exe

SHA256: 50C9E8E2DDF9AF08D548338960EB2443BA3899B1C5AF8AA9396A3BE80A070892

---

## Jelenlegi allapot

Tallozas nem indit indexelest, az indexeles kompakt header visszajelzest ad, a WorkOrder mezok PDF sorrendben jelennek meg, a globalis kereso Szervizcsapat szerint is keres, es az NSIS setup exe tiszta install mappaba masolhato.

Kovetkezo cel:

SQLite visszaolvasas fejlesztese.
