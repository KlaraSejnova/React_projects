import assert from "node:assert/strict";
import { test } from "node:test";
import { DOMParser } from "@xmldom/xmldom";
import { importRuns, isLongRun, matchTcxRuns, prepareTcxImport, preserveTcxDetails } from "./runs.ts";

globalThis.DOMParser = DOMParser;
globalThis.Element = new DOMParser().parseFromString("<root/>", "application/xml").documentElement.constructor;

const header = "Date,Source(s),Timezone,Steps,Distance (m),Elevation (m),Start Date/Time,Exercise Name,Duration (min),Exercise Distance (m)";

test("the distance limit excludes 3 km and shorter runs without rounding", () => {
  assert.equal(isLongRun({ distanceKm: 2.999 }), false);
  assert.equal(isLongRun({ distanceKm: 3 }), false);
  assert.equal(isLongRun({ distanceKm: 3.001 }), true);
});

function activityFile(...rows) {
  return new File([[header, ...rows].join("\n")], "Activity.csv", { type: "text/csv" });
}

test("Health Connect export imports separate runs with exercise metrics and correct time zones", async () => {
  const file = activityFile(
    "2026-01-15,example.app,Europe/Prague,12000,10000,300,2026-01-15 08:15:00,Ranní běh,30,5000",
    "2026-07-15,example.app,Europe/Prague,10000,8000,200,2026-07-15 18:30:00,56 - Running,1.5,42",
    "2026-07-15,example.app,Europe/Prague,10000,8000,200,2026-07-15 10:00:00,79 - Walking,20,900",
    "2026-07-15,example.app,Europe/Prague,10000,8000,200,,,,",
  );
  const result = await importRuns(file);
  assert.equal(result.runs.length, 2);
  assert.deepEqual(result.warnings, []);
  assert.equal(result.runs[0].date, "2026-01-15T07:15:00.000Z");
  assert.equal(result.runs[0].durationSeconds, 1800);
  assert.equal(result.runs[0].distanceKm, 5);
  assert.equal(result.runs[0].averagePaceSecondsPerKm, 360);
  assert.equal(result.runs[0].source, "Health Connect");
  assert.equal(result.runs[0].elevationM, undefined);
  assert.equal(result.runs[0].averageHeartRate, undefined);
  assert.equal(result.runs[1].date, "2026-07-15T16:30:00.000Z");
  assert.equal(result.runs[1].distanceKm, 0.042);
  assert.equal(result.runs[1].durationSeconds, 90);
  assert.deepEqual(result.runs.map((run) => run.id), (await importRuns(file)).runs.map((run) => run.id));
});

test("invalid runs and unrecognized activity names are reported without fabricating data", async () => {
  const result = await importRuns(activityFile(
    "2026-01-15,example.app,Europe/Prague,1000,900,20,2026-01-15 08:15:00,Ranní běh,30,",
    "2026-01-15,example.app,Europe/Prague,1000,900,20,2026-01-15 10:00:00,Trénink,30,5000",
    "2026-01-15,example.app,Europe/Prague,1000,900,20,2026-01-15 11:00:00,56 - Running,30,5000",
  ));
  assert.equal(result.runs.length, 1);
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[0], /Řádek 2/);
  assert.match(result.warnings[1], /nerozpoznaným názvem/);
});

test("ambiguous and nonexistent daylight-saving times are reported", async () => {
  const result = await importRuns(activityFile(
    "2026-03-29,example.app,Europe/Prague,,,,2026-03-29 02:30:00,56 - Running,30,5000",
    "2026-10-25,example.app,Europe/Prague,,,,2026-10-25 02:30:00,56 - Running,30,5000",
  ));
  assert.equal(result.runs.length, 0);
  assert.equal(result.warnings.length, 2);
  assert.ok(result.warnings.every((warning) => warning.includes("jednoznačně")));
});

test("duplicate activity rows are not silently imported twice", async () => {
  const row = "2026-01-15,example.app,Europe/Prague,,,,2026-01-15 08:15:00,56 - Running,30,5000";
  const result = await importRuns(activityFile(row, row));
  assert.equal(result.runs.length, 1);
  assert.match(result.warnings[0], /stejný zdroj, čas a název/);
});

test("regular CSV imports still produce a single run", async () => {
  const file = new File([
    "name,date,distance_km,duration_seconds,avg_hr,elevation_m\nTest,2026-01-01,6.42,2166,148,38",
  ], "run.csv");
  const result = await importRuns(file);
  assert.equal(result.runs.length, 1);
  assert.equal(result.runs[0].source, "CSV");
  assert.equal(result.runs[0].distanceKm, 6.42);
  assert.equal(result.runs[0].averageHeartRate, 148);
  assert.deepEqual(result.warnings, []);
});

function tcxFile(...activities) {
  return new File([
    `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities>${activities.join("")}</Activities></TrainingCenterDatabase>`,
  ], "activity.tcx");
}

function tcxActivity(id, sport, points, distance = 300, duration = 120) {
  return `<Activity Sport="${sport}"><Id>${id}</Id><Lap><TotalTimeSeconds>${duration}</TotalTimeSeconds><DistanceMeters>${distance}</DistanceMeters><Track>${points}</Track></Lap></Activity>`;
}

function tcxPoint(time, distance, extra = "") {
  return `<Trackpoint><Time>${time}</Time><DistanceMeters>${distance}</DistanceMeters>${extra}</Trackpoint>`;
}

test("TCX imports running activities with pace derived from distance and time", async () => {
  const points = [
    tcxPoint("2026-01-01T10:00:00Z", 0, "<Position><LatitudeDegrees>50</LatitudeDegrees><LongitudeDegrees>14</LongitudeDegrees></Position><HeartRateBpm><Value>120</Value></HeartRateBpm>"),
    tcxPoint("2026-01-01T10:00:30Z", 100, "<Position><LatitudeDegrees>50.001</LatitudeDegrees><LongitudeDegrees>14.001</LongitudeDegrees></Position><HeartRateBpm><Value>140</Value></HeartRateBpm>"),
    tcxPoint("2026-01-01T10:01:30Z", 200),
    tcxPoint("2026-01-01T10:02:00Z", 300),
  ].join("");
  const file = tcxFile(
    tcxActivity("2026-01-01T10:00:00Z", "Running", points),
    tcxActivity("2026-01-01T12:00:00Z", "Walking", points),
  );
  const result = await importRuns(file);
  assert.equal(result.runs.length, 1);
  assert.deepEqual(result.warnings, []);
  const run = result.runs[0];
  assert.equal(run.source, "TCX");
  assert.equal(run.distanceKm, 0.3);
  assert.equal(run.durationSeconds, 120);
  assert.equal(run.averageHeartRate, 130);
  assert.equal(run.maxHeartRate, 140);
  assert.deepEqual(run.track.flatMap((point) => point.paceSecondsPerKm === undefined ? [] : [point.paceSecondsPerKm]), [300, 600, 300]);
  assert.equal(run.track.filter((point) => point.latitude !== undefined).length, 2);
  assert.equal(run.id, (await importRuns(file)).runs[0].id);
});

test("TCX reports invalid running records and skips non-running activities", async () => {
  const good = tcxActivity("2026-01-01T10:00:00Z", "Running", [
    tcxPoint("2026-01-01T10:00:00Z", 0),
    tcxPoint("2026-01-01T10:01:00Z", 300),
  ].join(""));
  const invalidDistance = tcxActivity("2026-01-01T11:00:00Z", "Running", "", 0);
  const invalidTime = tcxActivity("2026-01-01T12:00:00", "Running", "");
  const backwards = tcxActivity("2026-01-01T13:00:00Z", "Running", [
    tcxPoint("2026-01-01T13:00:00Z", 200),
    tcxPoint("2026-01-01T13:01:00Z", 100),
  ].join(""));
  const result = await importRuns(tcxFile(good, good, invalidDistance, invalidTime, backwards));
  assert.equal(result.runs.length, 1);
  assert.equal(result.warnings.length, 4);
  assert.match(result.warnings[0], /stejný identifikátor/);
  assert.match(result.warnings[1], /vzdálenost/);
  assert.match(result.warnings[2], /čas začátku/);
  assert.match(result.warnings[3], /pořadí/);
});

test("TCX can handle distance counters restarting at a new lap", async () => {
  const lap = (start, end) => `<Lap><TotalTimeSeconds>60</TotalTimeSeconds><DistanceMeters>100</DistanceMeters><Track>${tcxPoint(start, 0)}${tcxPoint(end, 100)}</Track></Lap>`;
  const activity = `<Activity Sport="Running"><Id>2026-01-01T10:00:00Z</Id>${lap("2026-01-01T10:00:00Z", "2026-01-01T10:01:00Z")}${lap("2026-01-01T10:01:01Z", "2026-01-01T10:02:01Z")}</Activity>`;
  const result = await importRuns(tcxFile(activity));
  assert.equal(result.runs.length, 1);
  assert.equal(result.runs[0].distanceKm, 0.2);
  assert.equal(result.runs[0].track.filter((point) => point.paceSecondsPerKm !== undefined).length, 2);
});

test("TCX with only two distance points does not invent a detailed pace chart", async () => {
  const result = await importRuns(tcxFile(tcxActivity("2026-01-01T10:00:00Z", "Running", [
    tcxPoint("2026-01-01T10:00:00Z", 0),
    tcxPoint("2026-01-01T10:02:00Z", 300),
  ].join(""))));
  assert.equal(result.runs.length, 1);
  assert.equal(result.runs[0].track.filter((point) => point.paceSecondsPerKm !== undefined).length, 0);
});

test("TCX estimates sparse distance updates only when repeated GPS points show movement", async () => {
  const start = Date.parse("2026-01-01T10:00:00Z");
  const point = (seconds, distance, latitude) => tcxPoint(
    new Date(start + seconds * 1000).toISOString(),
    distance,
    `<Position><LatitudeDegrees>${latitude}</LatitudeDegrees><LongitudeDegrees>14</LongitudeDegrees></Position><AltitudeMeters>${200 + seconds / 60}</AltitudeMeters>`,
  );
  const points = [point(0, 0, 50)];
  for (let interval = 0; interval < 10; interval += 1) {
    points.push(point(interval * 60 + 30, interval * 100, 50 + (interval + 0.5) * 0.001));
    points.push(point((interval + 1) * 60, (interval + 1) * 100, 50 + (interval + 1) * 0.001));
  }
  const result = await importRuns(tcxFile(tcxActivity("2026-01-01T10:00:00Z", "Running", points.join(""), 1000, 600)));
  const run = result.runs[0];
  assert.deepEqual(result.warnings, []);
  assert.equal(run.estimatedTrack, true);
  assert.equal(run.distanceKm, 1);
  assert.equal(run.durationSeconds, 600);
  const halfway = run.track.find((point) => point.elevationM === 200.5);
  assert.equal(halfway.km, 0.05);
  assert.deepEqual(run.track.flatMap((point) => point.paceSecondsPerKm === undefined ? [] : [point.paceSecondsPerKm]), [600, 600]);
});

test("TCX does not interpolate stationary GPS points", async () => {
  const start = Date.parse("2026-01-01T10:00:00Z");
  const points = Array.from({ length: 7 }, (_, index) => tcxPoint(
    new Date(start + index * 30_000).toISOString(),
    Math.floor(index / 2) * 100,
    "<Position><LatitudeDegrees>50</LatitudeDegrees><LongitudeDegrees>14</LongitudeDegrees></Position><AltitudeMeters>200</AltitudeMeters>",
  ));
  const result = await importRuns(tcxFile(tcxActivity("2026-01-01T10:00:00Z", "Running", points.join(""), 300, 180)));
  assert.equal(result.runs[0].estimatedTrack, false);
  assert.equal(result.runs[0].track.filter((point) => point.elevationM !== undefined)[1].km, 0);
});

test("TCX matching requires unique time, distance and duration agreement", () => {
  const run = { id: "health-export:old", title: "Test", date: "2026-01-01T10:00:00Z", distanceKm: 5, durationSeconds: 1800, averagePaceSecondsPerKm: 360, source: "Health Connect", track: [] };
  const incoming = { ...run, id: "tcx:new", source: "TCX", date: "2026-01-01T10:01:00Z" };
  const result = matchTcxRuns([incoming], [run]);
  assert.equal(result.matches.length, 1);
  assert.equal(result.ready.length, 0);
  assert.equal(matchTcxRuns([incoming], [run, { ...run, id: "health-export:other" }]).ambiguous, 1);
  assert.equal(matchTcxRuns([incoming, { ...incoming, id: "tcx:other" }], [run]).ambiguous, 2);
  assert.equal(matchTcxRuns([incoming], [{ ...run, distanceKm: 20 }]).ready.length, 1);
  assert.equal(matchTcxRuns([incoming], [{ ...incoming }]).ready.length, 1);
});

test("reimporting a Health Connect CSV preserves confirmed TCX details", () => {
  const csv = { id: "health-export:old", title: "Test", date: "2026-01-01T10:00:00Z", distanceKm: 5, durationSeconds: 1800, averagePaceSecondsPerKm: 360, source: "Health Connect", track: [] };
  const detailed = { ...csv, source: "TCX", track: [{ km: 1, paceSecondsPerKm: 350 }] };
  assert.deepEqual(preserveTcxDetails([csv], [detailed]), [detailed]);
  assert.deepEqual(preserveTcxDetails([csv], [{ ...csv, distanceKm: 4 }]), [csv]);
});

test("automatic TCX import updates existing TCX records including legacy IDs", () => {
  const incoming = { id: "tcx:new", title: "Google Fit", date: "2026-01-01T10:00:00.000Z", distanceKm: 5, durationSeconds: 1800, averagePaceSecondsPerKm: 360, source: "TCX", track: [] };
  const legacy = { ...incoming, id: "health-export:old", title: "Original", date: "2026-01-01T10:00:00Z", distanceKm: 4 };
  assert.deepEqual(prepareTcxImport([incoming], [legacy]), {
    ready: [{ ...incoming, id: legacy.id, title: legacy.title }],
    skipped: 0,
  });
  assert.deepEqual(prepareTcxImport([incoming], [incoming]), { ready: [incoming], skipped: 0 });
  assert.deepEqual(prepareTcxImport([incoming], []), { ready: [incoming], skipped: 0 });
});

test("automatic TCX import skips uncertain matches without replacing existing runs", () => {
  const incoming = { id: "tcx:new", title: "Google Fit", date: "2026-01-01T10:00:00Z", distanceKm: 5, durationSeconds: 1800, averagePaceSecondsPerKm: 360, source: "TCX", track: [] };
  const legacy = { ...incoming, id: "health-export:old" };
  const health = { ...legacy, source: "Health Connect" };
  assert.deepEqual(prepareTcxImport([incoming], [health]), { ready: [], skipped: 1 });
  assert.deepEqual(prepareTcxImport([incoming], [legacy, { ...legacy, id: "health-export:other" }]), { ready: [], skipped: 1 });
  const nearby = { ...legacy, date: "2026-01-01T10:01:00Z" };
  assert.deepEqual(prepareTcxImport([incoming], [nearby]), { ready: [], skipped: 1 });
});
