BEGIN;

CREATE TABLE IF NOT EXISTS incidents (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY

  -- Required on the form
  incident_name       TEXT            NOT NULL CHECK (length(btrim(incident_name)) BETWEEN 1 AND 120),
  case_id             TEXT            NOT NULL UNIQUE CHECK (length(btrim(case_id)) BETWEEN 1 AND 40),
  occured_at          TIMESTAMPTZ     NOT NULL,
  location            TEXT            NOT NULL CHECK (length(btrim(location)) BETWEEN 1 AND 200),
  coordinator         TEXT            NOT NULL CHECK (length(btrim(coordinator)) BETWEEN 1 AND 100),

  -- Optional on the form (stored as NULL when left blank)
  personnel           TEXT            CHECK (length(personnel) <= 200),
  map_url             TEXT            CHECK (map_url ~* '^https?://'),
  radio_primary       TEXT            CHECK (length(radio_primary) <= 50),
  radio_backup        TEXT            CHECK (length(radio_backup) <= 50),

  -- Mutual Aid: a county is required when checked, and must be empty when not
  mutual_aid                          BOOLEAN NOT NULL DEFAULT FALSE,
  mutual_aid_county   TEXT,
  CONSTRAINT mutual_aid_county_matches CHECK (
    (mutual_aid AND mutual_aid_county IS NOT NULL) OR (NOT mutual_aid AND mutual_aid_county IS NULL)
  ),
  
  created_at          TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_called_teams (
  incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  team_id     TEXT   NOT NULL,
  PRIMARY KEY (incident_id, team_id)
);

COMMIT;