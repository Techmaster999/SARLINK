BEGIN;

-- Composite keys so a check-in can require that its volunteer and its team
-- belong to the same incident as the check-in itself (see the foreign keys below).
CREATE UNIQUE INDEX IF NOT EXISTS teams_id_incident_key ON teams (id, incident_id);
CREATE UNIQUE INDEX IF NOT EXISTS volunteers_id_incident_key ON volunteers (id, incident_id);

-- A volunteer checking in at an incident, plus the team they were placed on.
-- team_id is a single column and volunteer_id is unique, so a volunteer can never
-- have more than one team assignment.
CREATE TABLE IF NOT EXISTS volunteer_check_ins (
  id               BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  volunteer_id     BIGINT      NOT NULL,
  incident_id      BIGINT      NOT NULL,
  team_id          BIGINT,     -- empty until the volunteer is assigned to a team

  checked_in_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  team_assigned_at TIMESTAMPTZ,

  CONSTRAINT volunteer_check_ins_volunteer_key UNIQUE (volunteer_id),

  -- The volunteer must be responding to this incident.
  CONSTRAINT volunteer_check_ins_volunteer_fkey
    FOREIGN KEY (volunteer_id, incident_id)
    REFERENCES volunteers (id, incident_id) ON DELETE CASCADE,

  -- The team must exist AND belong to this incident. Deleting the team clears the assignment.
  CONSTRAINT volunteer_check_ins_team_fkey
    FOREIGN KEY (team_id, incident_id)
    REFERENCES teams (id, incident_id) ON DELETE SET NULL (team_id)
);

CREATE INDEX IF NOT EXISTS volunteer_check_ins_team_id_idx ON volunteer_check_ins (team_id);

COMMIT;
