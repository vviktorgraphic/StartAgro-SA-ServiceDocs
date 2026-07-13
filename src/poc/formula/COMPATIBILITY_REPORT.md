# Formula compatibility and fallback validation

## Scope

The validation ran on five read-only workbooks:

- three fully synthetic workbooks that model common business spreadsheet patterns;
- two local workbooks read without modification and reported only as `local-01`
  and `local-02`.

No local workbook, file name, path, formula text, cached value or business cell
content is committed or copied into this report. Workbook sizes ranged from
9.6 KiB to 516.9 KiB, used ranges from 26 to 170,687 cells, and formula counts
from 2 to 3,262 per workbook.

HyperFormula version: `3.3.0`. License: `GPL-3.0-only`. This validation does not
approve production use. A GPLv3 or proprietary license requires a separate
business/legal decision before any production integration.

## Comparison rules

Every formula cell is classified as `MATCH`, `MISMATCH`, `ENGINE_ERROR`,
`NO_CACHED_VALUE`, `UNSUPPORTED` or `IGNORED`. Numeric values use a relative and
absolute tolerance of `1e-9 * max(1, |cached|, |calculated|)`. Text, booleans,
empty values and Excel error codes use normalized exact comparison. Date formulas
are compared as Excel serial values. External-workbook references are `IGNORED`
because the referenced workbook is not loaded into the isolated engine.

The synthetic missing-cache cell is written with an empty placeholder because
SheetJS omits a formula cell that has no `v` member. The validator marks that
known fixture cell as cache-missing after the single SheetJS parse.

## Formula inventory and compatibility

The five workbooks contained 3,292 formula cells and 14 inventory categories:
`COUNT`, `COUNTA`, `COUNTIF`, `DATE`, `IF`, `MAX`, `MIN`, `NA`, `ROUND`, `SUM`,
`SUMIF`, `VLOOKUP`, one deliberately unknown function, and formulas containing
operators/references without a function call.

| Status | Count | Share |
| --- | ---: | ---: |
| MATCH | 24 | 0.73% |
| MISMATCH | 2 | 0.06% |
| ENGINE_ERROR | 3,263 | 99.12% |
| NO_CACHED_VALUE | 1 | 0.03% |
| UNSUPPORTED | 1 | 0.03% |
| IGNORED | 1 | 0.03% |

Only 25 formulas (0.76%) produced a non-error engine result across the whole
sample. This low rate is driven by 3,260 formulas in one anonymized local workbook
that use a VLOOKUP boolean syntax HyperFormula parsed as an unknown named
expression. It must not be hidden by the 92.31% match rate obtained when only
`MATCH` and `MISMATCH` cells are included in the denominator.

The 28 synthetic formulas produced 20 matches, 2 mismatches, 3 engine errors,
1 missing cache, 1 unsupported result and 1 ignored external reference. The
mismatches were a deliberately stale SUM cache and a COUNTA semantic difference
for an empty-string cell. Full-column and large-range SUM references calculated
successfully. The deliberately malformed formula returned an engine error, and
the unknown function returned `UNSUPPORTED`, without stopping other workbooks.

## VLOOKUP matrix

The synthetic VLOOKUP workbook preserved every original formula without rewrite.

| Syntax/case | Result |
| --- | --- |
| fourth argument `0` | MATCH, exact lookup |
| fourth argument `FALSE` | ENGINE_ERROR (`NAME`) |
| fourth argument `1` | MATCH, approximate lookup |
| fourth argument `TRUE` | ENGINE_ERROR (`NAME`) |
| fourth argument omitted | MATCH, approximate lookup |
| other-sheet absolute table range | MATCH |
| value not found | cached and calculated `#N/A` matched |

The anonymized local sample reinforced the boolean-literal issue: all 3,260
VLOOKUP formulas were categorized as `EXACT_FALSE` and returned the same `NAME`
engine-error category. No `FALSE` to `0` or `TRUE` to `1` rewrite was performed.
A production integration therefore needs an
approved syntax policy and a real-workbook compatibility threshold, not an
implicit formula transformation.

## Fallback strategy comparison

| Strategy | Engine source | Cache source | Cache + warning | Main trade-off |
| --- | ---: | ---: | ---: | --- |
| A. Engine-first | 25 | 3,267 | 0 | Can correct stale cache, but exposes engine semantic/syntax differences and still falls back for almost the entire local formula set. |
| B. Cache-first | 1 | 3,291 | 0 | Preserves current user-visible values and is easiest to explain, but normally cannot detect or correct stale cache. |
| C. Explicit hybrid | 23 | 3,267 | 2 | Uses validated engine results, keeps cache for failures, and makes mismatches visible; requires whitelist, provenance and UI status design. |

For the current production application, keep strategy B: the existing cache-only
behavior. If formula recalculation is later approved, strategy C is the recommended
target. It must record `engine`, `cache`, or `cache-with-warning` for every cell.
On mismatch, the conservative PoC decision is to retain cache and emit a warning;
the product decision may change this only with explicit business approval.

Strategy A is not recommended. It has the highest risk of silently changing
visible values and provides little practical benefit on the incompatible local
VLOOKUP sample. Strategy C offers the best future accuracy and transparency but
has the highest implementation and UI complexity.

## Performance

Times and RSS deltas are approximate values from one local run on 2026-07-13,
not production guarantees.

| Workbook | KiB | Sheets | Used cells | Formulas | Parse ms | Engine ms | Read ms | Total ms | RSS delta MiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| synthetic-core | 10.1 | 2 | 48 | 13 | 11.6 | 55.9 | 0.8 | 69.1 | 7.8 |
| synthetic-vlookup | 9.6 | 2 | 26 | 7 | 2.3 | 13.6 | 0.3 | 16.4 | 0.0 |
| synthetic-fallback | 34.9 | 2 | 2,020 | 8 | 8.6 | 48.5 | 1.2 | 58.5 | 22.3 |
| local-01 | 320.5 | 1 | 99,789 | 2 | 182.6 | 124.3 | 17.5 | 324.4 | 53.3 |
| local-02 | 516.9 | 3 | 170,687 | 3,262 | 213.1 | 2,823.9 | 35.6 | 3,075.8 | 109.3 |

Suggested initial production guardrails, for a future implementation only:

- warning at 100,000 used cells, 1,000 formulas, 1 second total calculation time,
  or approximately 100 MiB RSS growth;
- cache-only preflight above 200,000 used cells or 5,000 formulas;
- cache-only fallback if engine build exceeds 3 seconds or total processing
  exceeds 5 seconds;
- do not start engine evaluation if the preflight function/syntax inventory is
  outside the approved whitelist.

These limits are recommendations and are not enforced in production code. A
future worker/cancellation design is required because synchronous engine build
cannot be safely interrupted by the current PoC.

## Decision

Production integration is **NO-GO** from this sprint. The engine is fast enough
for small synthetic workbooks, but the real-workbook VLOOKUP syntax compatibility
rate is unacceptable and licensing is unresolved. The next decision gate requires:

- business/legal approval for GPLv3 or an actually purchased proprietary license;
- an approved function and syntax whitelist;
- explicit-hybrid source provenance and UI warning design;
- accepted performance limits and cache-only fallback behavior;
- a representative real-workbook suite meeting an agreed compatibility threshold.
