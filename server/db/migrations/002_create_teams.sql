BEGIN;

CREATE TABLE IF NOT EXISTS teams (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Each team belongs to exactly one incident and only shows up for it.
  incident_id BIGINT      NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,

  name        TEXT        NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 60),
  leader_id   TEXT        NOT NULL CHECK (length(btrim(leader_id)) BETWEEN 1 AND 100),
  color       TEXT        NOT NULL CHECK (color ~* '^#([0-9a-f]{3}|[0-9a-f]{6})$'),

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team names can't repeat within the same incident ("Alpha" and " alpha " count as the same).
CREATE UNIQUE INDEX IF NOT EXISTS teams_incident_name_key
  ON teams (incident_id, lower(btrim(name)));

COMMIT;
