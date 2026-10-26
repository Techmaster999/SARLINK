INSERT INTO incidents (
  incident_name, case_id, occurred_at, location, coordinator, mutual_aid
) VALUES
  ('Test incident A', 'DEV-001', now(), 'Training area', 'SAR coordinator', FALSE),
  ('Test incident B', 'DEV-002', now(), 'Training area', 'SAR coordinator', FALSE)
ON CONFLICT (case_id) DO NOTHING;