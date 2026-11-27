import { pool } from '../config/db.js';

/**
 * Inserts a new volunteer check-in record with the volunteer's attached name and SAR badge number.
 */
export async function insertVolunteerCheckIn(
  {
    volunteerId,
    incidentId,
    name,
    badgeNumber,
    arrivalTime = null,
    checkoutTime = null,
    teamId = null,
  },
  db = pool,
) {
  const { rows } = await db.query(
    `INSERT INTO volunteer_check_ins (
       volunteer_id,
       incident_id,
       volunteer_name,
       sar_badge_number,
       arrival_time,
       checkout_time,
       team_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      volunteerId,
      incidentId,
      name,
      badgeNumber,
      arrivalTime,
      checkoutTime,
      teamId,
    ],
  );
  return rows[0] ? toCheckIn(rows[0]) : null;
}

/**
 * Saves the team on the check-in. Returns the updated check-in, or null if the
 * check-in doesn't exist. The database rejects a team that doesn't exist or belongs
 * to a different incident (foreign key volunteer_check_ins_team_fkey).
 */
export async function saveCheckInTeam(checkInId, teamId, db = pool) {
  // Parameterized ($1, $2) — never build SQL by concatenating user input.
  const { rows } = await db.query(
    `UPDATE volunteer_check_ins
        SET team_id = $2, team_assigned_at = now()
      WHERE id = $1
      RETURNING *`,
    [checkInId, teamId],
  );
  return rows[0] ? toCheckIn(rows[0]) : null;
}

/**
 * Marks the check-in as submitted (only the first time). Returns { checkIn, locked },
 * where locked is false if it was already submitted, or null if the check-in doesn't exist.
 */
export async function markCheckInSubmitted(checkInId, db = pool) {
  const { rows } = await db.query(
    `UPDATE volunteer_check_ins
        SET submitted_at = now()
      WHERE id = $1 AND submitted_at IS NULL
      RETURNING *`,
    [checkInId],
  );
  if (rows[0]) return { checkIn: toCheckIn(rows[0]), locked: true };

  const existing = await db.query(`SELECT * FROM volunteer_check_ins WHERE id = $1`, [checkInId]);
  return existing.rows[0] ? { checkIn: toCheckIn(existing.rows[0]), locked: false } : null;
}

/**
 * Replaces the resources saved on a check-in, in one transaction. Each row carries the
 * check-in's volunteer and incident (the foreign key keeps them matching).
 * Returns null if the check-in doesn't exist, { locked: true } if it was already
 * submitted (nothing is changed), otherwise { checkInId, volunteerId, incidentId, resources }.
 */
export async function replaceCheckInResources(checkInId, resourceTypes, db = pool) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // FOR UPDATE: a submit arriving at the same time waits until this save is done.
    const { rows: found } = await client.query(
      `SELECT id, volunteer_id, incident_id, submitted_at
         FROM volunteer_check_ins
        WHERE id = $1
        FOR UPDATE`,
      [checkInId],
    );
    const checkIn = found[0];
    if (!checkIn || checkIn.submitted_at != null) {
      await client.query("ROLLBACK");
      return checkIn ? { locked: true } : null;
    }

    await client.query(`DELETE FROM volunteer_check_in_resources WHERE check_in_id = $1`, [checkInId]);
    const { rows } = await client.query(
      `INSERT INTO volunteer_check_in_resources (check_in_id, volunteer_id, incident_id, resource_type)
       SELECT $1, $2, $3, unnest($4::text[])
       RETURNING resource_type`,
      [checkIn.id, checkIn.volunteer_id, checkIn.incident_id, resourceTypes],
    );

    await client.query("COMMIT");
    return {
      checkInId: Number(checkIn.id),
      volunteerId: Number(checkIn.volunteer_id),
      incidentId: Number(checkIn.incident_id),
      resources: rows.map((row) => row.resource_type),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Database row (snake_case) → API shape (camelCase).
function toCheckIn(row) {
  return {
    id: Number(row.id),
    volunteerId: row.volunteer_id == null ? null : Number(row.volunteer_id),
    incidentId: Number(row.incident_id),
    name: row.volunteer_name ?? row.name ?? null,
    volunteerName: row.volunteer_name ?? row.name ?? null,
    badgeNumber: row.sar_badge_number ?? row.badge_number ?? null,
    sarBadgeNumber: row.sar_badge_number ?? row.badge_number ?? null,
    arrivalTime: row.arrival_time
      ? row.arrival_time instanceof Date
        ? row.arrival_time.toISOString()
        : String(row.arrival_time)
      : null,
    checkoutTime: row.checkout_time
      ? row.checkout_time instanceof Date
        ? row.checkout_time.toISOString()
        : String(row.checkout_time)
      : null,
    teamId: row.team_id == null ? null : Number(row.team_id),
    checkedInAt:
      row.checked_in_at instanceof Date
        ? row.checked_in_at.toISOString()
        : String(row.checked_in_at ?? new Date().toISOString()),
    teamAssignedAt: row.team_assigned_at ? row.team_assigned_at.toISOString() : null,
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    isLocked: row.submitted_at != null, // the check-in page should render read-only when true
  };
}
