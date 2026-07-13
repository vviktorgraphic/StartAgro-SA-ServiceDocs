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
```

A script a kis, mesterseges fixture minden kepletes cellajat osszehasonlitja,
majd egy tobb ezer soros, ket munkalapos szintetikus workbookon teljesitmenyt
mer. Egy workbookot egyszer parse-ol, es workbookonkent egy HyperFormula engine-t
epit. Az eredmenyeket ezutan egyszer olvassa ki; nincs UI-, lapozasi-, rendezesi
vagy szuresi kapcsolata.

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
