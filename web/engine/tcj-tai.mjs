// SPDX-License-Identifier: MIT OR Apache-2.0
// SPDX-FileCopyrightText: 2026 verared contributors
/**
 * Dominio TCJ/INTEROP — puente TAI − UTC versionado, TCJ y perfil GUS-3339.
 * (División modular v3.2.0: extraído de web/gerarion.mjs sin cambios.)
 */

import {
  ORIGIN_JDN,
  SECS_PER_DAY,
  jdn,
  jdnToGregorian,
  GeroError,
} from "./core.mjs";

// Capa 0 — TAI (tabla IERS) y Capa 1 — TCJ = TAI + 8 400 s (Cap 7/Cap 13)
// ---------------------------------------------------------------------------

/** TCJ = TAI + 8 400 s (meridiano de Jerusalén, 31.7683°N 35.2137°E). */
export const TCJ_OFFSET_SECONDS = 8400;

/** Tabla histórica TAI − UTC (IERS): [unix_utc_inicio, offset_vigente]. */
export const TAI_MINUS_UTC_TABLE = [
  [-378691200, 10],  // 1958-01-01 (convención declarada, no medida)
  [63072000, 10],    // 1972-01-01 (base UTC)
  [78796800, 11], [94694400, 12], [126230400, 13], [157766400, 14],
  [189302400, 15], [220924800, 16], [252460800, 17], [283996800, 18],
  [315532800, 19], [362793600, 20], [394329600, 21], [425865600, 22],
  [489024000, 23], [567993600, 24], [631152000, 25], [662688000, 26],
  [709948800, 27], [741484800, 28], [773020800, 29], [820454400, 30],
  [867715200, 31], [915148800, 32], [1136073600, 33], [1230768000, 34],
  [1341100800, 35], [1435708800, 36], [1483228800, 37],
];

// ---------------------------------------------------------------------------
// Puente TAI − UTC versionado (horizonte CGPM 2027): la tabla es un DATO
// con vigencia. Tras valid_until (2027-05-01, transición aprobada por la
// CGPM a UTC continuo) toda lectura es EXTRAPOLACIÓN, no hecho medido.
// ---------------------------------------------------------------------------

export const TAI_UTC_TABLE_VERSION = "IERS-C-2026.1";
export const TAI_UTC_VALID_UNTIL_UNIX = 1799808000;
export const TAI_UTC_SMEAR_POLICY = "reject";

export function taiUtcTableInfo() {
  return {
    tableVersion: TAI_UTC_TABLE_VERSION,
    validUntilUnix: TAI_UTC_VALID_UNTIL_UNIX,
    smearPolicy: TAI_UTC_SMEAR_POLICY,
  };
}

/** Offset + indicador de extrapolación tras valid_until. */
export function taiMinusUTCChecked(unixSeconds) {
  const s = BigInt(unixSeconds);
  return {
    offset: taiMinusUTC(s),
    extrapolated: s > BigInt(TAI_UTC_VALID_UNTIL_UNIX),
  };
}

/** Offset TAI − UTC vigente para un segundo Unix UTC (pre-1958: 0 s). */
export function taiMinusUTC(unixSeconds) {
  let current = 0;
  for (const [epoch, off] of TAI_MINUS_UTC_TABLE) {
    if (unixSeconds >= epoch) current = off; else break;
  }
  return current;
}

/** Unix (UTC) → instante GUS: unix → TAI → TCJ (+8400) → GUS. */
export function instantFromUnix(unixSeconds) {
  const u = BigInt(unixSeconds);
  return u + BigInt(taiMinusUTC(u)) + BigInt(TCJ_OFFSET_SECONDS) + GUS_UNIX_OFFSET;
}

/** Instante GUS → Unix UTC (exacto, inversa por segmentos de la tabla). */
export function unixFromInstant(instant) {
  const tai = BigInt(instant) - GUS_UNIX_OFFSET - BigInt(TCJ_OFFSET_SECONDS);
  const epochs = TAI_MINUS_UTC_TABLE.map(([e]) => e);
  const offs = [0, ...TAI_MINUS_UTC_TABLE.map(([, o]) => o)];
  for (let i = 0; i < offs.length; i++) {
    const low = i > 0 ? BigInt(epochs[i - 1]) : -(2n ** 62n);
    const high = i < epochs.length ? BigInt(epochs[i]) : 2n ** 62n;
    const utc = tai - BigInt(offs[i]);
    if (utc >= low && utc < high) return utc;
  }
  return tai;
}

// ---------------------------------------------------------------------------
// Perfil GUS-3339: instante GUS <-> RFC 3339 UTC (perfil estricto)
// Documento normativo: docs/profiles/gus-3339-perfil.md / docs/en/profiles/.
// Vectores: vectors/gus-3339-002.json. Espejo exacto de profiles.py.
// ---------------------------------------------------------------------------

/** JDN (gregoriano proleptico) del 1970-01-01. */
export const UNIX_EPOCH_JDN = 2440588;

/** Instante GUS de 1970-01-01T00:00:00Z = (2440588 - 1719313) * 86400. */
export const GUS_UNIX_OFFSET = BigInt((UNIX_EPOCH_JDN - ORIGIN_JDN) * SECS_PER_DAY);

const R3339_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;

/** Lanza GeroError("GERO_E3339: ...") si el stamp está fuera de perfil. */
function assertProfile(ok, msg) {
  if (!ok) throw new GeroError(`GERO_E3339: ${msg}`);
}

/** Instante GUS → "AAAA-MM-DDTHH:MM:SSZ" (perfil 3339; GUS → TCJ → TAI → UTC, tabla IERS). */
export function instantToRFC3339(instant) {
  const unix = unixFromInstant(instant);
  let days = unix / BigInt(SECS_PER_DAY);           // truncado; floor manual:
  let rem = unix % BigInt(SECS_PER_DAY);
  if (rem < 0n) { days -= 1n; rem += BigInt(SECS_PER_DAY); }
  const [year, month, day] = jdnToGregorian(UNIX_EPOCH_JDN + Number(days));
  if (year < 0 || year > 9999) {
    throw new GeroError(`GERO_E3339: instante fuera del dominio RFC 3339 (año ${year})`);
  }
  const hour = Number(rem / 3600n);
  const minute = Number((rem % 3600n) / 60n);
  const second = Number(rem % 60n);
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}Z`;
}

/** "AAAA-MM-DDTHH:MM:SSZ" (perfil estricto: solo Z, sin offsets, sin :60) → instante BigInt. */
export function instantFromRFC3339(stamp) {
  const m = R3339_RE.exec(stamp);
  assertProfile(m !== null, `sintaxis fuera de perfil: ${JSON.stringify(stamp)}`);
  const [year, month, day, hour, minute, second] = m.slice(1).map(Number);
  // F1: la hora no se normaliza nunca; campos fuera de rango se rechazan.
  if (hour > 23 || minute > 59 || second > 59) {
    throw new GeroError(
      `GERO_E3339: campo horario fuera de rango (00-23:59:59): ${stamp}`
    );
  }
  if (second === 60) {
    throw new GeroError(
      "GERO_E3339: :60 (segundo intercalar UTC) no pertenece a la escala GUS; conviértelo a etiqueta UTC/Unix antes (MUST del perfil)"
    );
  }
  const j = jdn(year, month, day);
  const back = jdnToGregorian(j);
  assertProfile(back[0] === year && back[1] === month && back[2] === day,
    `fecha inválida: ${JSON.stringify(stamp)}`);
  const unix =
    BigInt(j - UNIX_EPOCH_JDN) * BigInt(SECS_PER_DAY) +
    BigInt(hour * 3600 + minute * 60 + second);
  return instantFromUnix(unix); // GUS 3.0.0: unix → TAI (tabla IERS) → TCJ → GUS
}
