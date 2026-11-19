import assert from "node:assert/strict";
import { test } from "node:test";
import { removeShortRuns } from "./remove-short-runs.ts";

function fakeClient(respond) {
  const calls = [];
  return {
    calls,
    from(table) {
      assert.equal(table, "runs");
      const call = {};
      calls.push(call);
      return {
        delete() { return this; },
        eq(column, value) { call.user = [column, value]; return this; },
        in(column, values) { call.ids = [column, values]; return this; },
        filter(column, operator, value) { call.filter = [column, operator, value]; return this; },
        async select(columns) {
          assert.equal(columns, "id");
          return respond(call, calls.length);
        },
      };
    },
  };
}

test("short runs are deleted in scoped batches with a distance guard", async () => {
  const client = fakeClient((call) => ({ data: call.ids[1].map((id) => ({ id })), error: null }));
  const ids = Array.from({ length: 101 }, (_, index) => `run-${index}`);
  const result = await removeShortRuns(client, "user-1", ids);
  assert.deepEqual(result, { deletedIds: ids });
  assert.deepEqual(client.calls.map((call) => call.ids[1].length), [100, 1]);
  assert.ok(client.calls.every((call) =>
    call.user[0] === "user_id" && call.user[1] === "user-1" &&
    call.filter.join(",") === "run->distanceKm,lte,3",
  ));
});

test("partial deletion reports unverified records and preserves confirmed successes", async () => {
  const client = fakeClient((call, number) => ({
    data: number === 1 ? call.ids[1].map((id) => ({ id })) : [],
    error: null,
  }));
  const ids = Array.from({ length: 101 }, (_, index) => `run-${index}`);
  const result = await removeShortRuns(client, "user-1", ids);
  assert.equal(result.deletedIds.length, 100);
  assert.match(result.error, /odstranění nelze ověřit/);
});

test("network errors are reported without claiming deletion", async () => {
  const client = fakeClient(() => { throw new Error("offline"); });
  assert.deepEqual(await removeShortRuns(client, "user-1", ["run-1"]), {
    deletedIds: [],
    error: "offline",
  });
});
