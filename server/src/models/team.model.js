import { pool } from '../config/db.js';

export async function insertTeam(team, db = pool) {
  // Parameterized ($1, $2, …) — never build SQL by concatenating user input.
  const { rows } = await db.query(
    `INSERT INTO teams (incident_id, name, leader_id, color)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [team.incidentId, team.name, team.leaderId, team.color],
  );
  return toTeam(rows[0]);
}

export async function findTeamById(teamId, db = pool) {
  const { rows } = await db.query(
    `SELECT id, name
       FROM teams
      WHERE id = $1`,
    [teamId],
  );
  return rows[0] ?? null;
}

export async function findTeamsByIncident(incidentId, db = pool) {
  const { rows } = await db.query(
    `SELECT *
       FROM teams
      WHERE incident_id = $1
      ORDER BY created_at ASC, id ASC`,
    [incidentId],
  );
  return rows.map(toTeam);
}

// Database row (snake_case) → API shape (camelCase, same names the request uses).
function toTeam(row) {
  return {
    id: Number(row.id),
    incidentId: Number(row.incident_id),
    name: row.name,
    leaderId: row.leader_id,
    color: row.color,
    createdAt: row.created_at.toISOString(),
  };
}
