# Architectural Decisions

## ADR-001

Offline desktop alkalmazás.

Nincs szerver.

---

## ADR-002

SQLite az egyetlen adatbázis.

---

## ADR-003

Repository minta.

UI nem érheti el közvetlenül az adatbázist.

---

## ADR-004

Parser osztályok külön fájlban.

Nem lehet parser logika a UI-ban.

---

## ADR-005

Minden módosítás teljes fájlként történik.

Nem patch-eket használunk.

---

## ADR-006

Valós PDF-ekkel tesztelünk.

Nem készítünk külön RepositoryTest vagy DatabaseTest fájlokat.

---

## ADR-007

SQLite az elsődleges adatforrás.

A UI hosszú távon kizárólag Repository-n keresztül dolgozik.

---

## ADR-008

A WorkOrder az alkalmazás központi modellje.

Minden adat ebből épül fel.