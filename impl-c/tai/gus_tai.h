/*
 * SPDX-License-Identifier: MIT OR Apache-2.0
 * SPDX-FileCopyrightText: 2026 verared contributors
 */

/*
 * gus_tai.h — Dominio TCJ/INTEROP: tabla histórica TAI − UTC versionada
 * (IERS-C-2026.1) y desplazamiento TCJ. Independiente del núcleo.
 */

#ifndef GUS_TAI_H
#define GUS_TAI_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Tabla TAI − UTC (IERS): entradas {unix_utc_inicio, offset_s} vigente
 * desde esa fecha (28+1 entradas; pre-1958: 0 s proléptico, spec §9).
 * El puente GUS-3339 aplica la entrada vigente. */
typedef struct { long long epoch; int offset; } GusTaiEntry;
const GusTaiEntry *gus_tai_table(int *count);
int gus_tai_minus_utc(long long unix_seconds);

#ifdef __cplusplus
}
#endif

/* ................ TAI − UTC versionado (puente vigilado) ................ */

typedef struct {
    const char *table_version;   /* "IERS-C-2026.1" */
    long long valid_until_unix;  /* fin de la vigencia verificada */
    const char *smear_policy;    /* "reject": el leap smear no es TAI */
} GusTaiTableInfo;

/* Metadatos de la tabla embebida (vigencia y política de smear). */
GusTaiTableInfo gus_tai_table_info(void);

/* Offset + aviso de extrapolación: *extrapolated = 1 si unix_seconds es
 * posterior a valid_until_unix (la tabla no cubre ese futuro: puede
 * cambiar con la transición a UTC continuo). */
int gus_tai_minus_utc_checked(long long unix_seconds, int *extrapolated);

#endif /* GUS_TAI_H */
