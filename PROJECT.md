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
