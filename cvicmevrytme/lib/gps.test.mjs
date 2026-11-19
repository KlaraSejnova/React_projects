import assert from "node:assert/strict";
import { test } from "node:test";
import { getGpsRoutes, groupGpsRoutes, projectGpsRoutes } from "./gps.ts";

function rectangle(latOffset = 0, lonOffset = 0, divisions = 50) {
  const corners = [[50, 14], [50.01, 14], [50.01, 14.0156], [50, 14.0156], [50, 14]];
  const points = [];
  for (let side = 0; side < 4; side += 1) {
    for (let index = 0; index < divisions; index += 1) {
      const ratio = index / divisions;
      points.push({
        km: points.length * 0.02,
        latitude: corners[side][0] + (corners[side + 1][0] - corners[side][0]) * ratio + latOffset,
        longitude: corners[side][1] + (corners[side + 1][1] - corners[side][1]) * ratio + lonOffset,
      });
    }
  }
  points.push(points[0]);
  return points;
}

function run(id, track, distanceKm = 4.4) {
  return { id, track, distanceKm };
}

test("comparison excludes missing, invalid and single GPS points", () => {
  const runs = [
    { id: "missing", track: [] },
    { id: "single", track: [{ km: 0, latitude: 50, longitude: 14 }] },
    { id: "invalid", track: [{ km: 0, latitude: 91, longitude: 14 }, { km: 1, latitude: 50, longitude: NaN }] },
    { id: "valid", track: [{ km: 0, latitude: 50, longitude: 14 }, { km: 1, latitude: 50.01, longitude: 14.01 }] },
  ];
  assert.deepEqual(getGpsRoutes(runs).map(({ run }) => run.id), ["valid"]);
});

test("routes share one projection with north up and east right", () => {
  const routes = getGpsRoutes([
    { id: "a", track: [{ km: 0, latitude: 50, longitude: 14 }, { km: 1, latitude: 50.01, longitude: 14.01 }] },
    { id: "b", track: [{ km: 0, latitude: 50, longitude: 14 }, { km: 1, latitude: 50.01, longitude: 14.01 }] },
  ]);
  const projected = projectGpsRoutes(routes);
  assert.equal(projected[0].path, projected[1].path);
  const coords = [...projected[0].path.matchAll(/[ML] ([\d.]+) ([\d.]+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
  assert.ok(coords[1][0] > coords[0][0]);
  assert.ok(coords[1][1] < coords[0][1]);
});

test("projection handles antimeridian and large or degenerate tracks", () => {
  const acrossDateLine = getGpsRoutes([{ id: "date-line", track: [
    { km: 0, latitude: 0, longitude: 179.9 },
    { km: 1, latitude: 0, longitude: -179.9 },
    { km: 2, latitude: 0.1, longitude: -179.9 },
  ] }]);
  const path = projectGpsRoutes(acrossDateLine)[0].path;
  const coords = [...path.matchAll(/[ML] ([\d.]+) ([\d.]+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
  assert.ok(coords[1][0] > coords[0][0]);
  assert.ok(coords[2][1] < coords[1][1]);
  const points = Array.from({ length: 150_000 }, (_, index) => ({ km: index, latitude: 50, longitude: 14 }));
  assert.doesNotMatch(projectGpsRoutes(getGpsRoutes([{ id: "long", track: points }]))[0].path, /NaN|Infinity/);
  assert.deepEqual(projectGpsRoutes([]), []);
});

test("groups similar GPS routes regardless of direction and recording density", () => {
  const first = rectangle();
  const routes = getGpsRoutes([
    run("base", first),
    run("reverse", [...rectangle(0, 0, 40)].reverse()),
    run("offset", rectangle(0.00015)),
    run("different", Array.from({ length: 201 }, (_, index) => ({
      km: index * 0.022,
      latitude: 50 + index * 0.0002,
      longitude: 14,
    }))),
    run("far", rectangle(0.1)),
    run("longer", rectangle(), 6),
    run("sparse", [first[0], first[100]]),
  ]);
  const groups = groupGpsRoutes(routes);
  assert.deepEqual(groups.map((group) => group.routes.map(({ run }) => run.id)), [
    ["base", "reverse", "offset"], ["different"], ["far"], ["longer"], ["sparse"],
  ]);
  assert.equal(groups.at(-1).insufficientGps, true);
});

test("GPS gaps are not interpolated into a fabricated route", () => {
  const points = [
    { km: 0, latitude: 50, longitude: 14 },
    { km: 2, latitude: 50.02, longitude: 14 },
    { km: 4, latitude: 50.04, longitude: 14 },
  ];
  const groups = groupGpsRoutes(getGpsRoutes([run("a", points), run("b", points)]));
  assert.equal(groups.length, 2);
  assert.ok(groups.every((group) => group.insufficientGps));
});
