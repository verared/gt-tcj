// SPDX-License-Identifier: MIT OR Apache-2.0
// Geographic index: IANA tzdb 2026f, zone.tab + iso3166.tab (public domain).
// The index identifies jurisdictions. Actual date-dependent rules come from Intl/ICU.
// Visitor-facing policy: regions that share the exact same civil time are merged
// into one row, and the displayed difference is rounded to whole hours (TCJ±H).
// The internal delta keeps full-second precision for clock readings.
import {
  ORIGIN_JDN,
  jdn,
  instantParts,
} from "./core.mjs";
import {
  UNIX_EPOCH_JDN,
  instantFromUnix,
  TCJ_OFFSET_SECONDS,
  taiMinusUTC,
} from "./tcj-tai.mjs";
export const REFERENCE = "TCJ+0";
export const DIRECTORY_VERSION = "2026f";
const records = `AD|Andorra|Europe/Andorra
AE|United Arab Emirates|Asia/Dubai
AF|Afghanistan|Asia/Kabul
AG|Antigua & Barbuda|America/Antigua
AI|Anguilla|America/Anguilla
AL|Albania|Europe/Tirane
AM|Armenia|Asia/Yerevan
AO|Angola|Africa/Luanda
AQ|Antarctica|Antarctica/McMurdo,Antarctica/Casey,Antarctica/Davis,Antarctica/DumontDUrville,Antarctica/Mawson,Antarctica/Palmer,Antarctica/Rothera,Antarctica/Syowa,Antarctica/Troll,Antarctica/Vostok
AR|Argentina|America/Argentina/Buenos_Aires,America/Argentina/Cordoba,America/Argentina/Salta,America/Argentina/Jujuy,America/Argentina/Tucuman,America/Argentina/Catamarca,America/Argentina/La_Rioja,America/Argentina/San_Juan,America/Argentina/Mendoza,America/Argentina/San_Luis,America/Argentina/Rio_Gallegos,America/Argentina/Ushuaia
AS|Samoa (American)|Pacific/Pago_Pago
AT|Austria|Europe/Vienna
AU|Australia|Australia/Lord_Howe,Antarctica/Macquarie,Australia/Hobart,Australia/Melbourne,Australia/Sydney,Australia/Broken_Hill,Australia/Brisbane,Australia/Lindeman,Australia/Adelaide,Australia/Darwin,Australia/Perth,Australia/Eucla
AW|Aruba|America/Aruba
AX|Åland Islands|Europe/Mariehamn
AZ|Azerbaijan|Asia/Baku
BA|Bosnia & Herzegovina|Europe/Sarajevo
BB|Barbados|America/Barbados
BD|Bangladesh|Asia/Dhaka
BE|Belgium|Europe/Brussels
BF|Burkina Faso|Africa/Ouagadougou
BG|Bulgaria|Europe/Sofia
BH|Bahrain|Asia/Bahrain
BI|Burundi|Africa/Bujumbura
BJ|Benin|Africa/Porto-Novo
BL|St Barthelemy|America/St_Barthelemy
BM|Bermuda|Atlantic/Bermuda
BN|Brunei|Asia/Brunei
BO|Bolivia|America/La_Paz
BQ|Caribbean NL|America/Kralendijk
BR|Brazil|America/Noronha,America/Belem,America/Fortaleza,America/Recife,America/Araguaina,America/Maceio,America/Bahia,America/Sao_Paulo,America/Campo_Grande,America/Cuiaba,America/Santarem,America/Porto_Velho,America/Boa_Vista,America/Manaus,America/Eirunepe,America/Rio_Branco
BS|Bahamas|America/Nassau
BT|Bhutan|Asia/Thimphu
BV|Bouvet Island|
BW|Botswana|Africa/Gaborone
BY|Belarus|Europe/Minsk
BZ|Belize|America/Belize
CA|Canada|America/St_Johns,America/Halifax,America/Glace_Bay,America/Moncton,America/Goose_Bay,America/Blanc-Sablon,America/Toronto,America/Iqaluit,America/Atikokan,America/Winnipeg,America/Resolute,America/Rankin_Inlet,America/Regina,America/Swift_Current,America/Edmonton,America/Cambridge_Bay,America/Inuvik,America/Vancouver,America/Creston,America/Dawson_Creek,America/Fort_Nelson,America/Whitehorse,America/Dawson
CC|Cocos (Keeling) Islands|Indian/Cocos
CD|Congo (Dem. Rep.)|Africa/Kinshasa,Africa/Lubumbashi
CF|Central African Rep.|Africa/Bangui
CG|Congo (Rep.)|Africa/Brazzaville
CH|Switzerland|Europe/Zurich
CI|Côte d’Ivoire|Africa/Abidjan
CK|Cook Islands|Pacific/Rarotonga
CL|Chile|America/Santiago,America/Coyhaique,America/Punta_Arenas,Pacific/Easter
CM|Cameroon|Africa/Douala
CN|China|Asia/Shanghai,Asia/Urumqi
CO|Colombia|America/Bogota
CR|Costa Rica|America/Costa_Rica
CU|Cuba|America/Havana
CV|Cape Verde|Atlantic/Cape_Verde
CW|Curaçao|America/Curacao
CX|Christmas Island|Indian/Christmas
CY|Cyprus|Asia/Nicosia,Asia/Famagusta
CZ|Czech Republic|Europe/Prague
DE|Germany|Europe/Berlin,Europe/Busingen
DJ|Djibouti|Africa/Djibouti
DK|Denmark|Europe/Copenhagen
DM|Dominica|America/Dominica
DO|Dominican Republic|America/Santo_Domingo
DZ|Algeria|Africa/Algiers
EC|Ecuador|America/Guayaquil,Pacific/Galapagos
EE|Estonia|Europe/Tallinn
EG|Egypt|Africa/Cairo
EH|Western Sahara|Africa/El_Aaiun
ER|Eritrea|Africa/Asmara
ES|Spain|Europe/Madrid,Africa/Ceuta,Atlantic/Canary
ET|Ethiopia|Africa/Addis_Ababa
FI|Finland|Europe/Helsinki
FJ|Fiji|Pacific/Fiji
FK|Falkland Islands|Atlantic/Stanley
FM|Micronesia|Pacific/Chuuk,Pacific/Pohnpei,Pacific/Kosrae
FO|Faroe Islands|Atlantic/Faroe
FR|France|Europe/Paris
GA|Gabon|Africa/Libreville
GB|Britain (UK)|Europe/London
GD|Grenada|America/Grenada
GE|Georgia|Asia/Tbilisi
GF|French Guiana|America/Cayenne
GG|Guernsey|Europe/Guernsey
GH|Ghana|Africa/Accra
GI|Gibraltar|Europe/Gibraltar
GL|Greenland|America/Nuuk,America/Danmarkshavn,America/Scoresbysund,America/Thule
GM|Gambia|Africa/Banjul
GN|Guinea|Africa/Conakry
GP|Guadeloupe|America/Guadeloupe
GQ|Equatorial Guinea|Africa/Malabo
GR|Greece|Europe/Athens
GS|South Georgia & the South Sandwich Islands|Atlantic/South_Georgia
GT|Guatemala|America/Guatemala
GU|Guam|Pacific/Guam
GW|Guinea-Bissau|Africa/Bissau
GY|Guyana|America/Guyana
HK|Hong Kong|Asia/Hong_Kong
HM|Heard Island & McDonald Islands|
HN|Honduras|America/Tegucigalpa
HR|Croatia|Europe/Zagreb
HT|Haiti|America/Port-au-Prince
HU|Hungary|Europe/Budapest
ID|Indonesia|Asia/Jakarta,Asia/Pontianak,Asia/Makassar,Asia/Jayapura
IE|Ireland|Europe/Dublin
IL|Israel|Asia/Jerusalem
IM|Isle of Man|Europe/Isle_of_Man
IN|India|Asia/Kolkata
IO|British Indian Ocean Territory|Indian/Chagos
IQ|Iraq|Asia/Baghdad
IR|Iran|Asia/Tehran
IS|Iceland|Atlantic/Reykjavik
IT|Italy|Europe/Rome
JE|Jersey|Europe/Jersey
JM|Jamaica|America/Jamaica
JO|Jordan|Asia/Amman
JP|Japan|Asia/Tokyo
KE|Kenya|Africa/Nairobi
KG|Kyrgyzstan|Asia/Bishkek
KH|Cambodia|Asia/Phnom_Penh
KI|Kiribati|Pacific/Tarawa,Pacific/Kanton,Pacific/Kiritimati
KM|Comoros|Indian/Comoro
KN|St Kitts & Nevis|America/St_Kitts
KP|Korea (North)|Asia/Pyongyang
KR|Korea (South)|Asia/Seoul
KW|Kuwait|Asia/Kuwait
KY|Cayman Islands|America/Cayman
KZ|Kazakhstan|Asia/Almaty,Asia/Qyzylorda,Asia/Qostanay,Asia/Aqtobe,Asia/Aqtau,Asia/Atyrau,Asia/Oral
LA|Laos|Asia/Vientiane
LB|Lebanon|Asia/Beirut
LC|St Lucia|America/St_Lucia
LI|Liechtenstein|Europe/Vaduz
LK|Sri Lanka|Asia/Colombo
LR|Liberia|Africa/Monrovia
LS|Lesotho|Africa/Maseru
LT|Lithuania|Europe/Vilnius
LU|Luxembourg|Europe/Luxembourg
LV|Latvia|Europe/Riga
LY|Libya|Africa/Tripoli
MA|Morocco|Africa/Casablanca
MC|Monaco|Europe/Monaco
MD|Moldova|Europe/Chisinau
ME|Montenegro|Europe/Podgorica
MF|St Martin (French)|America/Marigot
MG|Madagascar|Indian/Antananarivo
MH|Marshall Islands|Pacific/Majuro,Pacific/Kwajalein
MK|North Macedonia|Europe/Skopje
ML|Mali|Africa/Bamako
MM|Myanmar (Burma)|Asia/Yangon
MN|Mongolia|Asia/Ulaanbaatar,Asia/Hovd
MO|Macau|Asia/Macau
MP|Northern Mariana Islands|Pacific/Saipan
MQ|Martinique|America/Martinique
MR|Mauritania|Africa/Nouakchott
MS|Montserrat|America/Montserrat
MT|Malta|Europe/Malta
MU|Mauritius|Indian/Mauritius
MV|Maldives|Indian/Maldives
MW|Malawi|Africa/Blantyre
MX|Mexico|America/Mexico_City,America/Cancun,America/Merida,America/Monterrey,America/Matamoros,America/Chihuahua,America/Ciudad_Juarez,America/Ojinaga,America/Mazatlan,America/Bahia_Banderas,America/Hermosillo,America/Tijuana
MY|Malaysia|Asia/Kuala_Lumpur,Asia/Kuching
MZ|Mozambique|Africa/Maputo
NA|Namibia|Africa/Windhoek
NC|New Caledonia|Pacific/Noumea
NE|Niger|Africa/Niamey
NF|Norfolk Island|Pacific/Norfolk
NG|Nigeria|Africa/Lagos
NI|Nicaragua|America/Managua
NL|Netherlands|Europe/Amsterdam
NO|Norway|Europe/Oslo
NP|Nepal|Asia/Kathmandu
NR|Nauru|Pacific/Nauru
NU|Niue|Pacific/Niue
NZ|New Zealand|Pacific/Auckland,Pacific/Chatham
OM|Oman|Asia/Muscat
PA|Panama|America/Panama
PE|Peru|America/Lima
PF|French Polynesia|Pacific/Tahiti,Pacific/Marquesas,Pacific/Gambier
PG|Papua New Guinea|Pacific/Port_Moresby,Pacific/Bougainville
PH|Philippines|Asia/Manila
PK|Pakistan|Asia/Karachi
PL|Poland|Europe/Warsaw
PM|St Pierre & Miquelon|America/Miquelon
PN|Pitcairn|Pacific/Pitcairn
PR|Puerto Rico|America/Puerto_Rico
PS|Palestine|Asia/Gaza,Asia/Hebron
PT|Portugal|Europe/Lisbon,Atlantic/Madeira,Atlantic/Azores
PW|Palau|Pacific/Palau
PY|Paraguay|America/Asuncion
QA|Qatar|Asia/Qatar
RE|Réunion|Indian/Reunion
RO|Romania|Europe/Bucharest
RS|Serbia|Europe/Belgrade
RU|Russia|Europe/Kaliningrad,Europe/Moscow,Europe/Kirov,Europe/Volgograd,Europe/Astrakhan,Europe/Saratov,Europe/Ulyanovsk,Europe/Samara,Asia/Yekaterinburg,Asia/Omsk,Asia/Novosibirsk,Asia/Barnaul,Asia/Tomsk,Asia/Novokuznetsk,Asia/Krasnoyarsk,Asia/Irkutsk,Asia/Chita,Asia/Yakutsk,Asia/Khandyga,Asia/Vladivostok,Asia/Ust-Nera,Asia/Magadan,Asia/Sakhalin,Asia/Srednekolymsk,Asia/Kamchatka,Asia/Anadyr
RW|Rwanda|Africa/Kigali
SA|Saudi Arabia|Asia/Riyadh
SB|Solomon Islands|Pacific/Guadalcanal
SC|Seychelles|Indian/Mahe
SD|Sudan|Africa/Khartoum
SE|Sweden|Europe/Stockholm
SG|Singapore|Asia/Singapore
SH|St Helena|Atlantic/St_Helena
SI|Slovenia|Europe/Ljubljana
SJ|Svalbard & Jan Mayen|Arctic/Longyearbyen
SK|Slovakia|Europe/Bratislava
SL|Sierra Leone|Africa/Freetown
SM|San Marino|Europe/San_Marino
SN|Senegal|Africa/Dakar
SO|Somalia|Africa/Mogadishu
SR|Suriname|America/Paramaribo
SS|South Sudan|Africa/Juba
ST|Sao Tome & Principe|Africa/Sao_Tome
SV|El Salvador|America/El_Salvador
SX|St Maarten (Dutch)|America/Lower_Princes
SY|Syria|Asia/Damascus
SZ|Eswatini (Swaziland)|Africa/Mbabane
TC|Turks & Caicos Is|America/Grand_Turk
TD|Chad|Africa/Ndjamena
TF|French S. Terr.|Indian/Kerguelen
TG|Togo|Africa/Lome
TH|Thailand|Asia/Bangkok
TJ|Tajikistan|Asia/Dushanbe
TK|Tokelau|Pacific/Fakaofo
TL|East Timor|Asia/Dili
TM|Turkmenistan|Asia/Ashgabat
TN|Tunisia|Africa/Tunis
TO|Tonga|Pacific/Tongatapu
TR|Turkey|Europe/Istanbul
TT|Trinidad & Tobago|America/Port_of_Spain
TV|Tuvalu|Pacific/Funafuti
TW|Taiwan|Asia/Taipei
TZ|Tanzania|Africa/Dar_es_Salaam
UA|Ukraine|Europe/Simferopol,Europe/Kyiv
UG|Uganda|Africa/Kampala
UM|US minor outlying islands|Pacific/Midway,Pacific/Wake
US|United States|America/New_York,America/Detroit,America/Kentucky/Louisville,America/Kentucky/Monticello,America/Indiana/Indianapolis,America/Indiana/Vincennes,America/Indiana/Winamac,America/Indiana/Marengo,America/Indiana/Petersburg,America/Indiana/Vevay,America/Chicago,America/Indiana/Tell_City,America/Indiana/Knox,America/Menominee,America/North_Dakota/Center,America/North_Dakota/New_Salem,America/North_Dakota/Beulah,America/Denver,America/Boise,America/Phoenix,America/Los_Angeles,America/Anchorage,America/Juneau,America/Sitka,America/Metlakatla,America/Yakutat,America/Nome,America/Adak,Pacific/Honolulu
UY|Uruguay|America/Montevideo
UZ|Uzbekistan|Asia/Samarkand,Asia/Tashkent
VA|Vatican City|Europe/Vatican
VC|St Vincent|America/St_Vincent
VE|Venezuela|America/Caracas
VG|Virgin Islands (UK)|America/Tortola
VI|Virgin Islands (US)|America/St_Thomas
VN|Vietnam|Asia/Ho_Chi_Minh
VU|Vanuatu|Pacific/Efate
WF|Wallis & Futuna|Pacific/Wallis
WS|Samoa (western)|Pacific/Apia
YE|Yemen|Asia/Aden
YT|Mayotte|Indian/Mayotte
ZA|South Africa|Africa/Johannesburg
ZM|Zambia|Africa/Lusaka
ZW|Zimbabwe|Africa/Harare`;
// Human-readable names; IANA identifiers themselves remain unchanged and unambiguous.
const cities = {
  Jerusalem: "Jerusalén",
  Santiago: "Santiago",
  Buenos_Aires: "Buenos Aires",
  Easter: "Isla de Pascua",
  Cordoba: "Córdoba",
  Tucuman: "Tucumán",
  Rio_Gallegos: "Río Gallegos",
  New_York: "Nueva York",
  London: "Londres",
  Paris: "París",
  Lisbon: "Lisboa",
  Berlin: "Berlín",
  Zurich: "Zúrich",
  Rome: "Roma",
  Brussels: "Bruselas",
  Moscow: "Moscú",
  Athens: "Atenas",
  Copenhagen: "Copenhague",
  Dublin: "Dublín",
  Vienna: "Viena",
  Prague: "Praga",
  Warsaw: "Varsovia",
  Bucharest: "Bucarest",
  Belgrade: "Belgrado",
  Kyiv: "Kiev",
  Stockholm: "Estocolmo",
  Sofia: "Sofía",
  Tokyo: "Tokio",
  Seoul: "Seúl",
  Shanghai: "Shanghái",
  Kolkata: "Calcuta",
  Kathmandu: "Katmandú",
  Tehran: "Teherán",
  Beirut: "Beirut",
  Singapore: "Singapur",
  Istanbul: "Estambul",
  Cairo: "El Cairo",
  Algiers: "Argel",
  Dakar: "Dakar",
  Tunis: "Túnez",
  Bogota: "Bogotá",
  Asuncion: "Asunción",
  Panama: "Panamá",
  Havana: "La Habana",
  Sao_Paulo: "São Paulo",
  Mexico_City: "Ciudad de México",
  Ciudad_Juarez: "Ciudad Juárez",
  Cancun: "Cancún",
  Merida: "Mérida",
  Los_Angeles: "Los Ángeles",
  Port_au_Prince: "Puerto Príncipe",
  Canary: "Islas Canarias",
  Azores: "Azores",
  Sydney: "Sídney",
  Chatham: "Islas Chatham",
  Curacao: "Curazao",
  St_Johns: "San Juan de Terranova",
  St_Thomas: "Saint Thomas",
  Ulaanbaatar: "Ulán Bator",
  Dubai: "Dubái",
  Hong_Kong: "Hong Kong",
  Urumqi: "Ürümqi",
  Bangkok: "Bangkok",
  Reykjavik: "Reikiavik",
  Amsterdam: "Ámsterdam",
  Lusaka: "Lusaka",
  Godthab: "Nuuk",
  Galapagos: "Galápagos",
};
const names =
  typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["es"], { type: "region" })
    : null;
export const territories = records
  .split("\n")
  .map((line) => {
    const [code, fallback, ids] = line.split("|");
    return {
      code,
      name: names?.of(code) || fallback,
      ids: ids ? ids.split(",") : [],
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "es"));
const byId = new Map([
  [
    REFERENCE,
    {
      id: REFERENCE,
      city: "Jerusalén",
      country: "Referencia Gerarion",
      code: "",
      reference: true,
    },
  ],
]);
for (const t of territories)
  for (const id of t.ids) {
    const last = id.split("/").at(-1);
    byId.set(id, {
      id,
      city: cities[last] || last.replaceAll("_", " "),
      country: t.name,
      code: t.code,
      reference: false,
    });
  }
export const zoneCount = byId.size - 1;
export const zoneInfo = (id) => byId.get(id) || null;
const rules = new Map();
function rule(id) {
  if (id === REFERENCE || !byId.has(id))
    throw Error("Ubicación no reconocida.");
  if (!rules.has(id)) {
    let f;
    try {
      f = {
        style: "offset",
        dt: new Intl.DateTimeFormat("en-US", {
          timeZone: id,
          timeZoneName: "longOffset",
          hour: "2-digit",
          hourCycle: "h23",
        }),
      };
    } catch {
      try {
        f = {
          style: "fields",
          dt: new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn", {
            timeZone: id,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
            era: "short",
          }),
        };
      } catch {
        f = null;
      }
    }
    rules.set(id, f);
  }
  const fmt = rules.get(id);
  if (!fmt)
    throw Error("La base horaria de este navegador no incluye esta región.");
  return fmt;
}
export function civilOffset(ms, id) {
  const r = rule(id),
    parts = Object.fromEntries(
      r.dt.formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
    );
  if (r.style === "offset") {
    const m =
      /^(?:GMT|UTC)(?:([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?)?$/.exec(
        parts.timeZoneName.replaceAll("−", "-"),
      );
    if (!m)
      throw Error("El navegador no puede expresar el desfase de esta región.");
    return !m[1]
      ? 0
      : (m[1] === "-" ? -1 : 1) *
          (Number(m[2]) * 3600 + Number(m[3] || 0) * 60 + Number(m[4] || 0));
  }
  const year = parts.era === "BC" ? 1 - Number(parts.year) : Number(parts.year);
  return (
    (jdn(year, +parts.month, +parts.day) - UNIX_EPOCH_JDN) * 86400 +
    (+parts.hour % 24) * 3600 +
    +parts.minute * 60 +
    +parts.second -
    Math.floor(ms / 1000)
  );
}
export function zoneDelta(ms, id = REFERENCE) {
  if (id === REFERENCE) return 0;
  return (
    civilOffset(ms, id) -
    TCJ_OFFSET_SECONDS -
    taiMinusUTC(Math.floor(ms / 1000))
  );
}
// Visitor-facing label: whole hours only (e.g. Santiago -5:20:37 → TCJ−5).
// The exact second-residue stays available through zoneDelta() for clocks.
export function deltaLabel(seconds) {
  if (seconds === 0) return REFERENCE;
  const hours = Math.round(Math.abs(seconds) / 3600);
  return `TCJ${seconds < 0 ? "−" : "+"}${hours}`;
}
// Preferred representative per group: a widely known city in the list, else the first.
const PREFERENCES = [
  "Santiago",
  "Buenos_Aires",
  "New_York",
  "London",
  "Paris",
  "Berlin",
  "Madrid",
  "Rome",
  "Moscow",
  "Tokyo",
  "Seoul",
  "Shanghai",
  "Hong_Kong",
  "Singapore",
  "Sydney",
  "Sao_Paulo",
  "Mexico_City",
  "Bogota",
  "Lima",
  "Los_Angeles",
  "Chicago",
  "Dubai",
  "Kolkata",
  "Kathmandu",
  "Cairo",
  "Lagos",
  "Johannesburg",
  "Montevideo",
];
function representative(ids) {
  for (const wanted of PREFERENCES) {
    const hit = ids.find((id) => id.split("/").at(-1) === wanted);
    if (hit) return hit;
  }
  return ids[0];
}
// Civil regions that read the exact same time share one row, whatever their country.
// Rows with no IANA zone (BV, HM) come one per territory, without invented offsets.
export function zoneGroups(ms = Date.now()) {
  const at = Number(ms),
    groups = new Map();
  for (const t of territories) {
    if (!t.ids.length) {
      groups.set(`none:${t.code}`, { delta: null, ids: [], countries: [t.name], extras: [] });
      continue;
    }
    for (const id of t.ids) {
      let delta = null;
      try {
        delta = zoneDelta(at, id);
      } catch {}
      const key = delta === null ? `na:${t.code}` : `d:${delta}`;
      if (!groups.has(key))
        groups.set(key, { delta, ids: [], countries: [] });
      const g = groups.get(key);
      if (delta === null) {
        g.delta = null;
        continue;
      }
      g.ids.push(id);
      g.countries.push(t.name);
    }
  }
  const rows = [],
    unavailable = [];
  for (const g of groups.values()) {
    if (g.delta === null) {
      if (g.countries.length)
        unavailable.push({
          delta: null,
          label: "No disponible",
          primary: null,
          ids: [],
          countries: g.countries,
          extra: 0,
        });
      continue;
    }
    g.primary = representative(g.ids);
    g.countries = [...new Set(g.countries)].sort((a, b) => a.localeCompare(b, "es"));
    rows.push({
      delta: g.delta,
      label: deltaLabel(g.delta),
      primary: g.primary,
      ids: g.ids,
      countries: g.countries,
      extra: g.countries.length - 1,
    });
  }
  rows.sort((a, b) => b.delta - a.delta || zoneInfo(a.primary).city.localeCompare(zoneInfo(b.primary).city, "es"));
  rows.push(...unavailable);
  for (const t of territories)
    if (!t.ids.length)
      rows.push({
        delta: null,
        label: "Sin asignación",
        primary: null,
        ids: [],
        countries: [t.name],
        extra: 0,
      });
  return rows;
}
export function observe(
  ms = Date.now(),
  id = REFERENCE,
  instant = instantFromUnix(BigInt(Math.floor(ms / 1000))),
) {
  const zone = zoneInfo(id);
  if (!zone) throw Error("Ubicación no reconocida.");
  const delta = zoneDelta(ms, id),
    p = instantParts(instant + BigInt(delta)),
    two = (n) => String(n).padStart(2, "0");
  return {
    zone,
    delta,
    label: deltaLabel(delta),
    time: [p.hour, p.minute, p.second].map(two).join(":"),
    p,
    jdn: ORIGIN_JDN + p.dayIndex,
  };
}
// Availability check for a viewer's ICU build: usable only if its rules resolve.
export function supportedZone(id, ms = Date.now()) {
  if (!zoneInfo(id)) return false;
  try {
    zoneDelta(ms, id);
    return true;
  } catch {
    return false;
  }
}
