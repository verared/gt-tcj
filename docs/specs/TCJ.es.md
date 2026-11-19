# Especificación TCJ — Tiempo de Coordinación de Jerusalén

- **Estado:** Estable (normativo) · **Versión del documento:** 1.0.0 · **Línea base:** GUS v3.1.1
- **Edición consolidada:** [`../spec/gus-3.0.0.md`](../spec/gus-3.0.0.md) (§5, §9)
- **Licencia:** CC-BY-4.0 · Mantenida por: verared contributors

## 1. Alcance

TCJ define la **coordenada global de referencia** del tiempo Gerarion y su
relación con la base atómica TAI y con UTC. Este documento es autónomo:
un dispositivo puede adoptar TCJ sin adoptar el formato de marca GUS,
el sellado GST ni los calendarios.

## 2. Reglas normativas

1. **Definición:** `TCJ = TAI + 8.400 s`, constante matemática fija.
   No es un servidor ni una autoridad central: no existe punto único
   de falla; cualquier reloj la calcula sin consultar a nadie.
2. **Meridiano de referencia:** Jerusalén, 31.7683°N, 35.2137°E, 754 m.
3. **Base física:** el tiempo es TAI (atomical, continuo, sin segundos
   intercalares internos). TCJ no es una escala física distinta: es un
   offset constante sobre TAI.
4. **Puente versionado TAI − UTC:** la tabla histórica IERS
   (`IERS-C-2026.1`, 29 entradas: 1958-01-01 = 10 s … 2017-01-01 = 37 s)
   está embebida y versionada en las implementaciones de referencia,
   con `valid_until_unix` (transición UTC continuo, CGPM 2027) y
   `smear_policy = "reject"`: el *leap smear* no es una escala física
   TAI y se rechaza. Fechas posteriores a `valid_until_unix` generan
   aviso explícito de extrapolación.
5. **Pre-1958 (D-001.1):** extensión proléptica con offset 0 s, sin
   pretensión de coincidir con UT1 ni efemérides históricas.
6. **Convención con legacy:** TCJ − UTC ≈ +2 h 20 min 37 s en 2026
   (8.400 s + 37 s de TAI−UTC). Esta cifra es derivada, nunca definitoria.
7. **Separación de relojes:** la medición de intervalos usa el reloj
   monotónico del SO; la lectura de tiempo absoluto proviene de una
   fuente autenticada. Nunca se confunden (ver dominio GTS).

## 3. Fuentes de verdad

| Plataforma | Implementación |
|---|---|
| Python | `src/gerarion/tai.py` (`tai_minus_utc`, metadatos de tabla), constante `TCJ_OFFSET_DEFAULT` |
| C11 | `impl-c/gus_tai.c` (tabla versionada + verificación de vigencia) |
| JavaScript | `web/engine/tcj-tai.mjs` |

## 4. Vectores aplicables

- `vectors/gus-normative-003.json` — conversiones Unix → instante que
  ejercitan la tabla TAI−UTC (bloque `tgs`/`fgs`).
- `vectors/gus-regression-001.json` — simetría de eras sobre el instante.

## 5. Madurez y límites

- **Estable.** La constante 8.400 s y la semántica de la tabla están
  congeladas desde GUS v3.0.0.
- La precisión de una lectura depende del reloj del dispositivo; la
  conversión TAI−UTC depende de la tabla versionada, no de la red.
- NDJSON de vigencia: tras la transición de mayo de 2027 aprobada por
  la CGPM, una tabla no actualizada debe avisar, no extrapolar en silencio.

## 6. Referencias

- `docs/decisions/D-001-frontera-utc-tai.md` · espejo EN `docs/en/decisions/`
- `docs/audit/AUDIT-REPORT-v3.0.0.md` (hallazgos de la capa temporal)
- Especificación consolidada GUS 3.0.0, §9.1–§9.4.
