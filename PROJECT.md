# StartAgro Service Documents

Windows Tauri desktop alkalmazás a Start Agro szervizdokumentumainak helyi feldolgozására. A részletes fejlesztési kontextus, architektúra és átadási prompt: [DEVELOPMENT_HANDOFF.md](DEVELOPMENT_HANDOFF.md).

## Modulok

- **Munkalap kereső:** PDF és JPG fájlok párosítása, incremental indexelés, WorkOrder és ServiceVisit parse, SQLite tárolás, keresés, szűrés, adat-előnézet és fotó-lightbox.
- **Munkalapok táblázat:** Tallózással megnyitott XLSX munkafüzetek read-only, több munkalapos MUI DataGrid nézete, session-only cella- és formula-overlay-jel. Az eredeti fájl változatlan marad; a meglévő XLSX formulák mentett/cache-elt eredménye jelenik meg, miközben az alkalmazáson belüli overlay-képletek külön, memóriában számolódnak. Az utoljára sikeresen megnyitott fájl a következő indításkor automatikusan visszatöltődik.

## Fejlesztés és futtatás

Előfeltétel: Node.js/npm, Rust/Cargo, Tauri Windows build eszközök.

```powershell
npm.cmd install
npm.cmd run tauri dev
```

Csak a frontend fejlesztői szerveréhez:

```powershell
npm.cmd run dev
```

Production frontend ellenőrzés:

```powershell
npm.cmd run build
```

A `package.json` jelenleg nem tartalmaz automatizált `test` scriptet; az ellenőrzés builddel és célzott manuális teszttel történik.

## Windows release

```powershell
npm.cmd run tauri build
npm.cmd run release:copy
```

Egyben:

```powershell
npm.cmd run release:build
```

Artifactok:

- natív executable: `src-tauri/target/release/startagro-servicedocs.exe`
- NSIS bundle: `src-tauri/target/release/bundle/nsis/StartAgro ServiceDocs_0.2.0_x64-setup.exe`
- kiadásra másolt installer: `install/StartAgro-ServiceDocs-Setup.exe`

Az `install/`, `dist/` és `src-tauri/target/` generált, ignored könyvtár.

## Könyvtárak

- `src/`: React/TypeScript UI, service-ek, modellek és SQLite repositoryk
- `src/components/layout/`: alkalmazáselrendezés és navigáció
- `src/components/table/`: XLSX DataGrid modul
- `src/services/`: indexelés, PDF/XLSX parse és matching
- `src/database/`: SQLite inicializálás, migráció és repositoryk
- `src-tauri/`: Rust scanner, Tauri konfiguráció és Windows bundle
- `docs/`: történeti specifikációk; az aktuális root dokumentumok az irányadók
- `datatable/`, `testdata/`: helyi tesztadatot is tartalmazhatnak; commit előtt ellenőrizendők

## Validált adathalmaz

- 13 025 fájl: 3 191 PDF és 9 811 JPG
- első indexelés: 3 191 PDF feldolgozva, 0 hiba
- második indexelés: a változatlan PDF-ek gyorsan kimaradtak
- a UI reszponzív maradt
- következő teljesítménycél: 50 000 fájlos validáció

Aktuális verzió: `0.2.0`; tag: `v0.2.0`. A GitHub `main` ág az egyetlen igazságforrás.
