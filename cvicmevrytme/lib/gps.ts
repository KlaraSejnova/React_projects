import type { Run, TrackPoint } from "./runs";

type GpsPoint = TrackPoint & { latitude: number; longitude: number };
export type GpsRoute = { run: Run; points: GpsPoint[] };
export type ProjectedRoute = { id: string; path: string; start: { x: number; y: number } };
export type GpsRouteGroup = { routes: GpsRoute[]; insufficientGps: boolean };

const EARTH_RADIUS_M = 6_371_000;
const SAMPLE_METERS = 40;
const MATCH_METERS = 70;
const MAX_GAP_METERS = 250;
const MIN_OVERLAP = 0.8;

type Position = { latitude: number; longitude: number };
type SampledRoute = { route: GpsRoute; samples: Position[]; radius: number; usable: boolean };

function longitudeDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

function distanceMeters(a: Position, b: Position): number {
  const radians = Math.PI / 180;
  const latitudeDelta = (b.latitude - a.latitude) * radians;
  const lonDelta = longitudeDelta(a.longitude, b.longitude) * radians;
  const h = Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(a.latitude * radians) * Math.cos(b.latitude * radians) * Math.sin(lonDelta / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(Math.min(1, h)));
}

function sampleRoute(route: GpsRoute): SampledRoute {
  const samples: Position[] = [route.points[0]];
  let distanceToSample = SAMPLE_METERS;
  let coveredMeters = 0;
  for (let index = 1; index < route.points.length; index += 1) {
    const previous = route.points[index - 1];
    const current = route.points[index];
    const distance = distanceMeters(previous, current);
    if (distance > MAX_GAP_METERS) {
      samples.push(current);
      distanceToSample = SAMPLE_METERS;
      continue;
    }
    coveredMeters += distance;
    let remaining = distance;
    while (remaining >= distanceToSample && distance > 0) {
      const fraction = (distance - remaining + distanceToSample) / distance;
      const longitude = previous.longitude + longitudeDelta(previous.longitude, current.longitude) * fraction;
      samples.push({
        latitude: previous.latitude + (current.latitude - previous.latitude) * fraction,
        longitude: ((longitude + 540) % 360) - 180,
      });
      if (samples.length > 5000) return { route, samples: [], radius: 0, usable: false };
      remaining -= distanceToSample;
      distanceToSample = SAMPLE_METERS;
    }
    distanceToSample -= remaining;
  }
  return {
    route,
    samples,
    radius: samples.reduce((max, point) => Math.max(max, distanceMeters(samples[0], point)), 0),
    usable: route.points.length >= 3 && samples.length >= 3 &&
      coveredMeters >= 200 && coveredMeters >= route.run.distanceKm * 500,
  };
}

function overlapFraction(source: Position[], target: Position[]): number {
  const origin = target[0];
  const radians = Math.PI / 180;
  const latitudeFactor = EARTH_RADIUS_M * radians;
  const longitudeFactor = latitudeFactor * Math.max(0.01, Math.cos(origin.latitude * radians));
  const cell = (point: Position) => ({
    x: Math.floor(longitudeDelta(origin.longitude, point.longitude) * longitudeFactor / MATCH_METERS),
    y: Math.floor((point.latitude - origin.latitude) * latitudeFactor / MATCH_METERS),
  });
  const grid = new Map<string, Position[]>();
  for (const point of target) {
    const { x, y } = cell(point);
    const key = `${x},${y}`;
    const bucket = grid.get(key) ?? [];
    bucket.push(point);
    grid.set(key, bucket);
  }
  let matched = 0;
  for (const point of source) {
    const { x, y } = cell(point);
    let found = false;
    for (let dx = -2; dx <= 2 && !found; dx += 1) {
      for (let dy = -2; dy <= 2 && !found; dy += 1) {
        found = (grid.get(`${x + dx},${y + dy}`) ?? []).some((candidate) => distanceMeters(point, candidate) <= MATCH_METERS);
      }
    }
    if (found) matched += 1;
  }
  return matched / source.length;
}

export function groupGpsRoutes(routes: GpsRoute[]): GpsRouteGroup[] {
  const groups: { representative: SampledRoute; routes: GpsRoute[] }[] = [];
  for (const route of routes) {
    const sampled = sampleRoute(route);
    const group = sampled.usable && groups.find(({ representative }) => {
      if (!representative.usable) return false;
      const ratio = sampled.route.run.distanceKm / representative.route.run.distanceKm;
      return ratio >= 0.8 && ratio <= 1.25 &&
        distanceMeters(sampled.samples[0], representative.samples[0]) <= sampled.radius + representative.radius + MATCH_METERS &&
        overlapFraction(sampled.samples, representative.samples) >= MIN_OVERLAP &&
        overlapFraction(representative.samples, sampled.samples) >= MIN_OVERLAP;
    });
    if (group) group.routes.push(route);
    else groups.push({ representative: sampled, routes: [route] });
  }
  return groups.map(({ representative, routes }) => ({ routes, insufficientGps: !representative.usable }));
}

export function getGpsRoutes(runs: Run[]): GpsRoute[] {
  return runs.flatMap((run) => {
    const points = run.track.filter((point): point is GpsPoint =>
      point !== null && typeof point === "object" &&
      typeof point.latitude === "number" && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 &&
      typeof point.longitude === "number" && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180,
    );
    return points.length >= 2 ? [{ run, points }] : [];
  });
}

export function projectGpsRoutes(routes: GpsRoute[]): ProjectedRoute[] {
  if (!routes.length) return [];
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minWrappedLon = Infinity;
  let maxWrappedLon = -Infinity;
  for (const { points } of routes) {
    for (const point of points) {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLon = Math.min(minLon, point.longitude);
      maxLon = Math.max(maxLon, point.longitude);
      const wrapped = point.longitude < 0 ? point.longitude + 360 : point.longitude;
      minWrappedLon = Math.min(minWrappedLon, wrapped);
      maxWrappedLon = Math.max(maxWrappedLon, wrapped);
    }
  }
  const wrapLongitude = maxWrappedLon - minWrappedLon < maxLon - minLon;
  const longitude = (point: GpsPoint) =>
    wrapLongitude && point.longitude < 0 ? point.longitude + 360 : point.longitude;
  const longitudeMin = wrapLongitude ? minWrappedLon : minLon;
  const longitudeMax = wrapLongitude ? maxWrappedLon : maxLon;
  const longitudeFactor = Math.max(0.01, Math.cos(((minLat + maxLat) / 2) * Math.PI / 180));
  const width = Math.max((longitudeMax - longitudeMin) * longitudeFactor, 0.000001);
  const height = Math.max(maxLat - minLat, 0.000001);
  const scale = Math.min(920 / width, 420 / height);
  const offsetX = (1000 - width * scale) / 2;
  const offsetY = (500 - height * scale) / 2;
  const project = (point: GpsPoint) => ({
    x: offsetX + (longitude(point) - longitudeMin) * longitudeFactor * scale,
    y: offsetY + (maxLat - point.latitude) * scale,
  });
  return routes.map(({ run, points }) => {
    const coordinates = points.map(project);
    return {
      id: run.id,
      start: coordinates[0],
      path: coordinates.map(({ x, y }, index) => `${index ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" "),
    };
  });
}
