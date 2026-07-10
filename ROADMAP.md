# Roadmap

## Done Sprint 001

Projekt letrehozasa

React

Tauri

Material UI

---

## Done Sprint 002

PDF Engine

Parser

FieldExtractor

---

## Done Sprint 003

ServiceVisit parser

---

## Done Sprint 004

SQLite

Migration

Repository

Mentes

---

## Done Sprint 005

WorkOrderImport infrastruktura

WorkOrderImport model

WorkOrderImportRepository

work_order_imports SQLite tabla

---

## Done Sprint 006

IndexService import metadata atvezetese

Valtozatlan PDF kihagyasa

Torolt PDF eltavolitasa SQLite-bol

---

## Done Sprint 007

Repository separation

WorkOrderRepository domain persistence

WorkOrderImportRepository import metadata

---

## Done Sprint 008

Schema cleanup

work_orders import metadata eltavolitasa

MigrationService cleanup

---

## Done Sprint 009

Incremental indexing regression fixes

PDF worker bundled

Path normalized mirror compare

Image file paths persisted

---

## Done Sprint 010

UI refresh and browse label fix

Indexeles utan lista frissites

Tallozas cimke

---

## Done Sprint 011

Image thumbnails

WorkOrder imageFiles megjelenites

Tauri file src thumbnail

---

## Done Sprint 012

Sprint 7 regression fixes

Tallozas viselkedes javitas

Thumbnail asset protocol

---

## Done Sprint 013

Fotodokumentacio UI refinement

Thumbnail lightbox

Ures foto allapot

---

## Done Sprint 014

Indexing status and user feedback

Indexelesi allapot

Indexelesi osszesito

Hibauzenet UI

---

## Done Sprint 015

Sticky header and filter UX cleanup

Sticky header

Sticky global keresosav

Duplikalt gyorskereso eltavolitasa

---

## Done Sprint 016

Extend parsed WorkOrder fields

Uj parser mezok

SQLite schema bovites

Preview mezok megjelenitese

---

## Done Sprint 017

Sprint 11 parser hotfix

Egyszeru textItem mezo kinyeres

PDF mezosorrend Preview-ban

Hianyzo WorkOrder mezok

---

## Done Sprint 018

Portable storage review

Jelenlegi adatbazis: sqlite:startagro.db

Javasolt hordozhato strategia: valaszthato adatbazis hely, alapertelmezett a dokumentummappa melletti .startagro/startagro.db, fallback app data konyvtarba

Nyitott dontes: halozati megosztas SQLite zarolas, tobb kliens egyideju indexelese, migracio a jelenlegi adatbazisbol

---

## Done Sprint 019

Global search and filters

Header kereso bekotese

Sidebar szurok bekotese

Memoriaban szurt munkalap lista

Ures talalati allapot

---

## Done Sprint 020

Filter refinements

Alvazszam szuro

Nativ datumvalaszto szurok

Memoria alapu szures megtartasa

---

## Done Sprint 021

Production build and release preparation

Brand primary color: #b40c0e

Release nev es ablak cim

Tauri Windows build ellenorzes

---

## Done Sprint 022

Release polish and app logo

Hasznalatlan header beallitas gomb eltavolitva

StartAgro logo headerben es Tauri ikonokban

NSIS setup exe release mappaba masolasa

---

## Done Sprint 023

Install output folder and service team mapping

NSIS setup exe install mappaba masolasa

Szervizcsapat prefix-nev lista bovites

---

## Done Sprint 024

Search team support and final app icon

Globalis kereso Szervizcsapat nev es prefix szerint

Vegleges Tauri ikon start_agro_docs_icon.png forrasbol

---

## Done Release Candidate Hotfix

Windows installer ikon explicit NSIS konfiguracio

Start menu es desktop shortcut az ikonozott telepitett exe-re mutat

Desktop shortcut explicit telepitett StartAgro-ServiceDocs.ico ikonfajlt hasznal

---

## Done Sprint 019 Hotfix

Windows desktop shortcut shell identitas cache javitas

Desktop shortcut verziozott telepitett ikonfajlra allitva

Status bar valos munkalap es indexelesi adatokkal

Utolso index mezo eltavolitva, perzisztencia nelkul nem marad status bar adat

---

## Done Sprint 020 Release Candidate Validation

0.1.0 internal release candidate build ellenorizve

Install artifact: install/StartAgro-ServiceDocs-Setup.exe

Ismert hatralevo validacios pontok:

- Windows desktop shortcut ikon cache viselkedes valos telepites utan
- Portable database strategia kesobbi implementalasa
- Server es halozati megosztas tesztelese
- 50,000 fajlos nagy adathalmazon teljesitmenyteszt

---

## Done Sprint 021 Internal 0.1.0 Release

Internal 0.1.0 release veglegesitve

Final installer: install/StartAgro-ServiceDocs-Setup.exe

SHA256: 50C9E8E2DDF9AF08D548338960EB2443BA3899B1C5AF8AA9396A3BE80A070892

Hatralevo jovobeli release feladatok:

- Server es halozati megosztas tesztelese
- Portable database strategia
- 50,000 fajlos nagy adathalmazon teljesitmenyteszt
- Desktop shortcut ikon cache follow-up, ha valos telepitesen meg szukseges

---

## Done Sprint 022 Batch and resumable indexing

IndexService batch feldolgozas 100 munkalapos merettel

Fajlonkenti PDF hiba kezeles, folytathato indexelessel

Indexeles kozbeni processed / total candidates, parsed, skipped es errors progress

Linearis kepparositas nagy mappakhoz

---

## Done Sprint 023 Large indexing freeze diagnostics

IndexService batch meret 25 munkalapra csokkentve

Minden munkalap utan UI yield, progress throttling 250ms frissitesi ablakkal

Scan, batch, aktualis PDF, lassu parse, memoria es utolso mentett munkalap diagnosztika

PDF olvasas egy megnyitassal, feldolgozas utani temporary adat felszabaditassal

---

## Done Sprint 023 Large dataset validation

Tesztelt adathalmaz: 13,025 fajl osszesen

PDF fajlok: 3,191

JPG fajlok: 9,811

Elso indexeles sikeresen lefutott, 3,191 PDF feldolgozva, 0 hiba

Masodik indexeles gyorsan lefutott, valtozatlan mar indexelt fajlok helyesen kihagyva

UI reszponziv maradt a nagy adathalmaz indexelese kozben

Hatralevo teljesitmeny milestone: 50,000 fajlos validacio

---

## Done Sprint 025

XLSX munkalap tabla modul

Fo navigacio ket modullal

Munkalap gyorskereso nezet a meglevo AppShell funkcionalitassal

Munkalapok tablazat read-only XLSX nezet

datatable/test_tablazat.xlsx alapertelmezett betoltese

Elso munkalap elso nem ures sora fejlecsorkent kezelve

Dinamikus oszlopok es MUI DataGrid tabla

Globalis kereses, oszlopszures, rendezés, lathato ertek valasztas, ures/nem ures szures

XLSX fajl tallozas helyi beolvasassal

Build ellenorzes: npm.cmd run build es npm.cmd run tauri build lefutott

---

## Done Sprint 025 Hotfix

XLSX tabla jobb oldali levagasanak javitasa a teljes szulo elrendezesi lanc zsugorithato meretezesevel

Reszponziv, tobb sorba torheto tabla eszkoztar, mindig elerheto Tallozas gombbal

Szeles tablazat vizszintes gorgetese a DataGrid-en belul, ablak szintu vizszintes tulcsordulas nelkul

Teljes DataGrid lablac es lapozas 25, 50 es 100 soros lapmerettel

Build ellenorzes: npm.cmd run build es npm.cmd run tauri build lefutott

---

## Done UI Polish Sprint

Munkalap gyorskereso navigacios elem atnevezese Munkalap keresore

Modulok oszlop 270 px-re novelese es Munkalapok oszlop 370 px-re csokkentese, valtozatlan Elonezet szelesseggel

Build ellenorzes: npm.cmd run build es npm.cmd run tauri build lefutott

---

## Done Sprint 026 XLSX Hungarian localization

Hivatalos MUI X DataGrid magyar lokalizacio az XLSX munkalap tabla teljes beepitett feluleten

Magyar lapozasi tartomany szoveg a hivatalos lokalizaciobol hianyzo formatterhez

Build ellenorzes: npm.cmd run build es npm.cmd run tauri build lefutott

---

## Done XLSX empty-state hotfix

Alapertelmezett XLSX automatikus betoltes es tesztfajl fallback eltavolitva

Ures tablaallapotban Tallozas gomb hasznalatara vonatkozo magyar utmutatas

Build ellenorzes: npm.cmd run build, npm.cmd run tauri build es npm.cmd run release:copy lefutott

---

## Done XLSX multi-worksheet sprint

Minden XLSX munkalap egyszeri fajlolvasassal, eredeti munkafuzet sorrendben feldolgozva

Munkafuzet es munkalap adatmodell, memoriaban tarolt munkalaptablakkal

Munkalapvalaszto, automatikus elso munkalap es munkalapvaltaskori tablaallapot visszaallitas

Ures es egyetlen munkalapot tartalmazo munkafuzetek kezelese

Build ellenorzes: npm.cmd run build, npm.cmd run tauri build es npm.cmd run release:copy lefutott

---

## Current Sprint 026

Portable storage implementation

Konfiguralhato adatbazis hely

Dokumentummappa melletti .startagro/startagro.db

Migracio a jelenlegi startagro.db-bol

Read-only vagy nem tamogatott halozati mappa fallback

---

## Sprint 027

ImageRepository

Fotok adatbazisban

---

## Sprint 028

PDF Preview fejlesztese

Oldal navigacio

Zoom

---

## Sprint 029

Beallitasok

---

## Sprint 030

Export

PDF

Excel

CSV

---

## Sprint 031

Release hardening

Vegleges verzioszam

Installer tipus dontes

Kod alairas dontes

Portable adatbazis strategia implementalasa

---

## Sprint 032

Performance optimalizalas

---

## Sprint 033

v1.0 kiadas

---

## Sprint 034

Future backlog

SQLite visszaolvasas follow-up, ha kesobb meg szukseges
