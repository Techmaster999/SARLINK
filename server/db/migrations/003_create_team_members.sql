BEGIN;

-- Which team each volunteer is currently on.
-- volunteer_id is the PRIMARY KEY, so a volunteer can only be on one team at a time:
-- reassigning replaces their row instead of adding a second one.
-- TODO (volunteers ticket): once a volunteers table exists, add
--   REFERENCES volunteers(id) ON DELETE CASCADE to volunteer_id (and match its type).
CREATE TABLE IF NOT EXISTS team_members (
  volunteer_id TEXT        PRIMARY KEY CHECK (length(btrim(volunteer_id)) BETWEEN 1 AND 100),

  -- Can't point at a team that doesn't exist; deleting a team removes its memberships.
  team_id      BIGINT      NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  assigned_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast "who is on this team?" lookups for the dashboard.
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members (team_id);

COMMIT;
