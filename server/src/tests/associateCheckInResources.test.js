/* DT-193: Associate the resources with the correct volunteer and incident */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getCheckIn,
  saveCheckInResources,
} from "../controllers/checkInController.js";
import {
  getCheckInById,
  saveVolunteerResources,
} from "../services/checkInService.js";
import VolunteerCheckIn from "../models/VolunteerCheckIn.js";

function createInMemoryCheckInDb(initialCheckIns = []) {
  const checkIns = initialCheckIns.map((c) => ({
    id: Number(c.id),
    volunteer_id: Number(c.volunteerId),
    incident_id: Number(c.incidentId),
    team_id: c.teamId ?? null,
    checked_in_at: c.checkedInAt ?? new Date("2026-11-27T15:00:00.000Z"),
    team_assigned_at: c.teamAssignedAt ?? null,
    submitted_at: c.submittedAt ?? null,
  }));
  const resourceRows = [];

  const query = async (sql, params = []) => {
    const normalized = sql.replace(/\s+/g, " ").trim().toUpperCase();

    if (
      normalized === "BEGIN" ||
      normalized === "COMMIT" ||
      normalized === "ROLLBACK"
    ) {
      return { rows: [] };
    }

    if (
      normalized.startsWith("SELECT * FROM VOLUNTEER_CHECK_INS WHERE ID = $1") ||
      normalized.startsWith("SELECT ID, VOLUNTEER_ID, INCIDENT_ID, SUBMITTED_AT FROM VOLUNTEER_CHECK_INS WHERE ID = $1")
    ) {
      const checkInId = Number(params[0]);
      const found = checkIns.find((c) => c.id === checkInId);
      return { rows: found ? [found] : [] };
    }

    if (normalized.startsWith("SELECT RESOURCE_TYPE FROM VOLUNTEER_CHECK_IN_RESOURCES WHERE CHECK_IN_ID = $1")) {
      const checkInId = Number(params[0]);
      const matching = resourceRows
        .filter((r) => r.check_in_id === checkInId)
        .sort((a, b) => a.resource_type.localeCompare(b.resource_type));
      return { rows: matching };
    }

    if (normalized.startsWith("DELETE FROM VOLUNTEER_CHECK_IN_RESOURCES WHERE CHECK_IN_ID = $1")) {
      const checkInId = Number(params[0]);
      for (let i = resourceRows.length - 1; i >= 0; i--) {
        if (resourceRows[i].check_in_id === checkInId) {
          resourceRows.splice(i, 1);
        }
      }
      return { rows: [] };
    }

    if (normalized.startsWith("INSERT INTO VOLUNTEER_CHECK_IN_RESOURCES")) {
      const [checkInId, volunteerId, incidentId, types] = params;
      const inserted = [];
      for (const resourceType of types ?? []) {
        const row = {
          check_in_id: Number(checkInId),
          volunteer_id: Number(volunteerId),
          incident_id: Number(incidentId),
          resource_type: resourceType,
        };
        resourceRows.push(row);
        inserted.push({ resource_type: resourceType });
      }
      return { rows: inserted };
    }

    return { rows: [] };
  };

  return {
    checkIns,
    resourceRows,
    query,
    connect: async () => ({
      query,
      release() {},
    }),
  };
}

describe("DT-193: Associate the resources with the correct volunteer and incident", () => {
  it("retrieves the check-in by ID with its volunteer, incident, and associated resources via getCheckInById", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
    ]);

    const checkIn = await getCheckInById(10, { db });
    assert.equal(checkIn.id, 10);
    assert.equal(checkIn.volunteerId, 42);
    assert.equal(checkIn.incidentId, 300);
    assert.deepEqual(checkIn.resources, []);

    const viaModel = await VolunteerCheckIn.getCheckInById(10, db);
    assert.equal(viaModel.id, 10);
    assert.equal(viaModel.volunteerId, 42);
    assert.equal(viaModel.incidentId, 300);
  });

  it("associates saved resources with the correct check-in, volunteer, and incident", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
      { id: 11, volunteerId: 99, incidentId: 400 },
    ]);

    const saved = await saveVolunteerResources(
      10,
      ["vehicle", "k9", "radio"],
      { volunteerId: 42, incidentId: 300, db }
    );

    assert.deepEqual(saved, {
      checkInId: 10,
      volunteerId: 42,
      incidentId: 300,
      resources: ["vehicle", "k9", "radio"],
    });

    // Verify database rows store check_in_id, volunteer_id, and incident_id matching check-in 10
    assert.equal(db.resourceRows.length, 3);
    for (const row of db.resourceRows) {
      assert.equal(row.check_in_id, 10);
      assert.equal(row.volunteer_id, 42);
      assert.equal(row.incident_id, 300);
    }

    // Check-in 11 remains untouched
    const otherCheckIn = await getCheckInById(11, { db });
    assert.deepEqual(otherCheckIn.resources, []);
  });

  it("rejects assigning resources to another volunteer's check-in (403 Forbidden)", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
    ]);

    await assert.rejects(
      async () => {
        await saveVolunteerResources(
          10,
          ["vehicle"],
          { volunteerId: 99, db }
        );
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /cannot be assigned to another volunteer's check-in/i);
        return true;
      }
    );

    // Ensure no resources were written
    assert.equal(db.resourceRows.length, 0);
  });

  it("rejects assigning resources when the check-in belongs to a different incident (409 Conflict)", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
    ]);

    await assert.rejects(
      async () => {
        await saveVolunteerResources(
          10,
          ["radio"],
          { volunteerId: 42, incidentId: 999, db }
        );
      },
      (err) => {
        assert.equal(err.status, 409);
        assert.match(err.message, /belongs to a different incident/i);
        return true;
      }
    );
  });

  it("returns an error for invalid or missing check-in IDs (400 Bad Request / 404 Not Found)", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
    ]);

    for (const badId of [undefined, null, "", "abc", 0, -5, 1.5]) {
      await assert.rejects(
        async () => {
          await getCheckInById(badId, { db });
        },
        (err) => {
          assert.equal(err.status, 400);
          return true;
        }
      );
    }

    // Non-existent check-in ID returns 404
    await assert.rejects(
      async () => {
        await getCheckInById(9999, { db });
      },
      (err) => {
        assert.equal(err.status, 404);
        assert.match(err.message, /check-in doesn't exist/i);
        return true;
      }
    );
  });

  it("enforces ownership and ID validation through the Express controller functions", async () => {
    const db = createInMemoryCheckInDb([
      { id: 10, volunteerId: 42, incidentId: 300 },
    ]);

    // 1. Another volunteer trying to save resources via controller gets 403
    let errCaptured = null;
    await saveCheckInResources(
      {
        params: { checkInId: "10" },
        body: { volunteerId: 77, resources: ["vehicle"] },
        app: { locals: { db } },
      },
      {
        locals: { checkInResources: { checkInId: 10, resources: ["vehicle"] } },
        status() {
          return this;
        },
        json() {},
      },
      (err) => {
        errCaptured = err;
      }
    );
    assert.ok(errCaptured);
    assert.equal(errCaptured.status, 403);

    // 2. Correct volunteer saves resources via controller and gets 200
    let savedStatus = null;
    let savedBody = null;
    let nextErr = null;
    await saveCheckInResources(
      {
        params: { checkInId: "10" },
        body: { volunteerId: 42, incidentId: 300, resources: ["vehicle", "k9"] },
        app: { locals: { db } },
      },
      {
        locals: { checkInResources: { checkInId: 10, resources: ["vehicle", "k9"] } },
        status(code) {
          savedStatus = code;
          return this;
        },
        json(payload) {
          savedBody = payload;
        },
      },
      (err) => {
        nextErr = err;
      }
    );
    assert.equal(nextErr, null);
    assert.equal(savedStatus, 200);
    assert.deepEqual(savedBody, {
      checkInId: 10,
      volunteerId: 42,
      incidentId: 300,
      resources: ["vehicle", "k9"],
    });

    // 3. GET /api/check-ins/:checkInId returns the check-in with its associated resources
    let getStatus = null;
    let getBody = null;
    await getCheckIn(
      {
        params: { checkInId: "10" },
        app: { locals: { db } },
      },
      {
        status(code) {
          getStatus = code;
          return this;
        },
        json(payload) {
          getBody = payload;
        },
      },
      (err) => {
        nextErr = err;
      }
    );
    assert.equal(nextErr, null);
    assert.equal(getStatus, 200);
    assert.equal(getBody.id, 10);
    assert.equal(getBody.volunteerId, 42);
    assert.equal(getBody.incidentId, 300);
    assert.deepEqual(getBody.resources, ["k9", "vehicle"]);
  });
});
