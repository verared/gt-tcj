/*
 * SPDX-License-Identifier: MIT OR Apache-2.0
 * SPDX-FileCopyrightText: 2026 verared contributors
 */

/*
 * gus_tai.c — Tabla TAI − UTC (IERS) y puente versionado.
 * Extraído sin cambios de gus.c (v3.1.1); véase tai/gus_tai.h.
 */
#include "gus_tai.h"

/* ---------------- Capa 0 — TAI (IERS) y Capa 1 — TCJ ---------------- */

static const GusTaiEntry GUS_TAI_TABLE[] = {
    {-378691200, 10},  /* 1958-01-01: convención declarada (no medida) */
    {63072000, 10},    /* 1972-01-01: base UTC IERS */
    {78796800, 11},    /* 1972-07-01 */
    {94694400, 12},    /* 1973-01-01 */
    {126230400, 13},   /* 1974-01-01 */
    {157766400, 14},   /* 1975-01-01 */
    {189302400, 15},   /* 1976-01-01 */
    {220924800, 16},   /* 1977-01-01 */
    {252460800, 17},   /* 1978-01-01 */
    {283996800, 18},   /* 1979-01-01 */
    {315532800, 19},   /* 1980-01-01 */
    {362793600, 20},   /* 1981-07-01 */
    {394329600, 21},   /* 1982-07-01 */
    {425865600, 22},   /* 1983-07-01 */
    {489024000, 23},   /* 1985-07-01 */
    {567993600, 24},   /* 1988-01-01 */
    {631152000, 25},   /* 1990-01-01 */
    {662688000, 26},   /* 1991-01-01 */
    {709948800, 27},   /* 1992-07-01 */
    {741484800, 28},   /* 1993-07-01 */
    {773020800, 29},   /* 1994-07-01 */
    {820454400, 30},   /* 1996-01-01 */
    {867715200, 31},   /* 1997-07-01 */
    {915148800, 32},   /* 1999-01-01 */
    {1136073600, 33},  /* 2006-01-01 */
    {1230768000, 34},  /* 2009-01-01 */
    {1341100800, 35},  /* 2012-07-01 */
    {1435708800, 36},  /* 2015-07-01 */
    {1483228800, 37},  /* 2017-01-01: vigente */
};

const GusTaiEntry *gus_tai_table(int *count)
{
    if (count) *count = (int)(sizeof(GUS_TAI_TABLE) / sizeof(GUS_TAI_TABLE[0]));
    return GUS_TAI_TABLE;
}

int gus_tai_minus_utc(long long unix_seconds)
{
    int count = 0;
    const GusTaiEntry *t = gus_tai_table(&count);
    int result = 0; /* pre-1958: 0 s proléptico (spec §9) */
    for (int i = 0; i < count; i++) {
        if (unix_seconds >= t[i].epoch) result = t[i].offset;
        else break;
    }
    return result;
}

/* ------------------------------------------------------------------ */
/* Puente TAI − UTC versionado (horizonte CGPM 2027)                   */
/* ------------------------------------------------------------------ */

GusTaiTableInfo gus_tai_table_info(void)
{
    GusTaiTableInfo info;
    info.table_version = "IERS-C-2026.1";
    /* Vigencia verificada de la tabla: 2027-05-01T00:00:00Z. La CGPM aprobó
     * la transición a UTC continuo (sin intercalares) a partir de mayo de
     * 2027: después de esa fecha la tabla exige revisión. */
    info.valid_until_unix = 1799808000LL;
    info.smear_policy = "reject"; /* el leap smear no es una escala física TAI */
    return info;
}

int gus_tai_minus_utc_checked(long long unix_seconds, int *extrapolated)
{
    if (extrapolated) {
        GusTaiTableInfo info = gus_tai_table_info();
        *extrapolated = (unix_seconds > info.valid_until_unix) ? 1 : 0;
    }
    return gus_tai_minus_utc(unix_seconds);
}
