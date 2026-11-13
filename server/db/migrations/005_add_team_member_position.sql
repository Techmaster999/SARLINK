BEGIN;

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS position INTEGER;

WITH initial_order AS (
  SELECT
    volunteer_id,
    (ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY assigned_at, volunteer_id) - 1)::integer AS position
  FROM team_members
)
UPDATE team_members AS membership
SET position = initial_order.position
FROM initial_order
WHERE membership.volunteer_id = initial_order.volunteer_id
  AND membership.position IS NULL;

ALTER TABLE team_members
  ALTER COLUMN position SET DEFAULT 0,
  ALTER COLUMN position SET NOT NULL;

CREATE INDEX IF NOT EXISTS team_members_team_position_idx
  ON team_members (team_id, position, assigned_at, volunteer_id);

COMMIT;
