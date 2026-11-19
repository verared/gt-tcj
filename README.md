# TCJ atomic scale and TAI − UTC bridge

Part of the **Gerarion** reference suite (verared/gerarion `v3.2.2`,
Gerarion Universal Standard). This directory is an **export package**
ready to be published (or consumed) as the `verared/gt-tcj` satellite
repository; it keeps the base repository's relative layout so modules
compose cleanly.

## The unique problem it solves

The global TCJ = TAI + 8,400 s coordinate, the versioned historical TAI − UTC table (IERS-C-2026.1) with an extrapolation warning past its validity horizon, and the geographic index of civil offsets against TCJ.

## Normative status

- **Estable** (`maturity: stable`) — baseline `v3.2.2` (frozen arithmetic and vectors:
  GUS v3.0.0).
- Included specification(s): `docs/specs/TCJ.es.md`, `docs/specs/TCJ.en.md`
- Verifiable integrity manifest: [`EXPORT-MANIFEST.json`](EXPORT-MANIFEST.json)
- Official compatibility matrix: [`COMPATIBILITY.md`](https://github.com/verared/gerarion/blob/v3.2.2/COMPATIBILITY.md)

## Dependencies

- `gt-core` (*verared/gt-core*): tipos base y servicios del núcleo.
Common base: `verared/gerarion` `3.2.2`.

## Contents

- `EXPORT-MANIFEST.json`
- `LICENSE`
- `NOTICE`
- `docs/specs/TCJ.en.md`
- `docs/specs/TCJ.es.md`
- `impl-c/tai/gus_tai.c`
- `impl-c/tai/gus_tai.h`
- `src/gerarion/tcj/__init__.py`
- `src/gerarion/tcj/tai.py`
- `web/engine/tcj-tai.mjs`
- `web/engine/zonas-tcj.mjs`

## Offline usage

No network, accounts, package registries, or frameworks required:

```bash
python3 -c 'import sys; sys.path.insert(0, "src"); import gerarion'
```

## Verification

With Python ≥ 3.9 and `reuse` installed:

```bash
reuse lint                                    # licensing 100 %
# (las pruebas viven en la suite de verared/gerarion)
```

From `verared/gerarion`, full integrity against `EXPORT-MANIFEST.json` is verified with:

```bash
python3 tools/export_module.py --verify-existing /path/to/gt-tcj
```

## Synchronisation contract with `verared/gerarion`

This package is **generated, never hand-edited**: it is regenerated
byte for byte from `verared/gerarion v3.2.2` with
`python3 tools/export_module.py --module gt-tcj --out <dir>`. The
normative source of truth (specifications, CC0 vectors, reference
cores for the three platforms, and the full test suite) stays in
`verared/gerarion`; `verared/gt-tcj` satellites consume it and never fork the
arithmetic. Updates flow by regenerating the export from a tag of the
base repository — never by editing exported files.
