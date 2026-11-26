BEGIN;

-- The volunteer's team assignment (role) for the incident, e.g. 'k9-area' or 'gnd-1'.
-- Values come from the incident's called teams (incident_called_teams.team_id).
-- Empty for volunteers saved before check-in recorded a role.
ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS role TEXT
  CHECK (role IS NULL OR length(btrim(role)) BETWEEN 1 AND 100);

COMMIT;
