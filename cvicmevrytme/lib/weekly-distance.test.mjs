import assert from "node:assert/strict";
import { test } from "node:test";
import { getWeeklyDistances } from "./weekly-distance.ts";

const DAY = 24 * 60 * 60 * 1000;
const date = (year, month, day, hour = 0) => new Date(year, month - 1, day, hour).toISOString();

test("30 and 90 day charts use the selected runs, including only the partial first week", () => {
  const now = new Date(2026, 10, 19, 12).getTime();
  const runs = [
    { id: "before", date: new Date(now - 30 * DAY - 1).toISOString(), distanceKm: 5 },
    { id: "at-cutoff", date: new Date(now - 30 * DAY).toISOString(), distanceKm: 4.2 },
    { id: "current", date: date(2026, 11, 18, 12), distanceKm: 6.3 },
  ];
  const cutoff30 = now - 30 * DAY;
  const selected30 = runs.filter((run) => Date.parse(run.date) >= cutoff30);
  const chart30 = getWeeklyDistances(selected30, now, cutoff30);
  assert.equal(chart30.weeks.length, 2);
  assert.equal(chart30.weeks[0].partial, true);
  assert.deepEqual(chart30.weeks[0].runs.map((run) => run.id), ["at-cutoff"]);
  assert.equal(chart30.weeks[0].distance, 4.2);
  assert.equal(chart30.thisWeek, 6.3);
  const cutoff90 = now - 90 * DAY;
  const chart90 = getWeeklyDistances(runs, now, cutoff90);
  assert.equal(chart90.weeks.length, 2);
  assert.equal(chart90.weeks.reduce((sum, week) => sum + week.runs.length, 0), 3);
  assert.equal(chart90.weeks[0].partial, false);
});

test("all-history chart includes old and future runs, identifies current week and reports invalid dates", () => {
  const now = new Date(2026, 10, 19, 12).getTime();
  const runs = [
    { id: "monday", date: date(2026, 11, 16), distanceKm: 4.2 },
    { id: "sunday", date: date(2026, 11, 22, 23), distanceKm: 6.3 },
    { id: "old", date: date(2026, 7, 1), distanceKm: 5 },
    { id: "future", date: date(2026, 11, 23), distanceKm: 8 },
    { id: "invalid", date: "invalid", distanceKm: 7 },
  ];
  const chart = getWeeklyDistances(runs, now, null);
  const current = chart.weeks.find((week) => week.current);
  assert.equal(current.distance, 10.5);
  assert.deepEqual(current.runs.map((run) => run.id), ["sunday", "monday"]);
  assert.equal(chart.thisWeek, 10.5);
  assert.equal(chart.weeks.at(-1).runs[0].id, "future");
  assert.equal(chart.weeks[0].runs[0].id, "old");
  assert.equal(chart.undatedCount, 1);
  assert.equal(chart.maxDistance, 10.5);
  assert.equal(chart.weeks.length, 3);
  assert.ok(chart.weeks.every((week) => week.runs.length > 0));
});

test("empty histories and sparse histories do not produce empty weeks", () => {
  const now = new Date(2026, 10, 19, 12).getTime();
  assert.equal(getWeeklyDistances([], now, null).weeks.length, 0);
  const emptyPeriod = getWeeklyDistances([], now, now - 90 * DAY);
  assert.equal(emptyPeriod.weeks.length, 0);
  assert.equal(emptyPeriod.pageCount, 1);
  assert.equal(emptyPeriod.thisWeek, 0);
  const runs = [
    { id: "old", date: date(2010, 1, 1), distanceKm: 20 },
    { id: "recent", date: date(2026, 11, 9), distanceKm: 4 },
  ];
  const chart = getWeeklyDistances(runs, now, null);
  assert.equal(chart.pageCount, 1);
  assert.deepEqual(chart.weeks.map((week) => week.runs[0].id), ["old", "recent"]);
  assert.equal(chart.thisWeek, 0);
  assert.ok(chart.weeks.every((week) => !week.current));
});

test("more than 260 active weeks are paginated without dropping runs", () => {
  const now = new Date(2026, 10, 19, 12).getTime();
  const runs = Array.from({ length: 261 }, (_, index) => ({
    id: String(index),
    date: new Date(2026, 10, 16 - index * 7, 12).toISOString(),
    distanceKm: index === 260 ? 20 : 4,
  }));
  const latest = getWeeklyDistances(runs, now, null);
  assert.equal(latest.pageCount, 2);
  assert.equal(latest.weeks.length, 260);
  assert.equal(latest.weeks.at(-1).runs[0].id, "0");
  assert.equal(latest.maxDistance, 20);
  const oldest = getWeeklyDistances(runs, now, null, latest.pageCount - 1);
  assert.equal(oldest.weeks.length, 1);
  assert.equal(oldest.weeks[0].runs[0].id, "260");
  assert.equal(oldest.maxDistance, 20);
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
    const chart = getWeeklyDistances(runs, now, null);
    const current = chart.weeks.find((week) => week.current);
    assert.deepEqual(current.runs.map((run) => run.id), ["sunday"]);
    assert.equal(current.distance, 4);
    assert.equal(current.end.getDate(), 30);
    assert.equal(current.end.getHours(), 0);
    assert.equal(chart.weeks.at(-1).runs[0].id, "monday");
  } finally {
    if (previousZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousZone;
  }
});
