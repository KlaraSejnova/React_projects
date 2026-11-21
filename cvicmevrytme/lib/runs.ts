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
  source: "Ukázkový běh" | "CSV" | "GPX" | "FIT" | "TCX";
  track: TrackPoint[];
  estimatedTrack?: boolean;
};

export type RunImportResult = {
  runs: Run[];
  warnings: string[];
};

export function isLongRun(run: Run): boolean {
  return run.distanceKm > 3;
}

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
  if (extension === "csv") return { runs: [parseCsv(await file.text(), file.name)], warnings: [] };
  throw new Error("Nepodporovaný formát. Vyber soubor GPX, CSV, FIT nebo TCX.");
}
