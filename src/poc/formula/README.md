# Formula engine proof of concept

Ez a konyvtar a production XLSX modultol izolalt, Node.js-bol futtathato
HyperFormula proof of conceptet tartalmazza. A production `XlsxTableService` es a
`WorkOrderTableView` tovabbra is kizarolag az XLSX-ben mentett/cache-elt ertekeket
hasznalja.

## Licenc

- Vizsgalt es rogzitett verzio: `hyperformula@3.3.0`.
- npm licencazonosito: `GPL-3.0-only`.
- A gyarto a HyperFormulat GPLv3 vagy megvasarolhato proprietary licenc alatt
  teszi elerhetove.
- A PoC a kotelezo `licenseKey: "gpl-v3"` beallitast hasznalja. Ez csak a PoC
  technikai validaciojara vonatkozik, es nem jelent production licencjovahagyast.
- Production integracio elott uzleti/jogi dontes szukseges arrol, hogy a teljes
  alkalmazas GPLv3 feltetelei elfogadhatok-e, vagy proprietary licencet kell
  beszerezni.

Forrasok:

- https://www.npmjs.com/package/hyperformula
- https://hyperformula.handsontable.com/docs/guide/licensing.html
- https://hyperformula.handsontable.com/docs/guide/license-key.html

## Futtatas

```powershell
npm.cmd run poc:formulas
npm.cmd run poc:formula-compatibility
```

A script a kis, mesterseges fixture minden kepletes cellajat osszehasonlitja,
majd egy tobb ezer soros, ket munkalapos szintetikus workbookon teljesitmenyt
mer. Egy workbookot egyszer parse-ol, es workbookonkent egy HyperFormula engine-t
epit. Az eredmenyeket ezutan egyszer olvassa ki; nincs UI-, lapozasi-, rendezesi
vagy szuresi kapcsolata.

A `poc:formula-compatibility` parancs harom mesterseges workbookot es, ha a
`datatable/` konyvtarban elerhetok, legfeljebb ket helyi XLSX-et vizsgal. A helyi
fajlokat csak olvassa, es a jelentésben `local-01/02` azonosito, anonimizalt
munkalapnev es cellacim jelenik meg. Fajlnev, utvonal, kepletszoveg, cache-elt
ertek es uzleti cellatartalom nem kerul a reportba.

A konzolkimenet workbookonkenti formula inventoryt, statuszokat es
teljesitmenymerest ad. A gepileg olvashato, ignored JSON helye:
`src/poc/formula/output/formula-validation-report.json`. A commitolhato, kezzel
ellenorzott osszefoglalas: `src/poc/formula/COMPATIBILITY_REPORT.md`.

Statuszok:

- `MATCH`: cache es engine eredmeny egyezik;
- `MISMATCH`: mindket ertek elerheto, de elter;
- `ENGINE_ERROR`: a motor hibaval fejezte be a cellat;
- `NO_CACHED_VALUE`: a motor szamolt, de nincs osszehasonlithato cache;
- `UNSUPPORTED`: a motor nem ismeri a fuggvenyt;
- `IGNORED`: peldaul nem betoltott kulso workbook-hivatkozas.

A numerikus tolerancia `1e-9 * max(1, |cached|, |calculated|)`. A JSON minden
workbookra kiszamolja az engine-first, cache-first es explicit-hybrid szabaly
forrasmegoszlasat, de egyik strategiat sem vezeti be a production alkalmazasba.

## Kompatibilitasi megjegyzes

Az XLSX OOXML belso formulai szabvanyos, angol fuggvenyneveket hasznalnak akkor
is, ha a fajlt magyar Excel mentette. A PoC ezt a SheetJS altal kiolvasott `cell.f`
ertekekkel ellenorzi. Lokalizalt kepletnev kozvetlen atadasa kulon HyperFormula
nyelvi konfiguraciot igenyelne, es nem resze ennek a productiontol izolalt PoC-nak.

Nem tamogatott vagy hibas kepletnel a motor cellaszintu hibat ad vissza, a tobbi
cella feldolgozasa folytatodik. Egy kesobbi production integracio hasznalhatna a
mentett cache-erteket explicit, jelzett fallbackkent, de csendes ertekcsere nem
elfogadhato; a fallback szabaly meg nyitott dontes.

A kompatibilitasi proban a `VLOOKUP(...,FALSE)` csupasz logikai literalt a motor
nem ismerte fel, mikozben az Excel-kompatibilis `VLOOKUP(...,0)` exact-match alak
helyesen szamolodott. Production elott valos workbookokkal tamogatott
fuggveny- es szintaxislistat kell rogzitni; automatikus formula-atiras csak kulon
jovahagyassal vezetheto be.
