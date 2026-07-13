# Changelog

## v0.3.0 – Spreadsheet Formula Layer

- Megjelent a session-only Spreadsheet Formula Layer: a formula barban megadott
  cellaértékek és képletek külön memória-overlayben élnek, az eredeti XLSX fájl
  minden esetben read-only és változatlan marad.
- Támogatott overlay-függvények: `SUM`/`SZUM`, `MIN`, `MAX`,
  `ROUND`/`KEREKÍTÉS`, `COUNT`/`DARAB`, `FKERES`/`VLOOKUP` és `HA`/`IF`,
  valamint az alapműveletek, cellahivatkozások és véges tartományok.
- A dependency graph az érintett overlay-képleteket automatikusan újraszámolja;
  az Excel-szerű oszlopbetűk és eredeti sorszámok rendezés, szűrés, lapozás és
  munkalapváltás közben is stabil cellacímet adnak.
- A **Módosítások törlése** művelet megerősítés után a teljes workbook minden
  worksheetjének aktuális érték- és képlet-overlayét, hibáit és dependency
  kapcsolatait törli, majd visszaállítja az eredeti cache-elt cellaértékeket.
- Az eredeti XLSX-képletek nem számolódnak újra: a workbook mentett/cache-elt
  eredménye jelenik meg. Nincs XLSX-visszaírás, overlay persistence, automatikus
  overlay-mentés vagy alkalmazásindításkori overlay-visszatöltés.

## Session-only workbook overlay reset

- A Spreadsheet Formula Layer overlaye továbbra is kizárólag az aktuális
  alkalmazás-munkamenetben él; nincs automatikus mentés, visszatöltés, overlay
  fájl, Tauri app-data tárolás vagy hash-alapú azonosítás.
- A Munkalapok táblázat eszköztár új **Módosítások törlése** gombja csak akkor
  aktív, ha a workbook legalább egy worksheetjén van érték- vagy képlet-overlay.
- Rövid megerősítés után a művelet a teljes workbook minden worksheetjének
  override-ját, fordított dependency-kapcsolatát és overlay-hibáját üríti.
- A kijelölt cella formula barja és a DataGrid minden cellája az eredeti XLSX
  inputjára, illetve mentett/cache-elt megjelenítési értékére áll vissza; a
  keresés, szűrés, rendezés, lapozás és virtualizáció változatlanul működik.
- Megszakított megerősítés nem módosítja az overlayt. A törlés kizárólag memóriát
  érint, az eredeti XLSX fájlhoz semmilyen írás nem történik.
- Automatikus teszt fedi az üres/aktív gombállapot alapját, a megszakított és
  jóváhagyott teljes törlést, több worksheetet, érték-, SUM-, FKERES- és HA-
  overlayt, dependency-ürítést, formula bar visszaállítást és a 100 002 cellás
  cache-regressziót.
- Nem készült verzióemelés, tag vagy release.

## Excel-style row and column headers and overlay lookup formulas

- A Munkalapok tablazat bal oldali, fix es read-only sorazonositoja az eredeti
  worksheet Excel-sorszamat mutatja; rendezes, szures es lapozas nem irja at.
- Az uzleti fejlecek felett megjelennek az eredeti Excel-oszlopkodok (`A`–`Z`,
  `AA`, `AB`, ...), az egyes worksheetek sajat hasznalt tartomanyahoz igazodva.
- A formula bar, a cellakijeloles es a session-only formula-overlay ugyanazt a
  parse soran megorzott A1-koordinatat hasznalja rendezett es szurt allapotban is.
- Az alkalmazason belul beirt overlay-kepletek tamogatjak az `FKERES`/`VLOOKUP`
  pontos es kozelito kereseset, valamint a `HA`/`IF` felteteles agakat. Magyar es
  angol fuggvenynev, illetve kovetkezetes pontosvesszos vagy vesszos elvalasztas
  hasznalhato.
- A lookup az azonos munkalapos veges tartomany elso oszlopaban keres, 1-alapu
  eredmenyoszlopot hasznal, kezeli az abszolut referenciat, es ertheto hibaval
  jelzi a hianyzo talalatot, forditott tartomanyt vagy hibas oszlopindexet.
- A `HA`/`IF` tamogatja az `=`, `<>`, `<`, `<=`, `>` es `>=` osszehasonlitast,
  illetve szam-, szoveg-, cellahivatkozas- vagy tamogatott kepletagat.
- Overlay-ertek valtozasakor minden erintett lookup es felteteles overlay-keplet
  automatikusan ujraszamolodik, es az eredmeny azonnal megjelenik.
- A tobb munkalapos, egyszeri parse, virtualizalt DataGrid, cache-alapu meglevo
  formulaertekek es read-only XLSX fajlkezeles valtozatlan maradt.
- Automatikus teszt fedi az oszlopkodokat, az eredeti sorszam stabilitasat,
  a lookup/IF aliasokat es hibakat, a dependency-frissitest, a tobb worksheetet,
  az overlay cimzest es a 100 002 cellas cache-regressziot.
- A tamogatas csak session-only overlay-kepletekre vonatkozik. Az eredeti XLSX
  kepletei tovabbra is a mentett cache-bol jelennek meg; nincs XLSX-visszairas
  vagy automatikus visszamentes.
- Nem keszult verzioemeles, tag vagy release.

## Spreadsheet Formula Layer MVP

- Session-only, memoriaalapu cella-overlay kerult a read-only XLSX nezet fole;
  az eredeti workbook fajlhoz nincs iras, mentes vagy export.
- A kompakt formula bar kijelzi az aktiv Excel-cellacimet, az eredeti erteket
  vagy formulat, illetve az alkalmazason belul megadott overlay-inputot.
- Enter jovahagyja, Escape megszakitja a szerkesztest; az **Eredeti ertek** gomb
  torli az adott override-ot es ujraszamolja annak fuggosegeit.
- Tamogatott overlay-kepletek: `SUM`, `MIN`, `MAX`, `ROUND`, `COUNT`, `+ - * /`,
  zarojelek, azonos munkalapos relativ/abszolut cellak es veges tartomanyok.
- Az explicit tokenizer/parser nem hasznal `eval` vagy `Function` konstruktort;
  ciklus-, melyseg- es referenciakorlattal izolalja a hibas kepleteket.
- A dependency graph csak a modositott overlay-cella erintett fuggosegeit
  szamolja ujra. A DataGrid tovabbra is virtualizalt, a kereses, szures es
  rendezes pedig a megjelenitett overlay/cache ertekeken dolgozik.
- A workbookban mar letezo formulak nem szamolodnak ujra: tovabbra is a mentett
  XLSX cache-ertek jelenik meg, 100 000+ cellas workbooknal is.
- Az overlay munkalaponkent elkulonul, csak az aktualis alkalmazas-munkamenetben
  el, es uj workbook betoltesekor megszunik. Production release nem keszult.

## Formula compatibility and fallback validation

- Az izolalt HyperFormula PoC workbookonkenti formula inventoryval, hat
  cellastatusszal, `1e-9` numerikus toleranciaval, Excel-hibakod kezelesevel es
  ignored JSON riporttal bovult.
- Harom mesterseges es ket read-only, anonimizalt helyi workbook vizsgalata 3,292
  kepletet fedett le. A riport nem tartalmaz helyi fajlnevet, utvonalat,
  kepletszoveget, cache-elt/szamitott uzleti erteket vagy cellatartalmat.
- A 14 inventory kategoria lefedi a SUM, VLOOKUP, IF, COUNT/COUNTA,
  SUMIF/COUNTIF, ROUND, MIN/MAX, DATE, szoveg-osszegfuzesi es referencia eseteket,
  valamint a hibas, ismeretlen es kulso workbook kepleteket.
- Osszesitett eredmeny: 24 MATCH, 2 MISMATCH, 3,263 ENGINE_ERROR,
  1 NO_CACHED_VALUE, 1 UNSUPPORTED es 1 IGNORED. Az engine 25 kepletnel adott
  nem hibas eredmenyt; az alacsony aranyt egy 3,260 `EXACT_FALSE` VLOOKUP-os
  anonimizalt workbook logikai literal kompatibilitasi hibaja okozta.
- VLOOKUP: a `0`, `1`, kihagyott negyedik argumentum, masik munkalapos abszolut
  tartomany es nem talalhato ertek validalt; a valtozatlan `FALSE` es `TRUE`
  alak `NAME` engine-hibat adott. Automatikus formula-atiras nem tortent.
- Engine-first, cache-first es explicit-hybrid dontesi szimulacio keszult. A
  jelenlegi production cache-first mukodes megtartasa ajanlott; jovobeli
  integraciohoz csak explicit hybrid, whitelist, forrasjeloles es lathato
  mismatch-figyelmeztetes javasolt.
- A legnagyobb, 516.9 KiB-os, 170,687 hasznalt cellas es 3,262 kepletes minta
  teljes ideje kb. 3.08 s, HyperFormula build ideje 2.82 s, kozelito RSS novekedese
  109.3 MiB volt. Javasolt kezdeti warning es cache-only limitek dokumentalva.
- HyperFormula 3.3.0, `GPL-3.0-only`; production licenc nincs jovahagyva. A
  production XLSX, DataGrid, PDF es SQLite mukodes valtozatlan.

## Formula engine proof of concept

- Production kodtol izolalt, kulon `npm.cmd run poc:formulas` paranccsal futtathato
  HyperFormula 3.3.0 PoC keszult egy kis mesterseges XLSX fixture-rel es egy
  memoriaban elo nagyobb szintetikus workbookkal.
- A SheetJS workbookonkent egyszer parse-ol, megorzi az eredeti munkalapsorrendet,
  a HyperFormula engine pedig workbookonkent egyszer epul fel; az eredmenyek
  egyszer kerulnek stabil, read-only osszehasonlito jelentésbe.
- Validalt kepletek es adatok: `SUM`, `VLOOKUP`, `IF`, `COUNT`, `SUMIF`, azonos es
  masik munkalapos hivatkozas, relativ es abszolut referencia, szoveg, szam es ures
  cella.
- A kis fixture 11 kepletes cellajabol 9 tamogatott eredmeny egyezett, 1
  szandekosan elavult cache erteke eltert (`31` helyett `30`), 1 ismeretlen
  fuggveny pedig izolalt `#NAME?` hibakent jelent meg a futas leallitasa nelkul.
- A 5000 soros, ket munkalapos, 5000 kepletes, kb. 360.5 KiB-os szintetikus
  workbook merese: SheetJS parse 103.4 ms, engine build 93.5 ms, egyszeri
  eredmenykiolvasas 12.0 ms, teljes futas 219.3 ms. Ezek tajekoztato, egyetlen
  helyi futasbol szarmazo ertekek, nem production teljesitmenygaranciak.
- A belso XLSX formulak a fixture visszaolvasasakor angol fuggvenynevekkel jelentek
  meg. A `VLOOKUP(...,FALSE)` csupasz literalt a motor nem fogadta el, a
  `VLOOKUP(...,0)` exact-match alak helyesen szamolodott; valos workbookokra
  kompatibilitasi lista szukseges.
- HyperFormula licence `GPL-3.0-only`, GPLv3 vagy proprietary felhasznalasi
  lehetoseggel. A PoC dependency nem jelent production licencjovahagyast;
  production integracio elott uzleti/jogi dontes szukseges.
- A production `XlsxTableService`, `WorkOrderTableView`, DataGrid, PDF-indexeles es
  SQLite mukodes nem valtozott; a production XLSX modul tovabbra is a mentett
  cache-ertekeket hasznalja.

## v0.2.0 – Last XLSX workbook restore

- Az alkalmazas csak sikeres fajlolvasas es workbook-parse utan jegyzi meg a Tallozassal megnyitott XLSX teljes utvonalat.
- Az XLSX nezet a kovetkezo inditaskor ugyanazon kozos betoltesi utvonalon automatikusan visszatolti az utoljara megnyitott munkafuzetet.
- Hianyzo, olvashatatlan vagy hibas mentett fajlnal az alkalmazas ures XLSX allapotban marad, a hibas utvonalat torli, es a Tallozas tovabbra is hasznalhato.
- A read-only, tobb munkalapos, egyszer parse-olt es virtualizalt DataGrid mukodes, valamint a cache-elt formula- es FKERES/VLOOKUP-eredmenyek megjelenitese valtozatlan.
- StartAgro Service Documents v0.2.0 release.
- Installer: `install/StartAgro-ServiceDocs-Setup.exe` (4 974 082 byte)
- Installer SHA256: `CD78693DA7B042B2D8813E771A565805F271AF9FC43619A52AC3E77C9AF3E033`

## Fejlesztesi atadas es XLSX modul osszegzes

- Ketmodulos alkalmazasnavigacio: **Munkalap kereső** es **Munkalapok táblázat**
- A korabbi „Munkalap gyorskereso” modul **Munkalap kereső** nevet kapott
- Read-only XLSX tabla modul globalis es oszlopszurokkel, rendezessel, lapozassal es virtualizalt MUI DataGriddel
- Magyar MUI DataGrid lokalizacio es magyar lapozasi tartomany
- Reszponziv, szeles tablakat belso vizszintes gorgetessel kezelo elrendezes
- XLSX betoltes kizarolag a **Tallózás** gombbal, automatikus alapertelmezett fajl nelkul
- A workbook minden worksheetje egyetlen parse soran, eredeti sorrendben memoriaba kerul
- Azonos es mas worksheetre hivatkozo formulak mentett/cache-elt eredmenye ujraszamitas nelkul jelenik meg
- FKERES/VLOOKUP eredmenyek stabilak maradnak lapozas, szures es rendezes kozben; a korabbi lapozas utani `#N/A` regresszio javitva

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

## v0.28

Sprint 22: Batch and resumable indexing for large folders

IndexService 100 munkalapos batch merettel dolgozik, batchenkent visszaadja a vezerlest az UI-nak

PDF feldolgozasi hibak fajlonkent kezelve, egy hibas PDF nem allitja meg a teljes indexelest

Indexeles kozbeni progress lathato: processed / total candidates, parsed, skipped, errors

Kepparositas linearis map-alapu keresessel gyorsitva nagy mappakhoz

---

## v0.29

Sprint 23: Large indexing freeze diagnostics and stabilization

Index batch meret 25 munkalapra csokkentve, minden feldolgozott munkalap utan UI yield

Indexelesi progress frissites 250ms-ra throttlingolva, batch hatarokon azonnali frissitessel

Reszletes indexelesi diagnosztika hozzaadva: scan start/end, batch start/end, aktualis PDF, lassu parse, memoria figyelmeztetes, utolso mentett munkalap

PDF olvasas egy pdf.js megnyitassal tortenik, oldal es text item adatok feldolgozas utan felszabaditva

Varatlan fatalis hiba eseten az indexeles osszesitovel ter vissza

---

## v0.29.1

Sprint 23: Large dataset validation documented

Nagy adathalmaz indexeles validalva: 13,025 fajl osszesen, ebbol 3,191 PDF es 9,811 JPG

Elso indexeles sikeresen lefutott: 3,191 PDF feldolgozva, 0 hiba

Masodik indexeles gyorsan lefutott, a mar indexelt valtozatlan fajlok helyesen kihagyva

UI nagy adathalmaz indexelese kozben is reszponziv maradt

---

## v0.30

Sprint 25: XLSX munkalap tabla modul

Fo navigacio hozzaadva ket modullal: Munkalap gyorskereso es Munkalapok tablazat

A meglevo gyorskereso AppShell valtozatlan funkcionalitassal kulon nezetbe kerult

Uj read-only XLSX tabla nezet keszult a datatable/test_tablazat.xlsx alapertelmezett fajllal

Az elso munkalap elso nem ures sora fejlecsorkent, az utana kovetkezo nem ures sorok rekordkent jelennek meg

Dinamikus oszlopkezeles, globalis kereses, oszlopszures, rendezés, sor darabszam, oszlop atmeretezes es oszlop mutatas/elrejtes hozzaadva

XLSX fajl tallozasa es helyi beolvasasa Tauri parancson keresztul

---

## v0.30.1

Sprint 25 hotfix: XLSX tabla elrendezes es navigacio

Az alkalmazas, a modulnezet es a DataGrid szelessege a lathato ablakhoz korlatozva, a tulcsordulas a tabla belso gorgetosavjan marad

A tabla es minden relevans szuloelem zsugorodhato grid/flex meretezest kapott, igy a jobb oldal, a teljes lablac es a Tallozas gomb elerheto

A felso eszkoztar szukebb ablakban tobb sorba torhet, a kereso es a cimke nem kenyszerit tulzott minimum szelesseget

A lapmeret valasztek 25, 50 es 100 sor, az alapertelmezett lapmeret 100 sor; minden importalt sor lapozassal elerheto

---

## UI Polish Sprint

A fo navigacio Munkalap gyorskereso eleme Munkalap keresore atnevezve

A Modulok oszlop 220 px-rol 270 px-re novelve, a Munkalapok oszlop 420 px-rol 370 px-re csokkentve, az Elonezet fennmarado szelessege valtozatlan

---

## Sprint 26

Az XLSX munkalap tabla MUI DataGrid felulete a hivatalos magyar lokalizaciot hasznalja

A hivatalos lokalizaciobol hianyzo lapozasi tartomany szovege minimalis magyar kiegeszitest kapott

---

## XLSX empty-state hotfix

Az XLSX tabla modul nem probal alapertelmezett fajlt automatikusan betolteni

Fajl nelkul a felulet a Tallozas gomb hasznalatara vonatkozo utmutatast jelenit meg, a valos olvasasi hibak kezelese valtozatlan

---

## XLSX multi-worksheet sprint

Az XLSX munkafuzet minden munkalapja egyetlen fajlolvasassal, eredeti sorrendben feldolgozasra es memoriaban tarolasra kerul

A tabla eszkoztar munkalapvalasztot es fajlnevet jelenit meg, az elso munkalap automatikusan aktiv

Munkalapvaltaskor a kereses, szurok, rendezes, oszloplathatosag es lapozasi pozicio alaphelyzetbe all

Az ures munkalapok kulon, nev szerinti ures allapotot jelenitenek meg

A formulacellak a munkafuzetben mentett gyorsitotarazott, formatalt eredmenyt jelenitik meg; hianyzo eredmenynel biztonsagosan ures ertek marad

A DataGrid sorcellak csak az egyszer feloldott megjelenitesi erteket es datumtipus metaadatot taroljak, a formula es nyers cellaertek nem kerul a renderelesi modellbe

---

## Jelenlegi allapot

Tallozas nem indit indexelest, az indexeles kompakt header visszajelzest ad, a WorkOrder mezok PDF sorrendben jelennek meg, a globalis kereso Szervizcsapat szerint is keres, az XLSX munkalap tabla read-only nezetben megnyithato, es az NSIS setup exe tiszta install mappaba masolhato.

Kovetkezo cel:

Portable storage implementation.
