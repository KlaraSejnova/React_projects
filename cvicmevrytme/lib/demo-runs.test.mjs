import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_RUNS } from "./demo-runs.ts";
import { getGpsRoutes, groupGpsRoutes } from "./gps.ts";
import { isLongRun, isRun } from "./runs.ts";

test("demo data contains four long runs with sampled GPS routes", () => {
  assert.equal(DEMO_RUNS.length, 4);
  assert.deepEqual(
    DEMO_RUNS.map((run) => run.date.slice(0, 10)),
    ["2026-11-19", "2026-11-14", "2026-11-03", "2026-10-24"],
  );
  assert.ok(DEMO_RUNS.every(isRun));
  assert.ok(DEMO_RUNS.every(isLongRun));
  assert.ok(DEMO_RUNS.every((run) => run.track.filter((point) => point.latitude !== undefined).length >= 150));
  assert.ok(DEMO_RUNS.every((run) => run.track.length <= 200));
  assert.ok(DEMO_RUNS.every((run) => run.averageHeartRate === undefined && run.maxHeartRate === undefined));

  const routes = getGpsRoutes(DEMO_RUNS);
  const groups = groupGpsRoutes(routes);
  assert.equal(routes.length, DEMO_RUNS.length);
  assert.ok(groups.every((group) => !group.insufficientGps));
  assert.deepEqual(groups.map((group) => group.routes.length).sort(), [1, 1, 2]);
});
