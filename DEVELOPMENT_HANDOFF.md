# StartAgro Service Documents – fejlesztési átadás

## Projekt célja

A StartAgro Service Documents egy offline működésű Windows asztali alkalmazás a Start Agro Kft. mezőgazdasági szervizmunkalapjainak helyi feldolgozására, indexelésére és keresésére. Tauri 2 alapú desktop alkalmazás, React/TypeScript felülettel, Rust fájlkezeléssel és SQLite-adattárolással.

Az alkalmazás két fő modulja:

1. **Munkalap kereső** – PDF munkalapok és JPG képek indexelése, adatbázisba mentése, keresése, szűrése és megjelenítése.
2. **Munkalapok táblázat** – helyi XLSX munkafüzetek read-only, több munkalapos, virtualizált táblázatos megjelenítése.

Mindkét modul meglévő működését változatlanul kell megőrizni, kivéve, ha egy feladat kifejezetten az adott viselkedés módosítását kéri.

## Repository

- Repository neve: `StartAgro-SA-ServiceDocs`
- GitHub: https://github.com/vviktorgraphic/StartAgro-SA-ServiceDocs
- Alapértelmezett ág: `main`
- Alkalmazásverzió: `0.1.0` (`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`)
- Meglévő Git tag: `v0.1.0`
- Dokumentált belső release: `0.1.0 Internal Release`

A GitHub `main` ág az egyetlen igazságforrás. A lokális munkakönyvtár tartalmazhat nem commitolt tesztadatokat, ezért munka előtt mindig ellenőrizni kell a státuszt és meg kell őrizni a felhasználó idegen módosításait.

## Development workflow

Az elfogadott fejlesztési folyamat:

1. A felhasználó meghatározza a feladatot.
2. ChatGPT elkészíti a pontos implementációs utasítást.
3. Codex elolvassa az `AGENTS.md`, `PROJECT.md`, `ROADMAP.md` fájlokat és az érintett forrásokat.
4. Codex a legkisebb szükséges módosítást végzi el.
5. Build futtatása.
6. Arányos manuális teszt valós adatokkal.
7. `CHANGELOG.md` frissítése.
8. `ROADMAP.md` frissítése.
9. Egy logikai egységet tartalmazó commit.
10. Push az `origin/main` ágra.

Alapszabályok:

- Mindig minimális, célzott módosítás készüljön.
- Nincs feladathoz nem szükséges refaktor vagy működő kód újratervezése.
- Ne küldjünk chatben alkalmazandó patch-et, ha Codex közvetlenül szerkesztheti a workspace fájljait.
- A meglévő funkcionalitás maradjon stabil.
- Minden sprint végén buildelhető állapotot kell hagyni.
- GitHub a forráskód és dokumentáció igazságforrása.
- Lokális tesztadat, titok, adatbázis vagy generált build artifact nem kerülhet véletlenül commitba.
- Piszkos worktree esetén csak a feladathoz tartozó fájlokat szabad explicit módon stage-elni.

## Technology stack

A `package.json`, a telepített dependency-k és a Rust konfiguráció alapján:

- Platform: Windows
- Tauri: 2 (`@tauri-apps/api` telepítve: `2.11.1`, CLI: `2.11.4`)
- Rust: 2021 edition, `tauri = "2"`
- React: package range `^19.1.0`, telepítve `19.2.7`
- TypeScript: `~5.8.3`, telepítve `5.8.3`
- Vite: range `^7.0.4`, telepítve `7.3.6`
- Material UI: range `^9.1.2`, telepítve `9.1.2`
- MUI X DataGrid: range `^9.7.0`, telepítve `9.7.0`
- SheetJS/xlsx: `^0.18.5`, telepítve `0.18.5`
- SQLite: `@tauri-apps/plugin-sql ^2.4.0`, Rust oldalon `tauri-plugin-sql = 2.4.0` az engedélyezett `sqlite` feature-rel
- PDF motor: `pdfjs-dist ^6.1.200`, telepítve `6.1.200`
- UI kiegészítők: Emotion, Roboto font, MUI Icons

A fejlesztéshez Node.js, npm, Rust, Cargo, Tauri CLI, C/C++/Windows build eszközök és NSIS szükséges. A telepített Windows alkalmazás futtatásához nincs szükség a fejlesztői környezetre.

## Main module: Munkalap kereső

### Jelenlegi működés

- A felhasználó a header **Tallózás** gombjával választ dokumentummappát.
- A Rust `scan_documents` parancs a kiválasztott mappa közvetlen fájljait olvassa (`std::fs::read_dir`); a scanner jelenleg nem rekurzív.
- A scanner felismeri a `.pdf`, `.jpg` és `.jpeg` fájlokat, és a PDF-ekhez módosítási időt, fájlméretet és teljes elérési utat ad vissza.
- A `NameParser` a fájlnév elején álló kétbetűs prefixet és számsort (`XX-123...`) munkalapszámmá alakítja.
- A `MatcherService` a közös munkalapszám alapján lineárisan felépített map segítségével párosítja a PDF-eket és JPG-ket.
- A PDF bájtjait Rust olvassa, a `pdfjs-dist` TypeScriptben egy megnyitással olvassa végig az oldalakat és text itemeket.
- A `PdfParser` az első oldal üzleti mezőit és a `ServiceVisitParser` a második oldal kiszállási sorait dolgozza fel.
- A feldolgozott domainadatok, kiszállások és import metaadatok SQLite-ba kerülnek.
- Az alkalmazás indulásakor a `StartupService` migrálja/megnyitja az adatbázist, majd a `LoadWorkOrdersService` SQLite-ból tölti vissza a munkalapokat.

### Incremental indexing és mappatükör

Az SQLite a kiválasztott dokumentummappa tükre:

- Új PDF: parse és mentés.
- Módosult PDF: parse és felülírás, ha a módosítási idő vagy fájlméret megváltozott.
- Változatlan PDF: parse kihagyása; a képfájl-lista ettől még frissül.
- Törölt PDF: a hozzá tartozó `work_orders` és `work_order_imports` rekord törlése; a kiszállások idegen kulcsos cascade-del törlődnek.

Az útvonal-összehasonlítás normalizált (`\` → `/`) és kisbetűs. A jelenlegi batch méret `INDEX_BATCH_SIZE = 25`. Minden munkalap után UI yield történik; a progress legfeljebb 250 ms-os időközönként, batchhatáron azonnal frissül. Egy PDF hibája nem állítja le a teljes feldolgozást. A rendszer naplózza a batchhatárokat, az aktuális PDF-et, a 2 másodpercnél lassabb parse-okat, a memóriafigyelmeztetést és az utolsó mentett munkalapot.

A header megjeleníti a feldolgozott/összes jelölt számot, parse/skip/error számlálókat, folyamatjelzőt, végső összesítőt és felhasználóbarát hibát. Indexelés közben a mappaválasztó és indexelő gomb tiltott.

### Keresés, szűrés és megjelenítés

- A globális keresés 150 ms debounce után memóriában szűr.
- Kereshető többek között a munkalapszám, prefix, szervizcsapat neve, partner, adószám, kapcsolattartó, telefon, e-mail, gép, alvázszám, szállítólevél, szervizhelyszín, bejelentett hiba és elvégzett munka.
- Sidebar szűrők: szervizcsapat, munkalap, partner, technikus, géptípus, alvázszám, dátumtól és dátumig.
- A dátumszűrés a lezárási dátumot és a kiszállási dátumokat vizsgálja.
- A munkalaplista az aktív találatszámot, szükség esetén az összes elemszámot és munkalaponként a képek számát mutatja.
- Az előnézet a PDF-ből kiolvasott adatokat PDF-sorrendben, valamint a kiszállási táblát jeleníti meg. A „PDF előnézet” jelenleg adatnézet; teljes laprenderelés/zoom későbbi roadmap-feladat.
- A fotódokumentáció 96×96 pixeles thumbnail rácsot használ Tauri asset URL-lel.
- A lightbox kattintásra nyílik, bezárható, és támogatja az Escape, bal és jobb nyíl billentyűket.
- A header, keresősáv és fő panelek rögzített/grid elrendezésűek; a listák és előnézet saját területükön görgethetők.
- A státuszsor a szűrt dokumentumszámot és az utolsó látható munkalapszámot mutatja. Nem tárol vagy mutat perzisztens „utolsó indexelés” időpontot.

### Fontos architekturális szétválasztás

- `WorkOrder`: üzleti/domainadat, PDF/JPG útvonalak és kiszállások. Import-metaadat nem kerülhet bele.
- `WorkOrderImport`: `workOrderNumber`, `pdfFile`, `pdfLastModified`, `pdfFileSize`.
- `WorkOrderRepository`: kizárólag a `work_orders` domainrekordok SQLite persistence-e.
- `WorkOrderImportRepository`: kizárólag import-metaadat lookup, save/update és delete.
- `ServiceVisitRepository`: a `service_visits` SQLite műveletei.
- `IndexService`: scan, matching, incremental döntés, parse és repository-hívások koordinálása. Repositoryba üzleti logika nem kerülhet.

## WorkOrder fields

A jelenleg támogatott és az előnézetben PDF-sorrendben megjelenített mezők:

1. Partner
2. Adószám
3. Számlázási cím
4. Szerviz helyszíne
5. Kapcsolattartó
6. Telefon
7. E-mail
8. Szállítólevél száma
9. Gép
10. Alvázszám
11. Üzemóra
12. Egyéb megállapodások
13. Munka típusa
14. Bejelentett hiba
15. Elvégzett munka
16. Kiszállások
17. Rezsianyag összesen (Ft)
18. Megtett km összesen
19. Munkaidő összesen (óra)
20. Mosás
21. Munkalap lezárásának dátuma
22. Átadó
23. Átvevő

A rezsianyag-, kilométer- és munkaidő-összesítők közvetlenül a PDF megfelelő mezőiből érkeznek, ha jelen vannak. Az alkalmazás ezeket nem számolja újra a kiszállásokból.

## Service-team mapping

A közös mapping a `src/constants/serviceTeams.ts` fájlban található:

- AD – Admin
- SA – Start Agro Kft
- HT – Help-Trak Kft
- HA – Haty Szerviz Kft
- LA – Lengyel Attila
- TP – Turcsányi Péter
- MJ – Mester János
- PJ – Pászti János
- SP – Surányi Péter
- PB – Pigler Béla
- KT – Kis Tibor
- UP – Urbán Péter
- GT – Gellén Zoltán

A sidebar szervizcsapat-szűrő és a globális keresés is ezt a közös mappinget használja.

## Performance validation

Elvégzett valós teszt:

- 13 025 fájl összesen
- 3 191 PDF
- 9 811 JPG
- Az első indexelés sikeresen befejeződött.
- 3 191 PDF feldolgozva.
- 0 hiba.
- A második indexelés gyorsan befejeződött.
- A változatlan PDF-ek helyesen kimaradtak.
- A UI reszponzív maradt.

A következő későbbi teljesítménymérföldkő az 50 000 fájlos validáció.

## Main module: Munkalapok táblázat

### Betöltés és munkalapkezelés

- XLSX kizárólag a modul saját **Tallózás** gombjával választható.
- Nincs automatikus vagy fallback alapértelmezett XLSX útvonal.
- Betöltött fájl nélküli pontos üzenet: **„A Tallózás gombbal válassza ki a megnyitni kívánt táblázatot!”**
- A fájl bájtjait a Tauri `read_xlsx_bytes` parancs helyben olvassa; nincs hálózati vagy backend-feldolgozás.
- A munkafüzet egyetlen `XLSX.read` hívással parse-olódik.
- Minden worksheet az eredeti `workbook.SheetNames` sorrendben memóriába kerül.
- A toolbar mutatja a fájlnevet és a munkalapválasztót.
- Az első munkalap automatikusan aktív.
- Egyszerre csak az aktív munkalap DataGridje renderelődik.
- Munkalapváltás nem olvassa és nem parse-olja újra a fájlt.
- Egyetlen munkalap esetén a selector látható, de tiltott.
- Üres munkalap név szerinti figyelmeztetést kap.

Munkalapváltáskor alaphelyzetbe kerül a globális keresés, minden oszlopszűrő, rendezés, oszlopláthatóság, DataGrid belső oszlopállapot és a lapozás első oldala. A választott lapméret megmarad.

### Táblastruktúra és DataGrid

- Munkalaponként az első nem üres sor a fejléc.
- Az eredeti oszlopsorrend megmarad.
- A használt tartományon belüli üres cellák üres megjelenítési értékkel megmaradnak a nem üres rekordokban; teljesen üres adatsorok nem kerülnek be.
- Az üres fejléc neve `Oszlop N`; duplikált fejlécek biztonságosan sorszámozódnak (`Név`, `Név 2`, ...).
- A modul read-only; nincs cella- vagy formulamódosítás.
- A MUI X DataGrid hivatalos `huHU` lokalizációját használja. A hivatalos locale-ból hiányzó pagination range formatter kapott minimális magyar kiegészítést.
- Globális keresés és oszloponkénti szűrés működik.
- Szűrők: tartalmazza, pontos egyezés, ezzel kezdődik; számoknál nagyobb/kisebb és egyenlő változatok; dátumnál egyezik/előtte/utána; üres/nem üres.
- A látható értékek többszörös kiválasztása támogatott; a selector első 500 egyedi értéket listázza.
- Rendezés, oszlopméretezés és oszlop mutatás/elrejtés támogatott.
- A széles táblák vízszintesen a DataGriden belül görgethetők, az alkalmazásablak nem szélesedik túl.
- Függőleges görgetés, reszponzív/tördelhető toolbar és teljes DataGrid footer működik.
- Lapméretek: 25, 50, 100; alapérték 100; nincs „összes sor” opció.
- A footer mutatja a tartományt, összes sort és lapozógombokat; a külső toolbar a szűrt/összes sorszámot mutatja.
- A DataGrid row virtualization és pagination megmaradt; több ezer sor és 20–30+ oszlop használatára készült.
- A sorazonosító a forrás worksheet fejlécéhez viszonyított Excel-sorszámból készül, ezért egy munkalapon belül stabil és egyedi.
- Szűrés nélkül a DataGrid közvetlenül az egyszer parse-olt sorarrayt kapja; szűréskor új array készül, de ugyanazokra a sorobjektumokra hivatkozik.

## Excel formulas and worksheet references

- A worksheetek hivatkozhatnak saját vagy másik worksheet celláira.
- Az FKERES/VLOOKUP és más Excel-formulák nem számolódnak újra az alkalmazásban.
- A SheetJS opciók megőrzik a formula-, number-format- és cached-text adatokat (`cellFormula`, `cellNF`, `cellText`, `cellDates`).
- A megjelenítési érték parse közben egyszer oldódik fel: először `cell.w`, majd a `cell.v` formázott értéke, végül biztonságos raw `cell.v` string fallback.
- A formula (`cell.f`) és a nyers cellaérték nem kerül a DataGrid sormodelljébe; ott csak a feloldott `displayValue` és dátumtípus-metaadat marad.
- Pagination, rendezés és szűrés csak a parse-olt sormodellen dolgozik; nem tölti újra a workbookot, nem parse-ol újra és nem értékel formulát.
- A korábbi „#N/A lapozás után” row identity/renderelési útvonal javítva és stabilizálva lett. Fontos: ha maga az XLSX mentett cache-e `#N/A`, az alkalmazás ezt a mentett értéket jeleníti meg.
- Nincs beépített teljes Excel formula engine, HyperFormula vagy frontend FKERES-implementáció.
- Ha a formula cache hiányzik, a cella biztonságosan üres marad.
- Ha a cache elavult, a munkafüzetet import előtt Excelben újra kell számolni és el kell menteni.

## SQLite and storage

### Jelenlegi állapot

- A `DatabaseService` a Tauri SQL pluginon keresztül a `sqlite:startagro.db` URI-t nyitja meg.
- A fizikai helyet jelenleg a plugin URI-feloldása kezeli; az alkalmazás nem kínál konfigurálható adatbázisútvonalat.
- Megnyitás után `PRAGMA foreign_keys = ON` fut.
- Táblák:
  - `work_orders`: domainadatok, PDF-útvonal és JSON-ként tárolt képfájl-lista.
  - `work_order_imports`: PDF útvonal, módosítási idő és fájlméret az incremental indexeléshez.
  - `service_visits`: kiszállások `work_orders` idegen kulccsal és `ON DELETE CASCADE` szabállyal.
- A migráció idempotens `CREATE TABLE/INDEX IF NOT EXISTS` sémát futtat, majd `PRAGMA table_info` alapján hiányzó `work_orders` oszlopokat `ALTER TABLE ... ADD COLUMN` művelettel pótol.
- Ez megőrzi a korábban létrehozott adatbázisok kompatibilitását az új mezőkkel.
- A jelenlegi tárolás még nem a végleges hordozható vagy szervermegosztásos stratégia.

### Elfogadott jövőbeli tárolási irány

- Konfigurálható adatbázishely.
- Preferált mappahelyi adatbázis: `<kiválasztott dokumentummappa>/.startagro/startagro.db`.
- Fallback az alkalmazás adatkönyvtárába, ha a dokumentummappa read-only vagy nem biztonságos/nem támogatott.
- A hálózati megosztás SQLite-zárolása, több kliens egyidejű használata és migrációja még tesztet és döntést igényel.

## Windows release

Parancsok a repository gyökeréből, Windows PowerShell/cmd környezetben:

```powershell
npm.cmd run build
npm.cmd run tauri build
npm.cmd run release:copy
```

Kombinált natív build és másolás:

```powershell
npm.cmd run release:build
```

Artifactok:

- Natív executable: `src-tauri/target/release/startagro-servicedocs.exe`
- Tauri NSIS bundle: `src-tauri/target/release/bundle/nsis/StartAgro ServiceDocs_0.1.0_x64-setup.exe`
- Másolt elsődleges installer: `install/StartAgro-ServiceDocs-Setup.exe`

Az `install/`, `dist/` és `src-tauri/target/` generált/ignored output. Az alkalmazás és installer végleges ikonforrása a repository gyökerében lévő `start_agro_docs_icon.png`; a generált Tauri ikonok a `src-tauri/icons/` mappában vannak.

Az NSIS hook verziózott `StartAgro-ServiceDocs-icon-v2.ico` fájlt telepít és explicit újragenerálja a desktop shortcutot. A Windows shell ikoncache miatt néhány tiszta telepítésen továbbra is előfordulhat régi shortcut ikon. Korábbi tapasztalat szerint a meglévő telepítésre történő újratelepítés frissítette az ikont. Ez jelenleg nem blokkoló probléma.

## Known warnings and issues

- A Vite production build 500 kB feletti JavaScript chunk figyelmeztetést ad; ez jelenleg nem blokkolja a buildet.
- Az `npm audit --omit=dev` egy közvetlen, high severity `xlsx@0.18.5` figyelmeztetést jelez (prototype pollution és ReDoS); az npm audit szerint nincs automatikus registry fix. Az XLSX fájlok felhasználói kiválasztással, helyben nyílnak meg, de a dependency-frissítési stratégia későbbi döntés.
- Szerver- és hálózati megosztás működése nincs validálva.
- A portable database implementáció jövőbeli munka.
- Az 50 000 fájlos teljesítményteszt jövőbeli munka.
- Windows desktop shortcut ikoncache probléma még előfordulhat.
- A `package.json` nem tartalmaz `test` scriptet; a projekt jelenleg valós fájlokkal, manuálisan és builddel validál.
- Excel-formula újraszámítás nincs; a mentett workbook cache használatos.
- A Rust scanner jelenleg csak a kiválasztott mappa közvetlen fájljait vizsgálja, almappákat nem.
- A régebbi `docs/` roadmap/specification fájlok történeti dokumentumok és több ponton elavultak; az aktuális root dokumentumok és a forráskód az irányadók.

## Local files and Git hygiene

- A `testdata/` tartalmazhat lokális vagy korábban trackelt tesztfájlokat; nagy valós adathalmazot célszerű a repositoryn kívül tartani.
- A `datatable/` XLSX fájljai lehetnek lokális/untracked minták, ha nem szándékos projektassetek.
- Az `install/`, `dist/`, `src-tauri/target/` és általában a `target/` generált output.
- A `*.db`, `*.db-shm`, `*.db-wal` SQLite fájlok ignoredak.
- API-kulcs, secret, `.local` fájl és `openai-api-key.txt` nem commitolható.
- A jelenlegi `.gitignore` ignorálja többek között a `node_modules`, `dist`, `install`, `release`, `target`, `testdata`, adatbázis- és lokális fájlokat. Már trackelt fájl törlése ettől még megjelenik a Git státuszban, ezért stage előtt mindig ellenőrizni kell.

Alap Git parancsok:

```powershell
git status --short
git pull origin main
git add -- <csak-a-szándékos-fájlok>
git commit -m "Rövid logikai commit üzenet"
git push origin main
```

Kerülni kell a `git add .` használatát piszkos worktree-ben.

## Current completion state

Stabil és működő állapotnak tekinthető:

- Tauri Windows desktop shell és NSIS build.
- SQLite induláskori inicializálás, migráció és visszatöltés.
- PDF/JPG scanner, matcher és incremental mappatükör-indexelés.
- Batchenként folytatható, fájlonként hibatűrő indexelés látható progresszel.
- WorkOrder és WorkOrderImport architekturális szétválasztása.
- Teljes jelenlegi PDF mezők és kiszállások parse/persistence/preview útvonala.
- Globális keresés, sidebar szűrők, csapatmapping és munkalapkiválasztás.
- Fotóthumbnail és billentyűzetes lightbox.
- Read-only XLSX Tallózás, magyar DataGrid, több worksheet, egyszeri workbook parse, munkalapválasztás és state reset.
- XLSX globális/oszlopszűrés, rendezés, oszlopkezelés, scroll, pagination és virtualization.
- XLSX mentett formulaeredmények egyszeri feloldása és stabil sorértékek lapozás közben.
- 13 025 fájlos valós indexelési validáció.

## Recommended next steps

A `ROADMAP.md` meglévő nyitott irányaihoz és reális validációs feladatokhoz igazodva:

1. Több valós workbookkal validálni a multi-worksheet XLSX működést, különösen az eltérő fejlécet, üres worksheetet és cache-elt formulákat.
2. Nagyobb és összetettebb XLSX fájlok teljesítménytesztje.
3. Szerver-/hálózatimegosztás-teszt, különösen SQLite locking és több kliens esetén.
4. A ROADMAP jelenlegi Sprint 026 feladata: portable storage implementáció és migrációs döntés.
5. Későbbi 50 000 fájlos indexelési validáció.
6. Opcionális GitHub release a jelenlegi post-`v0.1.0` fejlesztési állapothoz.
7. Később automatizált tesztek hozzáadása, ha a fenntartási érték indokolja.

Ezek nem jelentenek új, a `ROADMAP.md`-tól független sprintet.

## New-chat bootstrap prompt

```text
A StartAgro Service Documents projekten dolgozunk.

GitHub repository:
https://github.com/vviktorgraphic/StartAgro-SA-ServiceDocs

Először olvasd el:
- AGENTS.md
- DEVELOPMENT_HANDOFF.md
- PROJECT.md
- ROADMAP.md
- CHANGELOG.md

A GitHub main branch az egyetlen igazságforrás.

Fejlesztési szabályok:
- mindig a legkisebb szükséges módosítás
- nincs felesleges refaktor
- a meglévő funkciók változatlanok maradnak, ha a feladat nem kéri az ellenkezőjét
- minden sprint végén build, manuális teszt, CHANGELOG, ROADMAP, commit és push
- a PDF-indexelésnek nagy fájlmennyiségnél is stabilnak kell maradnia
- az XLSX modul read-only, virtualizált és több munkalapot kezel
- FKERES/VLOOKUP eredményeket a mentett XLSX cache alapján jelenítjük meg, nem számoljuk újra

A fejlesztést a ROADMAP.md következő nyitott feladatától folytassuk.
```
