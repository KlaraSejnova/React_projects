import demoRunData from "./demo-runs-data.json" with { type: "json" };
import type { Run, TrackPoint } from "./runs";

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function decodeTrackPoint(value: unknown): TrackPoint {
  if (
    !Array.isArray(value) ||
    value.length !== 5 ||
    typeof value[0] !== "number" ||
    !isNullableNumber(value[1]) ||
    !isNullableNumber(value[2]) ||
    !isNullableNumber(value[3]) ||
    !isNullableNumber(value[4]) ||
    (value[3] === null) !== (value[4] === null)
  ) {
    throw new Error("Ukázková data obsahují neplatný bod trasy.");
  }

  const [km, paceSecondsPerKm, elevationM, latitude, longitude] = value;
  return {
    km,
    ...(paceSecondsPerKm === null ? {} : { paceSecondsPerKm }),
    ...(elevationM === null ? {} : { elevationM }),
    ...(latitude === null || longitude === null ? {} : { latitude, longitude }),
  };
}

export const DEMO_RUNS: Run[] = demoRunData.map((run) => ({
  id: run.id,
  title: run.title,
  date: run.date,
  distanceKm: run.distanceKm,
  durationSeconds: run.durationSeconds,
  averagePaceSecondsPerKm: run.averagePaceSecondsPerKm,
  source: "TCX",
  track: run.track.map(decodeTrackPoint),
}));
