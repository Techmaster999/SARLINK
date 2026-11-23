BEGIN;

-- Set once when the volunteer submits their check-in. After that the check-in is read-only.
ALTER TABLE volunteer_check_ins
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Once submitted, the volunteer's values (arrival time, incident, checkout time and any
-- column added later) can't change, and the lock can't be removed. Only the IST-managed
-- team assignment columns may still change. Enforced here so no request path can skip it.
CREATE OR REPLACE FUNCTION prevent_submitted_check_in_edits() RETURNS trigger AS $$
BEGIN
  IF OLD.submitted_at IS NOT NULL
     AND (to_jsonb(NEW) - 'team_id' - 'team_assigned_at')
         IS DISTINCT FROM (to_jsonb(OLD) - 'team_id' - 'team_assigned_at') THEN
    RAISE EXCEPTION 'Check-in % was already submitted and cannot be edited.', OLD.id
      USING ERRCODE = 'SL409';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS volunteer_check_ins_lock_submitted ON volunteer_check_ins;
CREATE TRIGGER volunteer_check_ins_lock_submitted
  BEFORE UPDATE ON volunteer_check_ins
  FOR EACH ROW EXECUTE FUNCTION prevent_submitted_check_in_edits();

COMMIT;
