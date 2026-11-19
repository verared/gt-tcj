# SPDX-License-Identifier: MIT OR Apache-2.0
# SPDX-FileCopyrightText: 2026 verared contributors
"""Capa 0 — TAI y Capa 1 — TCJ (GUS 3.0.0, Cap 7 y Cap 13 del corpus canónico).

El instante GUS (`instant`, int) es un conteo continuo y monotónico de
segundos TCJ desde el origen Geroriano (``0000DY-01-01-S-00:00:00-LC-TCJ+0``,
``instant = 0``). Sin segundos intercalares internos: escala continua.

- **TCJ** — Tiempo de Coordinación de Jerusalén: marco de coordinación
  global del proyecto, definido operacionalmente como **TAI + 8 400 s**
  (meridiano de Jerusalén, 31.7683°N / 35.2137°E, 754 m — Cap 7).
- **TAI** — escala atómica continua (segundos SI). La frontera con UTC se
  aplica SOLO en los adaptadores (perfil GUS-3339/puente Unix), mediante la
  tabla histórica IERS de abajo; pre-1958 es convención proléptica (0 s,
  spec §9) y 1958–1971 se normaliza a 10 s (declarado, no medido).
"""

from bisect import bisect_right
from typing import List, Tuple

# TCJ = TAI + 8 400 s  (meridiano 35.2137°E: 02 h 20 min de avance sobre UTC.)
TCJ_OFFSET_SECONDS = 8_400

# Tabla histórica TAI − UTC (IERS/BIPM, 29 entradas): (unix_utc_desde, offset).
# La entrada 1972-01-01 formaliza la base UTC (10 s); 1958-01-01 fija la
# convención "10 s" para 1958-1971; pre-1958 → 0 s (proléptico, §9).
TAI_MINUS_UTC_TABLE: List[Tuple[int, int]] = [
    (-378_691_200, 10),  # 1958-01-01 (convención declarada, no medida)
    (63_072_000, 10),    # 1972-01-01 (base UTC IERS)
    (78_796_800, 11),    # 1972-07-01
    (94_694_400, 12),    # 1973-01-01
    (126_230_400, 13),   # 1974-01-01
    (157_766_400, 14),   # 1975-01-01
    (189_302_400, 15),   # 1976-01-01
    (220_924_800, 16),   # 1977-01-01
    (252_460_800, 17),   # 1978-01-01
    (283_996_800, 18),   # 1979-01-01
    (315_532_800, 19),   # 1980-01-01
    (362_793_600, 20),   # 1981-07-01
    (394_329_600, 21),   # 1982-07-01
    (425_865_600, 22),   # 1983-07-01
    (489_024_000, 23),   # 1985-07-01
    (567_993_600, 24),   # 1988-01-01
    (631_152_000, 25),   # 1990-01-01
    (662_688_000, 26),   # 1991-01-01
    (709_948_800, 27),   # 1992-07-01
    (741_484_800, 28),   # 1993-07-01
    (773_020_800, 29),   # 1994-07-01
    (820_454_400, 30),   # 1996-01-01
    (867_715_200, 31),   # 1997-07-01
    (915_148_800, 32),   # 1999-01-01
    (1_136_073_600, 33), # 2006-01-01
    (1_230_768_000, 34), # 2009-01-01
    (1_341_100_800, 35), # 2012-07-01
    (1_435_708_800, 36), # 2015-07-01
    (1_483_228_800, 37), # 2017-01-01
]

TABLE_EPOCHS = [e for e, _ in TAI_MINUS_UTC_TABLE]
TABLE_OFFSETS = [o for _, o in TAI_MINUS_UTC_TABLE]

# ---------------------------------------------------------------------------
# Puente TAI − UTC versionado (horizonte CGPM 2027)
#
# La tabla es un DATO con vigencia, no una constante eterna: la CGPM aprobó
# la transición a UTC continuo (sin intercalares) a partir de mayo de 2027;
# después de valid_until_unix la tabla exige revisión y cualquier lectura
# se marca como EXTRAPOLACIÓN (nunca como hecho medido).
# ---------------------------------------------------------------------------

TAI_UTC_TABLE_VERSION = "IERS-C-2026.1"
#: 2027-05-01T00:00:00Z en segundos Unix: fin de la vigencia verificada
#: (transición a UTC continuo aprobada por la CGPM para mayo de 2027).
TAI_UTC_VALID_UNTIL_UNIX = 1_799_808_000
#: El leap smear NO es una escala física TAI: las escalas smearing (UTC-SLS
#: y similares) se RECHAZAN en el puente; nunca se interpretan como TAI.
TAI_UTC_SMEAR_POLICY = "reject"


def tai_utc_table_info() -> dict:
    """Metadatos explícitos de la tabla TAI − UTC embebida."""
    return {
        "table_version": TAI_UTC_TABLE_VERSION,
        "valid_until_unix": TAI_UTC_VALID_UNTIL_UNIX,
        "smear_policy": TAI_UTC_SMEAR_POLICY,
    }


def tai_minus_utc_checked(unix_seconds: int) -> tuple:
    """Offset + indicador de extrapolación.

    Devuelve ``(offset, extrapolated)``: ``extrapolated`` es True si el
    instante consultado es posterior a ``valid_until_unix`` (la tabla no
    cubre ese futuro verificado: puede cambiar con UTC continuo).
    """
    offset = tai_minus_utc(unix_seconds)
    return offset, unix_seconds > TAI_UTC_VALID_UNTIL_UNIX


def tai_minus_utc(unix_seconds: int) -> int:
    """Offset TAI − UTC vigente para un segundo Unix (UTC). O(1) por bisect.

    Pre-1958: 0 s (proléptico declarado, spec §9); 1958–1971: 10 s; después,
    la tabla IERS (37 s desde 2017-01-01 — último intercalar publicado).
    """
    i = bisect_right(TABLE_EPOCHS, unix_seconds) - 1
    if i < 0:
        return 0
    return TABLE_OFFSETS[i]


def instant_from_unix(unix_seconds: int) -> int:
    """Unix (UTC, sin intercalares en la representación) → instante GUS.

    unix → TAI (tabla IERS) → TCJ (+8 400 s) → GUS (offset del origen).
    """
    tai = unix_seconds + tai_minus_utc(unix_seconds)
    tcj = tai + TCJ_OFFSET_SECONDS
    return tcj + _unix_offset_constant()


def unix_from_instant(instant: int) -> int:
    """Instante GUS → segundo Unix UTC (exacto, inversa de instant_from_unix).

    Resuelve ``utc + tai_minus_utc(utc) = tai`` en la segmentación exacta de
    la tabla: para cada segmento de vigencia [epoch_i, epoch_{i+1}) la única
    solución es utc = tai − off_i, válida si cae dentro del segmento.
    Pre-tabla (< 1958): convención 0 s, utc = tai.
    """
    tcj = instant - _unix_offset_constant()
    tai = tcj - TCJ_OFFSET_SECONDS
    lows = list(TABLE_EPOCHS)
    offs = [0] + TABLE_OFFSETS  # [0] cubre el tramo pre-1958 (convención 0 s)
    for i in range(len(offs)):
        low = lows[i - 1] if i > 0 else -(2**62)
        high = lows[i] if i < len(lows) else 2**62
        utc = tai - offs[i]
        if low <= utc < high:
            return utc
    return tai  # inalcanzable con segmentación completa; nunca ambiguo


# ---------------------------------------------------------------------------
# Constante de puente (definida aquí para evitar import circular con profiles).
# = (UNIX_EPOCH_JDN − ORIGIN_JDN) × 86 400 = 62 318 160 000
# ---------------------------------------------------------------------------
def _unix_offset_constant() -> int:
    return 62_318_160_000


_FUTURE_SENTINEL = 2**62  # cota nominal (la tabla no tiene eventos tras 2017-01-01)
