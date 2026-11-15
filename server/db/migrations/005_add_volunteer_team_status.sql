BEGIN;

-- Volunteers assigned to the command post are on standby; all other teams are
-- field teams and therefore use the assigned status.
ALTER TABLE volunteers
  DROP CONSTRAINT IF EXISTS volunteers_status_check;

ALTER TABLE volunteers
  ADD CONSTRAINT volunteers_status_check
  CHECK (status IN ('Incoming', 'Arrived', 'Assigned', 'Standby'));

COMMIT;
