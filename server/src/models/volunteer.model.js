import { pool } from '../config/db.js';

/**
 * Finds every volunteer heading to the incident: status 'Incoming' and not already
 * on a team. Ordered by soonest ETA first (volunteers with no ETA go last).
 *
 * Returns null if the incident doesn't exist, or an array (possibly empty) if it does.
 */
export async function findIncomingVolunteers(incidentId, db = pool) {
  // Parameterized ($1) — never build SQL by concatenating user input.
  // Starting from the incident means one query tells us both whether the incident
  // exists (no rows) and whether anyone is incoming (one row with no volunteer).
  const { rows } = await db.query(
    `SELECT i.id     AS incident_id,
            v.id     AS volunteer_id,
            v.name,
            v.role,
            v.eta,
            t.id     AS team_id,
            t.name   AS team_name
       FROM incidents i
       LEFT JOIN volunteers v
              ON v.incident_id = i.id
             AND v.status = 'Incoming'
             AND NOT EXISTS (
                   SELECT 1 FROM team_members tm WHERE tm.volunteer_id = v.id::text
                 )
       LEFT JOIN teams t
              ON t.id = v.requested_team_id
             AND t.incident_id = i.id
      WHERE i.id = $1
      ORDER BY v.eta ASC NULLS LAST, v.name ASC, v.id ASC`,
    [incidentId],
  );

  if (rows.length === 0) return null;
  return rows.filter((row) => row.volunteer_id != null).map(toIncomingVolunteer);
}

export async function saveVolunteerStatus(volunteerId, status, db = pool) {
  const { rows } = await db.query(
    `UPDATE volunteers
        SET status = $2
      WHERE id::text = $1
      RETURNING id, status`,
    [volunteerId, status],
  );
  return rows[0] ? { volunteerId: String(rows[0].id), status: rows[0].status } : null;
}

/**
 * Saves a volunteer's check-in to the incident with status 'Incoming' and returns
 * the saved check-in along with the incident's name (for the confirmation).
 */
export async function insertCheckIn({ incidentId, name, role, eta }, db = pool) {
  const { rows } = await db.query(
    `WITH v AS (
       INSERT INTO volunteers (incident_id, name, role, eta, status)
       VALUES ($1, $2, $3, $4, 'Incoming')
       RETURNING *
     )
     SELECT v.*, i.incident_name
       FROM v
       JOIN incidents i ON i.id = v.incident_id`,
    [incidentId, name, role, eta ?? null],
  );
  const row = rows[0];
  return {
    id: Number(row.id),
    incidentId: Number(row.incident_id),
    incidentName: row.incident_name,
    name: row.name,
    role: row.role,
    status: row.status,
    eta: row.eta ? row.eta.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

// Database row (snake_case) → API shape (camelCase).
function toIncomingVolunteer(row) {
  return {
    id: Number(row.volunteer_id),
    name: row.name,
    role: row.role ?? null,
    // No requested team → null instead of an error.
    requestedTeam: row.team_id == null ? null : { id: Number(row.team_id), name: row.team_name },
    eta: row.eta ? row.eta.toISOString() : null,
  };
}
