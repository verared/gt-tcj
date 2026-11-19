# Escala atómica TCJ y puente TAI − UTC

Parte de la suite de referencia **Gerarion** (verared/gerarion `v3.2.0`,
Gerarion Universal Standard). Este directorio es un **paquete de
exportación** listo para publicarse (o consumirse) como repositorio
satélite `verared/gt-tcj`; conserva las rutas relativas del repositorio
base para componer módulos.

## El problema único que resuelve

La coordenada global TCJ = TAI + 8.400 s, la tabla histórica TAI − UTC versionada (IERS-C-2026.1) con aviso de extrapolación tras su vigencia, y el índice geográfico de desfases civiles frente a TCJ.

## Estado normativo

- **Estable** — línea base `v3.2.0` (aritmética y vectores
  congelados: GUS v3.0.0).
- Especificación(es) incluida(s): `docs/specs/TCJ.es.md`, `docs/specs/TCJ.en.md`

## Dependencias

- `gt-core` (*verared/gt-core*): tipos base y servicios del núcleo.
Base común: `verared/gerarion` `v3.2.0`.

## Contenido

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

## Uso offline

No requiere red, cuentas, registro de paquetes ni frameworks:

```bash
python3 -c 'import sys; sys.path.insert(0, "src"); import gerarion'
```

## Verificación

Con Python ≥ 3.9 y `reuse` instalado:

```bash
reuse lint                                    # licencias al 100 %
# (las pruebas viven en la suite de verared/gerarion)
```

## Contrato de sincronización con `verared/gerarion`

Este paquete es **generado, no editado a mano**: se regenera byte a
byte desde `verared/gerarion v3.2.0` con
`python3 tools/export_module.py --module gt-tcj --out <dir>`. La fuente
de verdad normativa (especificaciones, vectores CC0, núcleos de
referencia de las tres plataformas y la batería completa) permanece en
`verared/gerarion`; los satélites `verared/gt-tcj` la consumen y no forkean la
aritmética. Las actualizaciones fluyen regenerando la exportación desde
un tag del repositorio base; nunca editando los archivos exportados.
