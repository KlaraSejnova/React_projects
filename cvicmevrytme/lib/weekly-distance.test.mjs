import assert from "node:assert/strict";
import { test } from "node:test";
import { getWeeklyDistances } from "./weekly-distance.ts";

test("weeks include runs from Monday through Sunday and sort the detail newest first", () => {
  const date = (year, month, day, hour = 0) => new Date(year, month - 1, day, hour).toISOString();
  const runs = [
    { id: "monday", date: date(2026, 11, 16), distanceKm: 4.2 },
    { id: "sunday", date: date(2026, 11, 22, 23), distanceKm: 6.3 },
    { id: "previous", date: date(2026, 11, 15, 23), distanceKm: 5 },
    { id: "next", date: date(2026, 11, 23), distanceKm: 8 },
  ];
  const weeks = getWeeklyDistances(runs, new Date(2026, 10, 19, 12).getTime());
  assert.equal(weeks.length, 5);
  assert.equal(weeks[4].distance, 10.5);
  assert.deepEqual(weeks[4].runs.map((run) => run.id), ["sunday", "monday"]);
  assert.deepEqual(weeks[3].runs.map((run) => run.id), ["previous"]);
  assert.equal(weeks[4].current, true);
  assert.equal(weeks[0].distance, 0);
  assert.deepEqual(weeks[0].runs, []);
});

test("week boundaries remain calendar days across daylight saving changes", () => {
  const previousZone = process.env.TZ;
  process.env.TZ = "Europe/Prague";
  try {
    const now = new Date(2026, 2, 29, 12).getTime();
    const runs = [
      { id: "sunday", date: new Date(2026, 2, 29, 23, 59).toISOString(), distanceKm: 4 },
      { id: "monday", date: new Date(2026, 2, 30, 0, 0).toISOString(), distanceKm: 7 },
    ];
    const current = getWeeklyDistances(runs, now).at(-1);
    assert.deepEqual(current.runs.map((run) => run.id), ["sunday"]);
    assert.equal(current.distance, 4);
    assert.equal(current.end.getDate(), 30);
    assert.equal(current.end.getHours(), 0);
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});
