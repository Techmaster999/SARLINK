BEGIN;

-- Volunteers responding to an incident.
-- status tracks where they are: on the way ('Incoming'), checked in at the
-- incident ('Arrived'), or placed on a team ('Assigned'/'Standby').
-- requested_team_id is the team the volunteer asked to join. It can be empty,
-- and deleting that team just clears the request.
CREATE TABLE IF NOT EXISTS volunteers (
  id                BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Each volunteer is responding to exactly one incident.
  incident_id       BIGINT      NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

  name              TEXT        NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  status            TEXT        NOT NULL DEFAULT 'Incoming'
                                CHECK (status IN ('Incoming', 'Arrived', 'Assigned')),
  requested_team_id BIGINT      REFERENCES teams(id) ON DELETE SET NULL,

  -- Approximate arrival time; can be empty if the volunteer didn't give one.
  eta               TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast "who is incoming to this incident, soonest first?" lookups for the dashboard.
CREATE INDEX IF NOT EXISTS volunteers_incident_status_eta_idx
  ON volunteers (incident_id, status, eta);

COMMIT;
