# Architectural Decisions

---

## 2026-07

### Egységes WorkOrder modell

A DiscoveredWorkOrder megszűnt.

Az alkalmazás egyetlen WorkOrder modellt használ.

Indok:

- egyszerűbb
- nincs objektum másolás
- könnyebb SQLite kezelés

---

### PDF parser TypeScriptben

A PDF tartalmát TypeScript dolgozza fel.

Rust csak fájlműveleteket végez.

Indok:

- egyszerűbb fejlesztés
- gyorsabb hibakeresés
- könnyebb karbantartás

---

### Rust feladata

Rust kizárólag:

- scanner
- fájlkezelés
- PDF bájtok beolvasása

Üzleti logika nincs Rustban.

---

### Egyetlen keresőmező

A kereső egyszerre keres:

- partner
- adószám
- munkalapszám
- géptípus
- alvázszám

Nem lesz külön partner- vagy adószám mező.

---

### PDF csak adatforrás

A PDF nem az elsődleges adatforrás.

Indexelés után minden adat SQLite-ba kerül.

A napi használat során az alkalmazás az adatbázisból dolgozik.

---

### Kódolási alapelvek

- kis szolgáltatások
- egy felelősség egy osztály
- olvasható kód
- egyszerű architektúra
- minimális függőség
- működő checkpointok
- Git commit minden mérföldkő után