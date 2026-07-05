# StartAgro – Service Documents

## Cél

A Start Agro Kft. szerviz munkalapjainak digitális feldolgozása.

Az alkalmazás:

- PDF munkalapokat indexel
- JPG fotókat párosít
- SQLite adatbázisba ment
- kereshető adatbázist épít
- megjeleníti a munkalapokat
- PDF előnézetet biztosít

---

## Technológia

- Tauri 2
- React
- TypeScript
- Vite
- Material UI
- SQLite (@tauri-apps/plugin-sql)
- pdf.js

---

## Build / Release

Frontend production build:

`npm.cmd run build`

Windows Tauri release build:

`npm.cmd run tauri build`

NSIS setup masolasa tiszta install mappaba:

`npm.cmd run release:copy`

Teljes Windows release build es masolas:

`npm.cmd run release:build`

Elsoleges install artifact:

`install/StartAgro-ServiceDocs-Setup.exe`

Release Candidate ellenorzes:

1. `npm.cmd run build`
2. `npm.cmd run tauri build`
3. `npm.cmd run release:copy`
4. Ellenorizd, hogy letezik: `install/StartAgro-ServiceDocs-Setup.exe`
5. Tiszta telepites utan manualis ellenorzes:
   - alkalmazas indul
   - mappa tallozas mukodik
   - indexeles lefut
   - SQLite-bol visszatoltes mukodik
   - kereses es szurok mukodnek
   - PDF preview, foto thumbnail es lightbox mukodik
   - desktop shortcut ikon inditas utan is helyes marad

---

## Projekt filozófia

Offline desktop alkalmazás.

Minden adat helyben tárolódik.

Nincs backend.

Nincs felhő.

Gyors működés.

Egyszerű karbantarthatóság.

---

## Architektúra

PDF

↓

Parser

↓

Model

↓

Repository

↓

SQLite

↓

React Context

↓

UI

---

## Fő modulok

- PDF Engine
- Parser Engine
- SQLite Repository
- Search Engine
- Preview Engine

---

## Jelenlegi állapot

PDF indexelés működik

PDF parser működik

SQLite mentés működik

Repository működik

ServiceVisit parser működik

A következő feladat:

SQLite visszaolvasás
