# Agent notes

- Incident data flows through `fetchAndMapIncidents()` in `client/app/src/pages/IncidentHub.jsx`.
- It checks `/api/auth/session`, fetches `/api/incidents`, and maps quick-view, detail, and export fields.
- The API query and mapping live in `server/src/models/incident.model.js`; keep permission checks before returning records.
- Preserve the existing loading, empty, unauthorized, error, retry, and export behavior.
