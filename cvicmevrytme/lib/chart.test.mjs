import assert from "node:assert/strict";
import { test } from "node:test";
import { getChartBounds, getChartTrack, getCompareColor, smoothChartPath, toggleRunGroup, toggleRunSelection } from "./chart.ts";

test("group selection preserves other runs and toggles a whole group", () => {
  assert.deepEqual(toggleRunGroup(["other", "a"], ["a", "b", "c"]), ["other", "a", "b", "c"]);
  assert.deepEqual(toggleRunGroup(["other", "a", "b", "c"], ["a", "b", "c"]), ["other"]);
});

test("comparison selection has no three-run limit and allows deselection", () => {
  let selected = [];
  for (let index = 0; index < 100; index += 1) selected = toggleRunSelection(selected, `run-${index}`);
  assert.equal(selected.length, 100);
  selected = toggleRunSelection(selected, "run-3");
  assert.equal(selected.length, 99);
  assert.equal(selected.includes("run-3"), false);
  assert.equal(new Set(Array.from({ length: 10 }, (_, index) => getCompareColor(index))).size, 10);
});

test("chart bounds handle many data points without exceeding argument limits", () => {
  const points = Array.from({ length: 200_000 }, (_, index) => ({
    km: index / 1000,
    paceSecondsPerKm: 300 + index % 20,
  }));
  assert.deepEqual(getChartBounds([{ run: { distanceKm: 201 }, points }], "pace"), {
    maxDistance: 201,
    minValue: 300,
    maxValue: 319,
  });
  assert.deepEqual(getChartBounds([], "elevation"), { maxDistance: 1, minValue: 0, maxValue: 1 });
});

test("run detail uses measured elevation, not total ascent as an altitude profile", () => {
  const run = {
    distanceKm: 5,
    averagePaceSecondsPerKm: 360,
    elevationM: 50,
    track: [],
  };
  assert.deepEqual(getChartTrack(run, "pace", false), [
    { km: 0, paceSecondsPerKm: 360 },
    { km: 5, paceSecondsPerKm: 360 },
  ]);
  assert.deepEqual(getChartTrack(run, "elevation", false), []);
  assert.deepEqual(getChartTrack(run, "elevation"), [
    { km: 0, elevationM: 50 },
    { km: 5, elevationM: 50 },
  ]);
  run.track = [{ km: 1, elevationM: 230 }];
  assert.deepEqual(getChartTrack(run, "elevation", false), []);
  run.track.push({ km: 4, elevationM: 260 });
  assert.deepEqual(getChartTrack(run, "elevation", false), run.track);
});

test("a summary or two-point series stays a straight line", () => {
  assert.equal(smoothChartPath([]), "");
  assert.equal(smoothChartPath([{ x: 0, y: 10 }]), "M 0.00 10.00");
  assert.equal(
    smoothChartPath([{ x: 0, y: 10 }, { x: 5, y: 10 }]),
    "M 0.00 10.00 L 5.00 10.00",
  );
});

test("curves pass through each point without creating extra peaks", () => {
  const points = [
    { x: 0, y: 10 },
    { x: 2, y: 50 },
    { x: 2.2, y: 51 },
    { x: 6, y: 12 },
    { x: 7, y: 12 },
    { x: 9, y: 30 },
  ];
  const path = smoothChartPath(points);
  const segments = path.match(/[MLC] [^MLC]+/g);
  assert.equal(segments?.length, points.length);
  assert.equal(segments?.[0].trim(), "M 0.00 10.00");

  for (let index = 1; index < segments.length; index += 1) {
    const [command, ...numbers] = segments[index].trim().split(/\s+/);
    const values = numbers.map(Number);
    const start = points[index - 1];
    const end = points[index];
    assert.deepEqual(values.slice(-2), [end.x, end.y]);
    if (command === "L") {
      assert.equal(start.y, end.y);
      continue;
    }
    assert.equal(command, "C");
    const [x1, y1, x2, y2] = values;
    for (let step = 0; step <= 100; step += 1) {
      const t = step / 100;
      const u = 1 - t;
      const x = u ** 3 * start.x + 3 * u ** 2 * t * x1 + 3 * u * t ** 2 * x2 + t ** 3 * end.x;
      const y = u ** 3 * start.y + 3 * u ** 2 * t * y1 + 3 * u * t ** 2 * y2 + t ** 3 * end.y;
      assert.ok(x >= start.x - 0.01 && x <= end.x + 0.01);
      assert.ok(y >= Math.min(start.y, end.y) - 0.01 && y <= Math.max(start.y, end.y) + 0.01);
    }
  }
});

test("repeated or decreasing distances remain explicit straight segments", () => {
  const path = smoothChartPath([
    { x: 0, y: 1 },
    { x: 1, y: 2 },
    { x: 1, y: 3 },
    { x: 0.5, y: 4 },
    { x: 2, y: 5 },
  ]);
  assert.match(path, /L 1\.00 3\.00 L 0\.50 4\.00/);
  assert.doesNotMatch(path, /NaN|Infinity/);
});

test("long series are processed without recursion", () => {
  const points = Array.from({ length: 10_000 }, (_, index) => ({ x: index, y: index % 20 }));
  const path = smoothChartPath(points);
  assert.match(path, /^M 0\.00 0\.00/);
  assert.match(path, /9999\.00 19\.00$/);
});
