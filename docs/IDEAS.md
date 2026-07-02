# IDEAS

Azok az ötletek és jövőbeli fejlesztések, amelyek a projekt során felmerültek.

Fontos:

- Ez **nem** roadmap.
- Ez **nem** backlog.
- Ezek olyan ötletek, amelyek később hasznosak lehetnek.
- Az 1.0 fejlesztését nem befolyásolják.

---

# HIGH

## Partner előzmények

Adószám alapján jelenjen meg az adott partner összes korábbi munkalapja.

Példa:

Agro-Reform Kft

- HT-0009952
- HT-0009843
- HT-0009621

Miért hasznos?

A szervizes azonnal látja a teljes javítási előzményt.

---

## Géptörténet

Alvázszám alapján jelenjen meg minden korábbi javítás.

Példa:

Serial:

S124023

↓

összes korábbi munkalap

---

## Gyors partnernézet

Partner kiválasztása után:

- összes munkalap
- utolsó javítás
- gépek száma

---

# MEDIUM

## Hiányzó fotók ellenőrzése

A PDF-ben felsorolt képek összevetése a tényleges mappával.

Jelezze:

- hiányzó kép
- extra kép

---

## Indexelési statisztika

Indexelés után:

PDF:

2458

Képek:

18763

Munkalap:

2458

Átlag:

7,6 kép / munkalap

---

## Export

Export:

- Excel
- PDF
- CSV

---

## Kedvencek

Gyakran használt partnerek.

---

## Legutóbbi keresések

Utolsó keresések eltárolása.

---

# LOW

## OCR

Szkennelt PDF támogatás.

Jelenleg nem szükséges.

---

## AI összefoglaló

A javítás rövid automatikus összefoglalása.

---

## Géphibák statisztikája

Leggyakoribb hibák.

---

## Dashboard

Indulóképernyő:

- új munkalapok
- legtöbb javítás
- legtöbb partner

---

## Dark Mode

Sötét téma.

---

# UI ötletek

## Partner ikon

👤

Partner neve mellett.

---

## Gép ikon

🚜

Géptípus mellett.

---

## Fotók

📷

Képek száma.

---

## PDF

📄

PDF megnyitás.

---

# Kereső ötletek

Egyetlen keresőmező.

Keressen:

- partner
- adószám
- munkalapszám
- géptípus
- alvázszám
- kapcsolattartó

---

# Teljesítmény

Indexelés után minden adat SQLite-ba kerül.

A napi használat során:

NE

olvassunk újra PDF-et.

Mindig az adatbázisból dolgozzunk.

---

# Fejlesztési alapelvek

Mindig:

- egyszerű megoldás
- olvasható kód
- kis szolgáltatások
- egy felelősség egy osztály
- működő checkpointok
- Git commit minden mérföldkő után

---

# Nem cél

- általános dokumentumkezelő
- OCR rendszer
- DMS
- ERP

A program kizárólag a Start Agro szervizmunkalapjaira készül.

Ez tudatos döntés.

---

# Megjegyzések

Új ötlet esetén:

NE szakítsuk meg az aktuális fejlesztést.

Az ötlet kerüljön ide.

A ROADMAP csak akkor módosuljon, ha valóban eldöntöttük, hogy a funkció bekerül a projektbe.