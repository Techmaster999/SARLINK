import { pool } from '../config/db.js';

/**
 * Puts the volunteer on the given team in one statement: if they were already on a
 * team, that row is replaced (removing them from the old team); otherwise a row is added.
 * Returns the new membership plus the team they came from (null if they had none).
 */
export async function upsertTeamMembership(volunteerId, teamId, db = pool) {
  // Parameterized ($1, $2) — never build SQL by concatenating user input.
  // Every part of this statement sees the same snapshot, so `prev` reads the team
  // the volunteer was on *before* the update. FOR UPDATE stops two simultaneous
  // reassignments of the same volunteer from interleaving.
  const { rows } = await db.query(
    `WITH prev AS (
       SELECT team_id FROM team_members WHERE volunteer_id = $1 FOR UPDATE
     )
     INSERT INTO team_members (volunteer_id, team_id)
     VALUES ($1, $2)
     ON CONFLICT (volunteer_id) DO UPDATE
       SET team_id = EXCLUDED.team_id, assigned_at = now()
     RETURNING volunteer_id,
               team_id,
               assigned_at,
               (SELECT team_id FROM prev) AS previous_team_id,
               (SELECT incident_id FROM teams WHERE id = team_members.team_id) AS incident_id`,
    [volunteerId, teamId],
  );
  return toMembership(rows[0]);
}

// Database row (snake_case) → API shape (camelCase).
function toMembership(row) {
  return {
    volunteerId: row.volunteer_id,
    teamId: Number(row.team_id),
    previousTeamId: row.previous_team_id == null ? null : Number(row.previous_team_id),
    incidentId: Number(row.incident_id),
    assignedAt: row.assigned_at.toISOString(),
  };
}
