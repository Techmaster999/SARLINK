import { pool } from '../config/db.js';

export async function fetchActiveIncidents({ search } = {}) {
    // Escape LIKE wildcards so the user's text matches literally.
    const pattern = search ? `%${search.replace(/[\\%_]/g, '\\$&')}%` : null;
    const { rows } = await pool.query(
        `SELECT id, incident_name, case_id, occurred_at, location, coordinator,
                personnel, map_url, radio_primary, radio_backup,
                mutual_aid, mutual_aid_county, created_at
           FROM incidents
          WHERE $1::text IS NULL
             OR incident_name     ILIKE $1 ESCAPE '\\'
             OR case_id           ILIKE $1 ESCAPE '\\'
             OR location          ILIKE $1 ESCAPE '\\'
             OR coordinator       ILIKE $1 ESCAPE '\\'
             OR mutual_aid_county ILIKE $1 ESCAPE '\\'
             OR personnel         ILIKE $1 ESCAPE '\\'
          ORDER BY occurred_at DESC`,
        [pattern],
    );
    return rows.map(toDashboardIncident);
}

export async function insertIncident(incident, db = pool) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Parameterized ($1, $2, …) — never build SQL by concatenating user input.
    const { rows } = await client.query(
      `INSERT INTO incidents (
         incident_name, case_id, occurred_at, location, coordinator,
         personnel, map_url, radio_primary, radio_backup,
         mutual_aid, mutual_aid_county
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        incident.incidentName,
        incident.caseId,
        incident.dateTime,
        incident.location,
        incident.coordinator,
        blankToNull(incident.personnel),
        blankToNull(incident.mapUrl),
        blankToNull(incident.radioPrimary),
        blankToNull(incident.radioBackup),
        incident.mutualAid,
        incident.mutualAid ? incident.mutualAidCounty : null,
      ],
    );
    const row = rows[0];

    const teamIds = incident.calledTeamIds ?? [];
    if (teamIds.length > 0) {
      // One INSERT for all teams: unnest turns the two arrays into rows.
      await client.query(
        `INSERT INTO incident_called_teams (incident_id, team_id, position)
         SELECT $1, team_id, position
         FROM unnest($2::text[], $3::int[]) AS t(team_id, position)`,
        [row.id, teamIds, teamIds.map((_, i) => i)],
      );
    }

    await client.query("COMMIT");
    return toIncident(row, teamIds);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

function blankToNull(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

function toDashboardIncident(row) {
  return {
    id: row.case_id,
    name: row.incident_name,
    status: "active",
    type: "SAR",
    location: row.location,
    operationalPeriods: 1,
    mutualAid: row.mutual_aid,
    mutualAidCounty: row.mutual_aid_county,
    missingPersons: 0,
    reportedAt: row.occurred_at.toISOString(),
    coordinator: row.coordinator,
    caseId: row.case_id,
    incidentName: row.incident_name,
    dateTime: row.occurred_at.toISOString(),
    personnel: row.personnel ?? "",
    mapUrl: row.map_url ?? "",
    radioPrimary: row.radio_primary ?? "",
    radioBackup: row.radio_backup ?? "",
    createdAt: row.created_at.toISOString(),
  };
}

// Database row (snake_case) → API shape (camelCase, same names the form uses).
function toIncident(row, calledTeamIds) {
  return {
    id: Number(row.id),
    incidentName: row.incident_name,
    caseId: row.case_id,
    dateTime: row.occurred_at.toISOString(),
    location: row.location,
    coordinator: row.coordinator,
    personnel: row.personnel ?? "",
    mapUrl: row.map_url ?? "",
    radioPrimary: row.radio_primary ?? "",
    radioBackup: row.radio_backup ?? "",
    mutualAid: row.mutual_aid,
    mutualAidCounty: row.mutual_aid_county,
    calledTeamIds,
    createdAt: row.created_at.toISOString(),
  };
}