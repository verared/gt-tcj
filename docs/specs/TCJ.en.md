# TCJ Specification — Jerusalem Coordinated Time

- **Status:** Stable (normative) · **Document version:** 1.0.0 · **Baseline:** GUS v3.1.1
- **Consolidated edition:** [`../en/gus-3.0.0.md`](../en/gus-3.0.0.md) (§5, §9)
- **License:** CC-BY-4.0 · Maintained by: verared contributors

## 1. Scope

TCJ defines the **global reference coordinate** of Gerarion time and its
relationship with the atomic base TAI and with UTC. This document is
self-contained: a device may adopt TCJ without adopting the GUS timestamp
format, GST sealing, or the calendars.

## 2. Normative rules

1. **Definition:** `TCJ = TAI + 8,400 s`, a fixed mathematical constant.
   It is not a server or central authority: there is no single point of
   failure; any clock computes it without consulting anyone.
2. **Reference meridian:** Jerusalem, 31.7683°N, 35.2137°E, 754 m.
3. **Physical base:** time is TAI (atomic, continuous, no internal leap
   seconds). TCJ is not a distinct physical scale: it is a constant
   offset over TAI.
4. **Versioned TAI − UTC bridge:** the historical IERS table
   (`IERS-C-2026.1`, 29 entries: 1958-01-01 = 10 s … 2017-01-01 = 37 s)
   is embedded and versioned in the reference implementations, with
   `valid_until_unix` (continuous-UTC transition, CGPM 2027) and
   `smear_policy = "reject"`: leap smear is not a physical TAI scale
   and is rejected. Dates after `valid_until_unix` raise an explicit
   extrapolation warning.
5. **Pre-1958 (D-001.1):** proleptic extension with offset 0 s, without
   claiming agreement with UT1 or historical ephemerides.
6. **Legacy convention:** TCJ − UTC ≈ +2 h 20 min 37 s in 2026
   (8,400 s + 37 s of TAI−UTC). This figure is derived, never defining.
7. **Clock separation:** interval measurement uses the OS monotonic
   clock; absolute time readings come from an authenticated source.
   They are never conflated (see the GTS domain).

## 3. Sources of truth

| Platform | Implementation |
|---|---|
| Python | `src/gerarion/tai.py` (`tai_minus_utc`, table metadata), constant `TCJ_OFFSET_DEFAULT` |
| C11 | `impl-c/gus_tai.c` (versioned table + validity check) |
| JavaScript | `web/engine/tcj-tai.mjs` |

## 4. Applicable vectors

- `vectors/gus-normative-003.json` — Unix → instant conversions that
  exercise the TAI−UTC table (`tgs`/`fgs` block).
- `vectors/gus-regression-001.json` — era symmetry over the instant.

## 5. Maturity and limits

- **Stable.** The 8,400 s constant and table semantics are frozen since
  GUS v3.0.0.
- Reading precision depends on the device clock; the TAI−UTC conversion
  depends on the versioned table, never on the network.
- Validity policy: after the CGPM-approved May 2027 transition, an
  out-of-date table must warn, not silently extrapolate.

## 6. References

- `docs/en/decisions/D-001-utc-tai-boundary.md` · ES mirror `docs/decisions/`
- `docs/en/audit/AUDIT-REPORT-v3.0.0.md` (time-layer findings)
- Consolidated specification GUS 3.0.0, §9.1–§9.4.
