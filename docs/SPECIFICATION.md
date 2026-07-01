# SA-ServiceDocs

## Cél

A SA-ServiceDocs egy offline, hordozható Windows alkalmazás, amely StartAgro szervizmunkalapok gyors keresésére, megjelenítésére és kezelésére szolgál.

Az alkalmazás elsődleges célja, hogy több ezer PDF munkalap között néhány másodperc alatt lehessen keresni internetkapcsolat nélkül.

---

# Platform

- Windows
- Tauri v2
- React
- TypeScript
- Rust
- SQLite + FTS5

---

# Portable működés

Az alkalmazás egyetlen mappából fut.

A mappában található:

- alkalmazás
- adatbázis
- beállítások

Másik számítógépre egyszerűen átmásolható.

---

# Dokumentumok

Minden munkalaphoz tartozik

- 1 PDF
- 0..N JPG

Példa

HT-0008218 munkalap - Marján Zoltán _ 01_07_2026.pdf

HT-0008218-Marjan-Zoltan-2025-05-14-00.jpg

HT-0008218-Marjan-Zoltan-2025-05-14-001.jpg

---

# Dokumentum azonosító

A dokumentum egyedi azonosítója

(prefix, number)

Példa

Prefix:

HT

Sorszám:

8218

A sorszám növekvő.

Nem feltétlenül folyamatos.

---

# Indexelés

Az indexelő csak az új PDF-eket dolgozza fel.

A már indexelt dokumentumokat nem dolgozza fel újra.

---

# Adatbázis

SQLite

FTS5

---

# Tárolt adatok

- prefix
- documentNumber
- originalFileName
- partnerName
- partnerNameNormalized
- technician
- technicianNormalized
- machineType
- machineTypeNormalized
- serialNumber
- documentDate
- pdfPath
- pdfHash
- parserVersion
- fullText

---

# Keresés

A keresés

- kis/nagybetű független
- ékezet független

Kereshető

- munkalapszám
- partner
- technikus
- géptípus
- gyári szám
- teljes szöveg

---

# Parser

Az alkalmazás eltárolja

- az eredeti értéket
- a normalizált értéket
- az adat forrását

Forrás lehet

- PDF
- Filename

---

# Képek

A JPG fájlok automatikusan a PDF-hez kapcsolódnak.

A kapcsolat alapja

HT-0008218

---

# Státuszsor

Megjeleníti

- dokumentumok száma
- legnagyobb munkalapszám
- utolsó indexelés időpontja

---

# Fejlesztési alapelvek

- Offline működés
- Gyors keresés
- Hosszú távú karbantarthatóság
- Stabil működés
- Tiszta architektúra
- Teljes TypeScript típusosság