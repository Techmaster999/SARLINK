BEGIN;

ALTER TABLE volunteer_check_ins
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

ALTER TABLE volunteer_check_ins
  DROP CONSTRAINT IF EXISTS volunteer_check_ins_volunteer_key;

-- A volunteer can have at most one active (unclosed) incident check-in at a time.
CREATE UNIQUE INDEX IF NOT EXISTS volunteer_check_ins_active_volunteer_key
  ON volunteer_check_ins (volunteer_id)
  WHERE closed_at IS NULL;

COMMIT;
