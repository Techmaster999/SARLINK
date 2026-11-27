import { pool } from '../config/db.js';

/**
 * Finds an active (unclosed) check-in for the given volunteer, or null if none exists.
 */
export async function findActiveCheckInByVolunteerId(volunteerId, db = pool) {
  const { rows } = await db.query(
    `SELECT *
       FROM volunteer_check_ins
      WHERE volunteer_id = $1
        AND closed_at IS NULL
      ORDER BY checked_in_at DESC, id DESC
      LIMIT 1`,
    [volunteerId],
  );
  const row = rows[0];
  if (!row) return null;
  if (
    row.closed_at != null ||
    row.closedAt != null ||
    row.is_closed === true ||
    row.isClosed === true ||
    String(row.status ?? '').toLowerCase() === 'closed'
  ) {
    return null;
  }
  return toCheckIn(row);
}

/**
 * Inserts a new volunteer check-in for an incident.
 */
export async function insertVolunteerCheckIn(
  { volunteerId, incidentId, teamId = null },
  db = pool,
) {
  const { rows } = await db.query(
    `INSERT INTO volunteer_check_ins (volunteer_id, incident_id, team_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [volunteerId, incidentId, teamId],
  );
  return rows[0] ? toCheckIn(rows[0]) : null;
}

/**
 * Marks an existing check-in as closed so the volunteer can check into a future incident.
 */
export async function markCheckInClosed(checkInId, db = pool) {
  const { rows } = await db.query(
    `UPDATE volunteer_check_ins
        SET closed_at = COALESCE(closed_at, now())
      WHERE id = $1
      RETURNING *`,
    [checkInId],
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
    volunteerId: Number(row.volunteer_id),
    incidentId: Number(row.incident_id),
    teamId: row.team_id == null ? null : Number(row.team_id),
    checkedInAt:
      row.checked_in_at instanceof Date
        ? row.checked_in_at.toISOString()
        : String(row.checked_in_at ?? new Date().toISOString()),
    teamAssignedAt: row.team_assigned_at ? row.team_assigned_at.toISOString() : null,
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    closedAt: row.closed_at
      ? row.closed_at instanceof Date
        ? row.closed_at.toISOString()
        : String(row.closed_at)
      : null,
    isClosed: row.closed_at != null,
    isLocked: row.submitted_at != null, // the check-in page should render read-only when true
  };
}
