export type TrackPoint = {
  km: number;
  paceSecondsPerKm?: number;
  heartRate?: number;
  elevationM?: number;
  latitude?: number;
  longitude?: number;
};

export type Run = {
  id: string;
  title: string;
  date: string;
  distanceKm: number;
  durationSeconds: number;
  averagePaceSecondsPerKm: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  elevationM?: number;
  source: "Ukázkový běh" | "CSV" | "GPX" | "FIT" | "TCX" | "Health Connect";
  track: TrackPoint[];
  estimatedTrack?: boolean;
};

export type RunStoreSnapshot = {
  runs: Run[];
  error: string;
};

export type RunImportResult = {
  runs: Run[];
  warnings: string[];
};

export type TcxMatch = {
  incoming: Run;
  existing: Run;
};

export function isLongRun(run: Run): boolean {
  return run.distanceKm > 3;
}

export function preserveTcxDetails(imported: Run[], existing: Run[]): Run[] {
  const existingById = new Map(existing.map((run) => [run.id, run]));
  return imported.map((run) => {
    const previous = existingById.get(run.id);
    return run.source === "Health Connect" && previous?.source === "TCX" ? previous : run;
  });
}

export function matchTcxRuns(imported: Run[], existing: Run[]): {
  ready: Run[];
  matches: TcxMatch[];
  ambiguous: number;
} {
  const existingIds = new Set(existing.map((run) => run.id));
  const candidates = imported.map((incoming) => {
    if (incoming.source !== "TCX" || existingIds.has(incoming.id)) return [];
    return existing.filter((run) =>
      run.id.startsWith("health-export:") &&
      Math.abs(Date.parse(run.date) - Date.parse(incoming.date)) <= 300_000 &&
      Math.abs(run.distanceKm - incoming.distanceKm) <= Math.max(0.2, run.distanceKm * 0.1) &&
      Math.abs(run.durationSeconds - incoming.durationSeconds) <= Math.max(120, run.durationSeconds * 0.1),
    );
  });
  const useCounts = new Map<string, number>();
  for (const options of candidates) {
    for (const run of options) useCounts.set(run.id, (useCounts.get(run.id) ?? 0) + 1);
  }
  const ready: Run[] = [];
  const matches: TcxMatch[] = [];
  let ambiguous = 0;
  imported.forEach((incoming, index) => {
    const options = candidates[index];
    if (!options.length) ready.push(incoming);
    else if (options.length === 1 && useCounts.get(options[0].id) === 1) {
      matches.push({ incoming, existing: options[0] });
    } else {
      ambiguous += 1;
    }
  });
  return { ready, matches, ambiguous };
}

export function prepareTcxImport(imported: Run[], existing: Run[]): {
  ready: Run[];
  skipped: number;
} {
  const existingIds = new Set(existing.map((run) => run.id));
  const legacyTcxByTime = new Map<number, Run[]>();
  for (const run of existing) {
    if (run.source !== "TCX" || !run.id.startsWith("health-export:")) continue;
    const time = Date.parse(run.date);
    const matches = legacyTcxByTime.get(time) ?? [];
    matches.push(run);
    legacyTcxByTime.set(time, matches);
  }

  const reconciled: Run[] = [];
  let ambiguousLegacy = 0;
  for (const incoming of imported) {
    if (existingIds.has(incoming.id)) {
      reconciled.push(incoming);
      continue;
    }
    const matches = legacyTcxByTime.get(Date.parse(incoming.date)) ?? [];
    if (matches.length > 1) {
      ambiguousLegacy += 1;
    } else if (matches.length === 1) {
      reconciled.push({ ...incoming, id: matches[0].id, title: matches[0].title });
    } else {
      reconciled.push(incoming);
    }
  }

  const result = matchTcxRuns(reconciled, existing);
  return { ready: result.ready, skipped: ambiguousLegacy + result.ambiguous + result.matches.length };
}

const STORAGE_KEY = "bezecky-denik-runs-v1";
let cachedRaw: string | null | undefined;
let cachedSnapshot: RunStoreSnapshot;

export const SAMPLE_RUNS: Run[] = [
  {
    id: "sample-1",
    title: "Ranní běh v parku",
    date: "2026-11-18T07:12:00.000Z",
    distanceKm: 6.42,
    durationSeconds: 2166,
    averagePaceSecondsPerKm: 337,
    averageHeartRate: 148,
    maxHeartRate: 169,
    elevationM: 38,
    source: "Ukázkový běh",
    track: [
      { km: 0, paceSecondsPerKm: 354, heartRate: 118, elevationM: 241 },
      { km: 0.8, paceSecondsPerKm: 342, heartRate: 136, elevationM: 244 },
      { km: 1.6, paceSecondsPerKm: 334, heartRate: 145, elevationM: 248 },
      { km: 2.4, paceSecondsPerKm: 330, heartRate: 151, elevationM: 253 },
      { km: 3.2, paceSecondsPerKm: 340, heartRate: 149, elevationM: 251 },
      { km: 4, paceSecondsPerKm: 332, heartRate: 155, elevationM: 256 },
      { km: 4.8, paceSecondsPerKm: 329, heartRate: 158, elevationM: 258 },
      { km: 5.6, paceSecondsPerKm: 336, heartRate: 161, elevationM: 260 },
      { km: 6.42, paceSecondsPerKm: 338, heartRate: 158, elevationM: 279 },
    ],
  },
  {
    id: "sample-2",
    title: "Podél řeky",
    date: "2026-11-15T08:30:00.000Z",
    distanceKm: 8.15,
    durationSeconds: 2869,
    averagePaceSecondsPerKm: 352,
    averageHeartRate: 143,
    maxHeartRate: 161,
    elevationM: 24,
    source: "Ukázkový běh",
    track: [
      { km: 0, paceSecondsPerKm: 365, heartRate: 116, elevationM: 228 },
      { km: 1, paceSecondsPerKm: 358, heartRate: 134, elevationM: 230 },
      { km: 2, paceSecondsPerKm: 348, heartRate: 140, elevationM: 231 },
      { km: 3, paceSecondsPerKm: 351, heartRate: 145, elevationM: 232 },
      { km: 4, paceSecondsPerKm: 355, heartRate: 147, elevationM: 229 },
      { km: 5, paceSecondsPerKm: 346, heartRate: 149, elevationM: 230 },
      { km: 6, paceSecondsPerKm: 349, heartRate: 152, elevationM: 232 },
      { km: 7, paceSecondsPerKm: 346, heartRate: 154, elevationM: 238 },
      { km: 8.15, paceSecondsPerKm: 351, heartRate: 151, elevationM: 252 },
    ],
  },
  {
    id: "sample-3",
    title: "Lehký výklus",
    date: "2026-11-12T16:45:00.000Z",
    distanceKm: 4.86,
    durationSeconds: 1807,
    averagePaceSecondsPerKm: 372,
    averageHeartRate: 137,
    maxHeartRate: 153,
    elevationM: 31,
    source: "Ukázkový běh",
    track: [
      { km: 0, paceSecondsPerKm: 388, heartRate: 110, elevationM: 246 },
      { km: 0.6, paceSecondsPerKm: 378, heartRate: 126, elevationM: 250 },
      { km: 1.2, paceSecondsPerKm: 365, heartRate: 133, elevationM: 251 },
      { km: 1.8, paceSecondsPerKm: 370, heartRate: 135, elevationM: 253 },
      { km: 2.4, paceSecondsPerKm: 375, heartRate: 139, elevationM: 254 },
      { km: 3, paceSecondsPerKm: 369, heartRate: 141, elevationM: 259 },
      { km: 3.6, paceSecondsPerKm: 371, heartRate: 143, elevationM: 261 },
      { km: 4.2, paceSecondsPerKm: 365, heartRate: 145, elevationM: 265 },
      { km: 4.86, paceSecondsPerKm: 374, heartRate: 140, elevationM: 277 },
    ],
  },
  {
    id: "sample-4",
    title: "Tempový trénink",
    date: "2026-11-09T06:55:00.000Z",
    distanceKm: 7.24,
    durationSeconds: 2353,
    averagePaceSecondsPerKm: 325,
    averageHeartRate: 159,
    maxHeartRate: 178,
    elevationM: 45,
    source: "Ukázkový běh",
    track: [
      { km: 0, paceSecondsPerKm: 374, heartRate: 121, elevationM: 245 },
      { km: 0.9, paceSecondsPerKm: 349, heartRate: 143, elevationM: 250 },
      { km: 1.8, paceSecondsPerKm: 320, heartRate: 156, elevationM: 256 },
      { km: 2.7, paceSecondsPerKm: 316, heartRate: 164, elevationM: 259 },
      { km: 3.6, paceSecondsPerKm: 312, heartRate: 168, elevationM: 262 },
      { km: 4.5, paceSecondsPerKm: 319, heartRate: 171, elevationM: 265 },
      { km: 5.4, paceSecondsPerKm: 315, heartRate: 174, elevationM: 270 },
      { km: 6.3, paceSecondsPerKm: 323, heartRate: 170, elevationM: 277 },
      { km: 7.24, paceSecondsPerKm: 328, heartRate: 165, elevationM: 290 },
    ],
  },
  {
    id: "sample-5",
    title: "Nedělní dlouhý běh",
    date: "2026-11-02T09:05:00.000Z",
    distanceKm: 11.3,
    durationSeconds: 4146,
    averagePaceSecondsPerKm: 367,
    averageHeartRate: 146,
    maxHeartRate: 165,
    elevationM: 86,
    source: "Ukázkový běh",
    track: [
      { km: 0, paceSecondsPerKm: 381, heartRate: 113, elevationM: 231 },
      { km: 1.4, paceSecondsPerKm: 372, heartRate: 136, elevationM: 238 },
      { km: 2.8, paceSecondsPerKm: 366, heartRate: 141, elevationM: 244 },
      { km: 4.2, paceSecondsPerKm: 368, heartRate: 145, elevationM: 250 },
      { km: 5.6, paceSecondsPerKm: 361, heartRate: 147, elevationM: 255 },
      { km: 7, paceSecondsPerKm: 370, heartRate: 150, elevationM: 264 },
      { km: 8.4, paceSecondsPerKm: 365, heartRate: 153, elevationM: 276 },
      { km: 9.8, paceSecondsPerKm: 367, heartRate: 155, elevationM: 292 },
      { km: 11.3, paceSecondsPerKm: 369, heartRate: 154, elevationM: 317 },
    ],
  },
];

const DEFAULT_SNAPSHOT: RunStoreSnapshot = { runs: SAMPLE_RUNS, error: "" };
cachedSnapshot = DEFAULT_SNAPSHOT;

export function isRun(value: unknown): value is Run {
  if (!value || typeof value !== "object") return false;
  const run = value as Partial<Run>;
  return (
    typeof run.id === "string" &&
    typeof run.title === "string" &&
    typeof run.date === "string" &&
    Number.isFinite(run.distanceKm) &&
    Number.isFinite(run.durationSeconds) &&
    Number.isFinite(run.averagePaceSecondsPerKm) &&
    Array.isArray(run.track)
  );
}

export function subscribeToRuns(callback: () => void): () => void {
  const onChange = () => callback();
  window.addEventListener("storage", onChange);
  window.addEventListener("bezecky-denik-runs-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("bezecky-denik-runs-change", onChange);
  };
}

export function getRunsSnapshot(): RunStoreSnapshot {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Přístup k úložišti byl zamítnut.";
    const key = `storage-error:${message}`;
    if (cachedRaw !== key) {
      cachedRaw = key;
      cachedSnapshot = { ...cachedSnapshot, error: `Běhy se nepodařilo načíst: ${message}` };
    }
    return cachedSnapshot;
  }

  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  if (raw === null) {
    cachedSnapshot = DEFAULT_SNAPSHOT;
    return cachedSnapshot;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isRun)) {
      throw new Error("Uložená data běhů mají neplatný formát.");
    }
    cachedSnapshot = { runs: parsed, error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Uložená data běhů nelze načíst.";
    cachedSnapshot = { runs: SAMPLE_RUNS, error: `Běhy se nepodařilo načíst: ${message}` };
  }
  return cachedSnapshot;
}

export function getServerRunsSnapshot(): RunStoreSnapshot {
  return DEFAULT_SNAPSHOT;
}

export function saveRuns(runs: Run[]): string | undefined {
  const raw = JSON.stringify(runs);
  let errorMessage: string | undefined;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Přístup k úložišti byl zamítnut.";
  }
  cachedRaw = raw;
  cachedSnapshot = {
    runs,
    error: errorMessage ? `Změny se nepodařilo uložit: ${errorMessage}` : "",
  };
  window.dispatchEvent(new Event("bezecky-denik-runs-change"));
  return cachedSnapshot.error || undefined;
}

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

function parseCsvRows(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].sort(
    (a, b) => firstLine.split(b).length - firstLine.split(a).length,
  )[0];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function numericValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function durationValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const text = value.trim();
  if (text.includes(":")) {
    const parts = text.split(":").map(Number);
    if (parts.some((part) => !Number.isFinite(part))) return undefined;
    return parts.reduce((total, part) => total * 60 + part, 0);
  }
  return numericValue(text);
}

function validRun(run: Run): Run {
  if (!Number.isFinite(run.distanceKm) || run.distanceKm <= 0) {
    throw new Error("V souboru chybí platná vzdálenost běhu.");
  }
  if (!Number.isFinite(run.durationSeconds) || run.durationSeconds <= 0) {
    throw new Error("V souboru chybí platná doba běhu.");
  }
  if (!Number.isFinite(run.averagePaceSecondsPerKm) || run.averagePaceSecondsPerKm <= 0) {
    throw new Error("Z importovaných údajů nelze určit tempo běhu.");
  }
  return run;
}

function parseZonedDateTime(value: string, timeZone: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match || !timeZone) throw new Error("Chybí platný čas začátku nebo časové pásmo.");
  const [, year, month, day, hour, minute, second = "0"] = match;
  const parts = [year, month, day, hour, minute, second].map(Number);
  const [y, m, d, h, min, s] = parts;
  const localMillis = Date.UTC(y, m - 1, d, h, min, s);
  const localDate = new Date(localMillis);
  if (
    localDate.getUTCFullYear() !== y || localDate.getUTCMonth() !== m - 1 ||
    localDate.getUTCDate() !== d || localDate.getUTCHours() !== h ||
    localDate.getUTCMinutes() !== min || localDate.getUTCSeconds() !== s
  ) {
    throw new Error("Čas začátku není platné datum.");
  }

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    });
  } catch (error) {
    if (error instanceof RangeError) throw new Error("Časové pásmo není platné.");
    throw error;
  }
  const localParts = (timestamp: number) => {
    const formatted = formatter.formatToParts(timestamp);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(formatted.find((part) => part.type === type)?.value);
    return [get("year"), get("month"), get("day"), get("hour"), get("minute"), get("second")];
  };
  const offsets = [-48, 0, 48].map((hours) => {
    const timestamp = localMillis + hours * 3_600_000;
    const [fy, fm, fd, fh, fmin, fs] = localParts(timestamp);
    return Date.UTC(fy, fm - 1, fd, fh, fmin, fs) - timestamp;
  });
  const candidates = [...new Set(offsets.map((offset) => localMillis - offset))]
    .filter((timestamp) => localParts(timestamp).every((part, index) => part === parts[index]));
  if (candidates.length !== 1) {
    throw new Error("Čas začátku nelze jednoznačně určit v uvedeném časovém pásmu.");
  }
  return new Date(candidates[0]).toISOString();
}

async function healthExportId(source: string, date: string, title: string): Promise<string> {
  const input = JSON.stringify([source, date, title]);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `health-export:${hash}`;
}

async function parseHealthExport(rows: string[][]): Promise<RunImportResult> {
  const headers = rows[0].map(normalizeHeader);
  const column = (name: string) => headers.indexOf(normalizeHeader(name));
  const indexes = {
    name: column("Exercise Name"),
    start: column("Start Date/Time"),
    timezone: column("Timezone"),
    source: column("Source(s)"),
    duration: column("Duration (min)"),
    distance: column("Exercise Distance (m)"),
  };
  if (Object.values(indexes).some((index) => index < 0)) {
    throw new Error("Export Health Data Export neobsahuje všechny potřebné sloupce aktivit.");
  }

  const runs: Run[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  let unknownActivities = 0;
  for (const [index, row] of rows.slice(1).entries()) {
    const title = row[indexes.name]?.trim() ?? "";
    if (!title) continue;
    const type = /^(\d+)\s*-\s*/.exec(title)?.[1];
    const isRunning = type
      ? type === "56" || type === "57"
      : /(?:^|[^\p{L}])(?:běh|běžecký|running|run)(?=$|[^\p{L}])/iu.test(title);
    if (!isRunning) {
      if (!type && !/\bwalking\b/i.test(title) && !/chůze/i.test(title)) unknownActivities += 1;
      continue;
    }

    try {
      const date = parseZonedDateTime(row[indexes.start] ?? "", row[indexes.timezone] ?? "");
      const source = row[indexes.source]?.trim();
      if (!source) throw new Error("Chybí zdroj aktivity.");
      const durationMinutes = numericValue(row[indexes.duration]);
      const distanceMeters = numericValue(row[indexes.distance]);
      const durationSeconds = (durationMinutes ?? 0) * 60;
      const distanceKm = (distanceMeters ?? 0) / 1000;
      const id = await healthExportId(source, date, title);
      if (ids.has(id)) throw new Error("Dva běhy mají stejný zdroj, čas a název.");
      const run = validRun({
        id,
        title: title.replace(/^(56|57)\s*-\s*/i, "") || "Běh",
        date,
        distanceKm,
        durationSeconds,
        averagePaceSecondsPerKm: durationSeconds / distanceKm,
        source: "Health Connect",
        track: [],
      });
      ids.add(id);
      runs.push(run);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Neznámá chyba.";
      warnings.push(`Řádek ${index + 2}: ${message}`);
    }
  }
  if (unknownActivities) {
    warnings.push(`${unknownActivities} aktivit s nerozpoznaným názvem nebylo zahrnuto.`);
  }
  if (!runs.length && !warnings.length) {
    throw new Error("V exportu nebyl nalezen žádný rozpoznaný běh.");
  }
  return { runs, warnings };
}

function parseCsv(text: string, fileName: string): Run {
  const rows = parseCsvRows(text);
  if (rows.length < 2) {
    throw new Error("CSV musí obsahovat hlavičku a alespoň jeden řádek dat.");
  }

  const headers = rows[0].map(normalizeHeader);
  const column = (...names: string[]) =>
    headers.findIndex((header) => names.map(normalizeHeader).includes(header));
  const value = (row: string[], ...names: string[]) => {
    const index = column(...names);
    return index < 0 ? undefined : row[index];
  };
  const nameColumn = column("name", "title", "activity", "nazev", "trening");
  const dateColumn = column("date", "datetime", "starttime", "startdate", "datum", "cas");
  const distanceKmColumn = column("distancekm", "vzdalenostkm", "km");
  const distanceColumn = column("distance", "distance_m", "vzdalenost", "vzdalenostm");
  const durationColumn = column("duration", "durationseconds", "elapsedtime", "time", "trvani", "casbeh");
  const paceColumn = column("pace", "pace_seconds_per_km", "tempominutnakm", "avgpace", "tempo");
  const heartRateColumn = column("heartrate", "averageheartrate", "avgheartrate", "avghr", "hr", "tep");
  const maxHeartRateColumn = column("maxheartrate", "maxhr");
  const elevationColumn = column("elevation", "elevationgain", "ascent", "prevyseni", "prevyseni");
  const recordDistanceColumn = column("distance", "distancem", "distance_km", "distancekm", "km");
  const recordHeartColumn = column("heartrate", "hr", "tep");
  const recordAltitudeColumn = column("altitude", "elevation", "altitude_m", "elevationm", "vyska");
  const recordPaceColumn = column("pace", "pace_seconds_per_km", "avgpace", "tempo");
  const track: TrackPoint[] = [];
  const values = rows.slice(1).map((row) => ({
    row,
    distance: numericValue(row[recordDistanceColumn]),
    heartRate: numericValue(row[recordHeartColumn]),
    elevation: numericValue(row[recordAltitudeColumn]),
    pace: durationValue(row[recordPaceColumn]),
  }));
  const hasTrack = values.filter(
    (item) => item.distance !== undefined || item.heartRate !== undefined || item.elevation !== undefined,
  ).length > 1;

  if (hasTrack) {
    const maxDistance = Math.max(...values.map((item) => item.distance ?? 0));
    const distanceIsKm =
      recordDistanceColumn >= 0 &&
      (headers[recordDistanceColumn].includes("km") || maxDistance < 100);
    values.forEach((item) => {
      if (item.distance === undefined && item.heartRate === undefined && item.elevation === undefined) return;
      track.push({
        km: item.distance === undefined ? 0 : distanceIsKm ? item.distance : item.distance / 1000,
        paceSecondsPerKm: item.pace,
        heartRate: item.heartRate,
        elevationM: item.elevation,
      });
    });
    const distanceKm = distanceIsKm ? maxDistance : maxDistance / 1000;
    const timeValues = rows.slice(1).map((row) => durationValue(row[durationColumn]));
    const trackDuration = timeValues.length > 1 && timeValues.every((time) => time !== undefined)
      ? Math.max(...(timeValues as number[])) - Math.min(...(timeValues as number[]))
      : undefined;
    const durationSeconds =
      durationValue(value(rows[1], "duration", "durationseconds", "elapsedtime", "time", "trvani", "casbeh")) ??
      trackDuration ??
      0;
    const heartRates = track.flatMap((point) => point.heartRate ? [point.heartRate] : []);
    const elevations = track.flatMap((point) => point.elevationM ? [point.elevationM] : []);
    const date = value(rows[1], "date", "datetime", "starttime", "startdate", "datum", "cas");
    return validRun({
      id: crypto.randomUUID(),
      title: (nameColumn >= 0 ? rows[1][nameColumn] : "") || fileName.replace(/\.csv$/i, ""),
      date: date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : new Date().toISOString(),
      distanceKm,
      durationSeconds,
      averagePaceSecondsPerKm: durationSeconds / distanceKm,
      averageHeartRate: heartRates.length
        ? Math.round(heartRates.reduce((sum, heartRate) => sum + heartRate, 0) / heartRates.length)
        : undefined,
      maxHeartRate: heartRates.length ? Math.max(...heartRates) : undefined,
      elevationM: elevations.length ? Math.max(...elevations) - Math.min(...elevations) : undefined,
      source: "CSV",
      track,
    });
  }

  const row = rows[1];
  const rawDistance =
    numericValue(row[distanceKmColumn]) ??
    numericValue(row[distanceColumn]);
  const distanceKm = rawDistance === undefined
    ? 0
    : distanceKmColumn >= 0 || rawDistance < 100
      ? rawDistance
      : rawDistance / 1000;
  const durationSeconds = durationValue(row[durationColumn]) ?? 0;
  const rawPace = numericValue(row[paceColumn]);
  const averagePaceSecondsPerKm =
    rawPace === undefined ? durationSeconds / distanceKm : rawPace < 30 ? rawPace * 60 : rawPace;
  const rawHeartRate = numericValue(row[heartRateColumn]);

  return validRun({
    id: crypto.randomUUID(),
    title: (nameColumn >= 0 ? row[nameColumn] : "") || fileName.replace(/\.csv$/i, ""),
    date: row[dateColumn] && !Number.isNaN(Date.parse(row[dateColumn]))
      ? new Date(row[dateColumn]).toISOString()
      : new Date().toISOString(),
    distanceKm,
    durationSeconds: durationSeconds || averagePaceSecondsPerKm * distanceKm,
    averagePaceSecondsPerKm,
    averageHeartRate: rawHeartRate,
    maxHeartRate: numericValue(row[maxHeartRateColumn]) ?? rawHeartRate,
    elevationM: numericValue(row[elevationColumn]),
    source: "CSV",
    track: [],
  });
}

function haversineDistance(
  a: Pick<TrackPoint, "latitude" | "longitude">,
  b: Pick<TrackPoint, "latitude" | "longitude">,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians((b.latitude ?? 0) - (a.latitude ?? 0));
  const longitudeDelta = radians((b.longitude ?? 0) - (a.longitude ?? 0));
  const latitudeA = radians(a.latitude ?? 0);
  const latitudeB = radians(b.latitude ?? 0);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function tcxChild(element: Element, name: string): Element | undefined {
  return Array.from(element.childNodes).find(
    (node): node is Element => node instanceof Element && node.localName === name,
  );
}

function tcxNumber(element: Element, name: string): number | undefined {
  const text = tcxChild(element, name)?.textContent?.trim();
  return text ? numericValue(text) : undefined;
}

async function tcxId(date: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Import TCX vyžaduje zabezpečené připojení HTTPS nebo localhost.");
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(date));
  return `tcx:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function tcxTimestamp(value: string | null | undefined): number {
  const text = value?.trim() ?? "";
  return /T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(text) ? Date.parse(text) : NaN;
}

type TcxTrackPoint = TrackPoint & { time: number; distance: number };

function interpolateSparseTcxDistances(points: TcxTrackPoint[]): boolean {
  const intervals: { start: number; end: number }[] = [];
  let start = 0;
  for (let end = 1; end < points.length; end += 1) {
    if (points[end].distance - points[start].distance < 1) continue;
    const interval = points.slice(start, end + 1);
    const positions = interval.filter((point) => point.latitude !== undefined && point.longitude !== undefined);
    if (
      end > start + 1 &&
      points[end].time - points[start].time >= 5_000 &&
      points[end].distance - points[start].distance >= 20 &&
      positions.length > 1 &&
      haversineDistance(positions[0], positions[positions.length - 1]) >= 0.02
    ) {
      intervals.push({ start, end });
    }
    start = end;
  }
  if (intervals.length < 2) return false;

  for (const { start, end } of intervals) {
    const first = points[start];
    const last = points[end];
    for (let index = start + 1; index < end; index += 1) {
      const fraction = (points[index].time - first.time) / (last.time - first.time);
      points[index].distance = first.distance + fraction * (last.distance - first.distance);
      points[index].km = points[index].distance / 1000;
    }
  }
  return true;
}

function tcxTrack(laps: Element[], totalMeters: number): { track: TrackPoint[]; estimated: boolean } {
  const records: TcxTrackPoint[] = [];
  let previous: { distance: number; time: number } | undefined;
  let distanceOffset = 0;

  for (const lap of laps) {
    const points = Array.from(lap.getElementsByTagNameNS("*", "Trackpoint"));
    let firstInLap = true;
    for (const point of points) {
      const rawDistance = tcxNumber(point, "DistanceMeters");
      const time = tcxTimestamp(tcxChild(point, "Time")?.textContent);
      if (rawDistance === undefined || rawDistance < 0 || !Number.isFinite(time)) {
        throw new Error("Bod trasy neobsahuje platný čas a vzdálenost.");
      }
      if (firstInLap && previous && rawDistance + distanceOffset < previous.distance) {
        distanceOffset = previous.distance;
      }
      firstInLap = false;
      const current = { distance: rawDistance + distanceOffset, time };
      if (
        !Number.isFinite(current.distance) ||
        current.distance > totalMeters * 1.1 + 100 ||
        (previous && (current.distance < previous.distance || current.time <= previous.time))
      ) {
        throw new Error("Čas nebo vzdálenost bodů trasy nejsou ve správném pořadí.");
      }

      const position = tcxChild(point, "Position");
      const latitude = position ? tcxNumber(position, "LatitudeDegrees") : undefined;
      const longitude = position ? tcxNumber(position, "LongitudeDegrees") : undefined;
      const elevationM = tcxNumber(point, "AltitudeMeters");
      const heartElement = tcxChild(point, "HeartRateBpm");
      const heartRate = heartElement ? tcxNumber(heartElement, "Value") : undefined;
      if (heartElement && (heartRate === undefined || heartRate <= 0)) {
        throw new Error("Bod trasy obsahuje neplatný tep.");
      }
      if (position && (
        latitude === undefined || longitude === undefined ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180
      )) {
        throw new Error("Bod trasy obsahuje neplatné GPS souřadnice.");
      }
      records.push({ km: current.distance / 1000, ...current, latitude, longitude, elevationM, heartRate });
      previous = current;
    }
  }

  const estimated = interpolateSparseTcxDistances(records);
  const positions: TrackPoint[] = records.flatMap(({ km, latitude, longitude, elevationM, heartRate }) =>
    latitude !== undefined || longitude !== undefined || elevationM !== undefined || heartRate !== undefined
      ? [{ km, latitude, longitude, elevationM, heartRate }]
      : [],
  );
  const pace: TrackPoint[] = [];
  const segmentMeters = Math.max(estimated ? 500 : 100, totalMeters / 5000);
  let movingIntervals = 0;
  let anchor: { distance: number; time: number } | undefined;
  previous = undefined;
  for (const current of records) {
    anchor ??= current;
    if (previous && current.distance > previous.distance) {
      movingIntervals += 1;
      while (current.distance >= anchor.distance + segmentMeters) {
        const endDistance: number = anchor.distance + segmentMeters;
        const fraction = (endDistance - previous.distance) / (current.distance - previous.distance);
        const endTime = previous.time + fraction * (current.time - previous.time);
        pace.push({
          km: (anchor.distance + endDistance) / 2000,
          paceSecondsPerKm: (endTime - anchor.time) / 1000 / (segmentMeters / 1000),
        });
        anchor = { distance: endDistance, time: endTime };
      }
    }
    previous = current;
  }

  return { track: [...positions, ...(movingIntervals > 1 ? pace : [])].sort((a, b) => a.km - b.km), estimated };
}

async function parseTcx(text: string): Promise<RunImportResult> {
  const xml = new DOMParser().parseFromString(text, "application/xml");
  if (xml.getElementsByTagName("parsererror").length) {
    throw new Error("Soubor TCX není platné XML.");
  }
  const activities = Array.from(xml.getElementsByTagNameNS("*", "Activity"));
  if (!activities.length) throw new Error("Soubor TCX neobsahuje žádné aktivity.");
  const runs: Run[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();

  for (const [index, activity] of activities.entries()) {
    if (activity.getAttribute("Sport") !== "Running") continue;
    try {
      const time = tcxTimestamp(tcxChild(activity, "Id")?.textContent);
      if (!Number.isFinite(time)) throw new Error("Chybí platný čas začátku běhu.");
      const date = new Date(time).toISOString();
      const laps = Array.from(activity.childNodes).filter(
        (node): node is Element => node instanceof Element && node.localName === "Lap",
      );
      if (!laps.length) throw new Error("Běh neobsahuje žádná kola.");
      const distances = laps.map((lap) => tcxNumber(lap, "DistanceMeters"));
      const durations = laps.map((lap) => tcxNumber(lap, "TotalTimeSeconds"));
      if (
        distances.some((value) => value === undefined || value < 0) ||
        durations.some((value) => value === undefined || value <= 0)
      ) {
        throw new Error("Běhu chybí platná vzdálenost nebo doba.");
      }
      const distanceKm = distances.reduce<number>((sum, value) => sum + (value ?? 0), 0) / 1000;
      const durationSeconds = durations.reduce<number>((sum, value) => sum + (value ?? 0), 0);
      if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 10_000) {
        throw new Error("Běhu chybí platná vzdálenost.");
      }
      const id = await tcxId(date);
      if (ids.has(id)) throw new Error("Více běhů má stejný identifikátor.");
      const { track, estimated } = tcxTrack(laps, distanceKm * 1000);
      const heartRates = track.flatMap((point) => point.heartRate === undefined ? [] : [point.heartRate]);
      const run = validRun({
        id,
        title: `Běh ${new Date(date).toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" })}`,
        date,
        distanceKm,
        durationSeconds,
        averagePaceSecondsPerKm: durationSeconds / distanceKm,
        averageHeartRate: heartRates.length
          ? Math.round(heartRates.reduce((sum, value) => sum + value, 0) / heartRates.length)
          : undefined,
        maxHeartRate: heartRates.length ? Math.max(...heartRates) : undefined,
        source: "TCX",
        track,
        estimatedTrack: estimated,
      });
      ids.add(id);
      runs.push(run);
    } catch (error) {
      warnings.push(`Aktivita ${index + 1}: ${error instanceof Error ? error.message : "Běh se nepodařilo načíst."}`);
    }
  }
  return { runs, warnings };
}

async function parseGpx(text: string, fileName: string): Promise<Run> {
  const xml = new DOMParser().parseFromString(text, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Soubor GPX není platné XML.");

  const points = Array.from(xml.getElementsByTagNameNS("*", "trkpt"));
  if (points.length < 2) throw new Error("GPX neobsahuje dostatek bodů běžecké trasy.");

  let distanceKm = 0;
  const firstTime = points[0].getElementsByTagNameNS("*", "time")[0]?.textContent ?? undefined;
  const lastTime = points.at(-1)?.getElementsByTagNameNS("*", "time")[0]?.textContent ?? undefined;
  const track: TrackPoint[] = points.map((point, index) => {
    const previous = points[index - 1];
    const latitude = Number(point.getAttribute("lat"));
    const longitude = Number(point.getAttribute("lon"));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("GPX obsahuje neplatné GPS souřadnice.");
    }
    let segmentDistance = 0;
    if (previous) {
      segmentDistance = haversineDistance(
        {
          latitude: Number(previous.getAttribute("lat")),
          longitude: Number(previous.getAttribute("lon")),
        },
        { latitude, longitude },
      );
      distanceKm += segmentDistance;
    }
    const time = point.getElementsByTagNameNS("*", "time")[0]?.textContent;
    const previousTime = previous?.getElementsByTagNameNS("*", "time")[0]?.textContent;
    const elapsed = time && previousTime
      ? (Date.parse(time) - Date.parse(previousTime)) / 1000
      : 0;
    const elevationText = point.getElementsByTagNameNS("*", "ele")[0]?.textContent;
    const heartText = Array.from(point.getElementsByTagNameNS("*", "hr"))[0]?.textContent;
    const elevation = elevationText ? Number(elevationText) : undefined;
    const heartRate = heartText ? Number(heartText) : undefined;
    return {
      km: distanceKm,
      paceSecondsPerKm:
        elapsed > 0 && segmentDistance > 0 ? elapsed / segmentDistance : undefined,
      latitude,
      longitude,
      elevationM: Number.isFinite(elevation) ? elevation : undefined,
      heartRate: Number.isFinite(heartRate) ? heartRate : undefined,
    };
  });

  const durationSeconds =
    firstTime && lastTime
      ? (Date.parse(lastTime) - Date.parse(firstTime)) / 1000
      : 0;
  const heartRates = track.flatMap((point) => point.heartRate ? [point.heartRate] : []);
  const elevations = track.flatMap((point) => point.elevationM !== undefined ? [point.elevationM] : []);
  const title = xml.getElementsByTagNameNS("*", "name")[0]?.textContent?.trim();
  return validRun({
    id: crypto.randomUUID(),
    title: title || fileName.replace(/\.gpx$/i, ""),
    date: firstTime && !Number.isNaN(Date.parse(firstTime)) ? new Date(firstTime).toISOString() : new Date().toISOString(),
    distanceKm,
    durationSeconds,
    averagePaceSecondsPerKm: durationSeconds / distanceKm,
    averageHeartRate: heartRates.length
      ? Math.round(heartRates.reduce((sum, heartRate) => sum + heartRate, 0) / heartRates.length)
      : undefined,
    maxHeartRate: heartRates.length ? Math.max(...heartRates) : undefined,
    elevationM: elevations.length ? Math.max(...elevations) - Math.min(...elevations) : undefined,
    source: "GPX",
    track,
  });
}

async function parseFit(file: File): Promise<Run> {
  const { default: FitParser } = await import("fit-file-parser");
  const data = await new FitParser({
    force: false,
    mode: "list",
    elapsedRecordField: true,
    lengthUnit: "m",
    speedUnit: "m/s",
  }).parseAsync(await file.arrayBuffer());
  const session = data.sessions?.[0];
  if (!session) throw new Error("FIT soubor neobsahuje souhrn aktivity.");
  if (session.sport && session.sport !== "running") {
    throw new Error("Tento FIT soubor není označený jako běh.");
  }

  const records = data.records ?? [];
  let distanceFromGps = 0;
  const track: TrackPoint[] = records.map((record, index) => {
    const previous = records[index - 1];
    if (record.distance !== undefined) {
      distanceFromGps = record.distance;
    } else if (
      previous?.position_lat !== undefined &&
      previous.position_long !== undefined &&
      record.position_lat !== undefined &&
      record.position_long !== undefined
    ) {
      distanceFromGps +=
        haversineDistance(
          { latitude: previous.position_lat, longitude: previous.position_long },
          { latitude: record.position_lat, longitude: record.position_long },
        ) * 1000;
    }
    return {
      km: distanceFromGps / 1000,
      paceSecondsPerKm: record.speed && record.speed > 0 ? 1000 / record.speed : undefined,
      heartRate: record.heart_rate,
      elevationM: record.altitude,
      latitude: record.position_lat,
      longitude: record.position_long,
    };
  });
  const recordDistance = records.at(-1)?.distance ?? distanceFromGps;
  const distanceKm = (session.total_distance ?? recordDistance) / 1000;
  const firstRecordTime = records[0]?.timestamp?.getTime();
  const lastRecordTime = records.at(-1)?.timestamp?.getTime();
  const recordDuration =
    firstRecordTime !== undefined && lastRecordTime !== undefined
      ? (lastRecordTime - firstRecordTime) / 1000
      : 0;
  const durationSeconds =
    session.total_timer_time ?? session.total_elapsed_time ?? recordDuration;
  const date = session.start_time?.toISOString() ?? new Date().toISOString();
  const heartRates = records.flatMap((record) =>
    record.heart_rate === undefined ? [] : [record.heart_rate],
  );
  const altitudes = records.flatMap((record) =>
    record.altitude === undefined ? [] : [record.altitude],
  );
  return validRun({
    id: crypto.randomUUID(),
    title: `Běh ${new Date(date).toLocaleDateString("cs-CZ")}`,
    date,
    distanceKm,
    durationSeconds,
    averagePaceSecondsPerKm: session.avg_speed && session.avg_speed > 0
      ? 1000 / session.avg_speed
      : durationSeconds / distanceKm,
    averageHeartRate: session.avg_heart_rate ??
      (heartRates.length ? Math.round(heartRates.reduce((sum, heartRate) => sum + heartRate, 0) / heartRates.length) : undefined),
    maxHeartRate: session.max_heart_rate ?? (heartRates.length ? Math.max(...heartRates) : undefined),
    elevationM: session.total_ascent ??
      (altitudes.length ? Math.max(...altitudes) - Math.min(...altitudes) : undefined),
    source: "FIT",
    track,
  });
}

export async function importRuns(file: File): Promise<RunImportResult> {
  const extension = file.name.split(".").at(-1)?.toLowerCase();
  if (extension === "fit") return { runs: [await parseFit(file)], warnings: [] };
  if (extension === "gpx") return { runs: [await parseGpx(await file.text(), file.name)], warnings: [] };
  if (extension === "tcx") return parseTcx(await file.text());
  if (extension === "csv") {
    const text = await file.text();
    const rows = parseCsvRows(text);
    const headers = rows[0]?.map(normalizeHeader) ?? [];
    if (headers.includes("exercisename") && headers.includes("exercisedistancem")) {
      return parseHealthExport(rows);
    }
    return { runs: [parseCsv(text, file.name)], warnings: [] };
  }
  throw new Error("Nepodporovaný formát. Vyber soubor GPX, CSV, FIT nebo TCX.");
}
