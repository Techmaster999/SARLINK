/* DT-178: Prevent a volunteer from checking into more than one incident at a time */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  closeCheckIn,
  createCheckIn,
} from "../controllers/checkInController.js";
import {
  closeVolunteerCheckIn,
  createVolunteerCheckIn,
  hasActiveIncidentCheckIn,
} from "../services/checkInService.js";

function createInMemoryCheckInDb() {
  const rows = [];
  let nextId = 1;

  return {
    rows,
    query: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

      if (normalized.startsWith("SELECT * FROM VOLUNTEER_CHECK_INS WHERE VOLUNTEER_ID = $1")) {
        const volunteerId = Number(params[0]);
        const active = rows.find(
          (r) => Number(r.volunteer_id) === volunteerId && r.closed_at == null
        );
        return { rows: active ? [active] : [] };
      }

      if (normalized.startsWith("INSERT INTO VOLUNTEER_CHECK_INS")) {
        const [volunteerId, incidentId, teamId] = params;
        const row = {
          id: nextId++,
          volunteer_id: Number(volunteerId),
          incident_id: Number(incidentId),
          team_id: teamId ?? null,
          checked_in_at: new Date("2026-11-27T15:00:00.000Z"),
          team_assigned_at: null,
          submitted_at: null,
          closed_at: null,
        };
        rows.push(row);
        return { rows: [row] };
      }

      if (normalized.startsWith("UPDATE VOLUNTEER_CHECK_INS SET CLOSED_AT")) {
        const checkInId = Number(params[0]);
        const row = rows.find((r) => Number(r.id) === checkInId);
        if (!row) return { rows: [] };
        row.closed_at = new Date("2026-11-27T16:00:00.000Z");
        return { rows: [row] };
      }

      return { rows: [] };
    },
  };
}

describe("DT-178: Prevent a volunteer from checking into more than one incident at a time", () => {
  it("allows a volunteer to check into one incident", async () => {
    const db = createInMemoryCheckInDb();

    assert.equal(await hasActiveIncidentCheckIn(7, { db }), false);

    const checkIn = await createVolunteerCheckIn(
      { volunteerId: 7, incidentId: 101 },
      { db }
    );

    assert.equal(checkIn.id, 1);
    assert.equal(checkIn.volunteerId, 7);
    assert.equal(checkIn.incidentId, 101);
    assert.equal(checkIn.isClosed, false);
    assert.equal(await hasActiveIncidentCheckIn(7, { db }), true);
  });

  it("prevents a volunteer with an existing active check-in from checking into another incident with a clear message", async () => {
    const db = createInMemoryCheckInDb();

    await createVolunteerCheckIn({ volunteerId: 7, incidentId: 101 }, { db });

    await assert.rejects(
      async () => {
        await createVolunteerCheckIn({ volunteerId: 7, incidentId: 202 }, { db });
      },
      /already checked into an active incident and cannot check into more than one incident at a time/i
    );
  });

  it("enforces the restriction on the server controller (POST /api/check-ins)", async () => {
    const db = createInMemoryCheckInDb();

    let status1 = null;
    const req1 = {
      body: { volunteerId: 12, incidentId: 1 },
      app: { locals: { db } },
    };
    const res1 = {
      status(code) {
        status1 = code;
        return this;
      },
      location() {
        return this;
      },
      json() {},
    };
    let next1Called = false;
    const next1 = () => {
      next1Called = true;
    };

    await createCheckIn(req1, res1, next1);
    assert.equal(next1Called, false);
    assert.equal(status1, 201);

    let status2 = null;
    const req2 = {
      body: { volunteerId: 12, incidentId: 2 },
      app: { locals: { db } },
    };
    const res2 = {
      status(code) {
        status2 = code;
        return this;
      },
      location() {
        return this;
      },
      json() {},
    };
    let next2Err = null;
    const next2 = (err) => {
      next2Err = err;
    };

    await createCheckIn(req2, res2, next2);
    assert.ok(next2Err, "Expected an error passed to next()");
    assert.equal(next2Err.status, 409);
    assert.match(
      next2Err.message,
      /already checked into an active incident and cannot check into more than one incident at a time/i
    );
  });

  it("allows the volunteer to check in again after their existing check-in is closed", async () => {
    const db = createInMemoryCheckInDb();

    const first = await createVolunteerCheckIn(
      { volunteerId: 7, incidentId: 101 },
      { db }
    );
    assert.equal(await hasActiveIncidentCheckIn(7, { db }), true);

    let closeStatus = null;
    const closeReq = {
      params: { checkInId: String(first.id) },
      app: { locals: { db } },
    };
    const closeRes = {
      status(code) {
        closeStatus = code;
        return this;
      },
      json() {},
    };
    let closeNextCalled = false;
    const closeNext = () => {
      closeNextCalled = true;
    };

    await closeCheckIn(closeReq, closeRes, closeNext);
    assert.equal(closeNextCalled, false);
    assert.equal(closeStatus, 200);

    assert.equal(await hasActiveIncidentCheckIn(7, { db }), false);

    const second = await createVolunteerCheckIn(
      { volunteerId: 7, incidentId: 202 },
      { db }
    );
    assert.equal(second.id, 2);
    assert.equal(second.volunteerId, 7);
    assert.equal(second.incidentId, 202);
    assert.equal(second.isClosed, false);
  });
});
