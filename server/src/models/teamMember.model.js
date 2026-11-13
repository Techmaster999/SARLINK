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

export async function saveTeamMemberOrder(teamId, orderedVolunteerIds, db = pool) {
  const { rows } = await db.query(
    `WITH requested_order AS (
       SELECT volunteer_id, (ordinality - 1)::integer AS position
       FROM unnest($2::text[]) WITH ORDINALITY AS requested(volunteer_id, ordinality)
     ),
     order_validation AS (
       SELECT
         COUNT(*) = (SELECT COUNT(*) FROM team_members WHERE team_id = $1)
         AND COUNT(DISTINCT volunteer_id) = COUNT(*)
         AND NOT EXISTS (
           SELECT 1
           FROM requested_order requested
           LEFT JOIN team_members membership
             ON membership.volunteer_id = requested.volunteer_id
            AND membership.team_id = $1
           WHERE membership.volunteer_id IS NULL
         ) AS is_valid
       FROM requested_order
     ),
     updated_order AS (
       UPDATE team_members AS membership
       SET position = requested.position
       FROM requested_order AS requested
       CROSS JOIN order_validation
       WHERE order_validation.is_valid
         AND membership.team_id = $1
         AND membership.volunteer_id = requested.volunteer_id
       RETURNING membership.volunteer_id
     )
     SELECT EXISTS (SELECT 1 FROM teams WHERE id = $1) AS team_exists,
            COALESCE((SELECT is_valid FROM order_validation), FALSE) AS order_valid,
            (SELECT COUNT(*)::integer FROM updated_order) AS updated_count`,
    [teamId, orderedVolunteerIds],
  );
  const row = rows[0];
  return {
    teamExists: row.team_exists,
    orderValid: row.order_valid,
    updatedCount: Number(row.updated_count),
  };
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
