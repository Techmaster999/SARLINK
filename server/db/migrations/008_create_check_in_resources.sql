BEGIN;

-- Lets a resource row point at a check-in AND its volunteer and incident in one foreign key,
-- so a resource can never be filed under the wrong volunteer or incident.
CREATE UNIQUE INDEX IF NOT EXISTS volunteer_check_ins_id_volunteer_incident_key
  ON volunteer_check_ins (id, volunteer_id, incident_id);

-- The resources a volunteer said they brought when checking in (one row per resource type).
-- volunteer_id and incident_id are copied from the check-in; the foreign key keeps them equal.
CREATE TABLE IF NOT EXISTS volunteer_check_in_resources (
  check_in_id   BIGINT      NOT NULL,
  volunteer_id  BIGINT      NOT NULL,
  incident_id   BIGINT      NOT NULL,

  -- Keep this list in sync with RESOURCE_TYPES in src/middleware/validateCheckInResources.js.
  resource_type TEXT        NOT NULL CHECK (resource_type IN (
                  'vehicle', 'four_wheel_drive', 'atv', 'boat', 'drone', 'k9',
                  'radio', 'gps', 'first_aid_kit', 'medical_training',
                  'rope_rescue_gear', 'night_vision'
                )),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A check-in can list each resource type only once.
  CONSTRAINT volunteer_check_in_resources_pkey PRIMARY KEY (check_in_id, resource_type),

  CONSTRAINT volunteer_check_in_resources_check_in_fkey
    FOREIGN KEY (check_in_id, volunteer_id, incident_id)
    REFERENCES volunteer_check_ins (id, volunteer_id, incident_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- "Which volunteers at this incident have a boat?" lookups.
CREATE INDEX IF NOT EXISTS volunteer_check_in_resources_incident_type_idx
  ON volunteer_check_in_resources (incident_id, resource_type);

COMMIT;
