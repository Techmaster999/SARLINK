# Agent notes

- Incident data flows through `fetchAndMapIncidents()` in `client/app/src/pages/IncidentHub.jsx`.
- It checks `/api/auth/session`, fetches `/api/incidents`, and maps quick-view, detail, and export fields.
- The API query and mapping live in `server/src/models/incident.model.js`; keep permission checks before returning records.
- Preserve the existing loading, empty, unauthorized, error, retry, and export behavior.
- Client routes are selected by pathname in `client/app/src/pages/main.jsx`: `/` renders sign-in, `/home` renders the authenticated landing page, `/incident-hub` renders the incident dashboard, `/switchboard--callout` renders incident creation, and `/dashboard` or `/incident-dashboard` renders the team dashboard.
- Preserve the login flow: `LoginPage` exchanges the Google authorization code with `POST /api/auth/google` using credentials, then redirects to `/home`; `HomePage` validates the session with `GET /api/auth/session` and must parse the response body exactly once.
- The server stores the authenticated user and Google refresh token in the `express-session` cookie. Keep `req.session.save()` completing before returning a successful login response, and do not remove `withCredentials`/same-origin credential handling from authenticated requests.
- `/api/auth/session` returns `{ user }` for a valid session, `{ user: null }` when signed out, and `401` with `error: "session_expired"` when Google session validation fails. Preserve these states and their existing redirects when changing auth or routing.
- The team dashboard's `DragModeIndicator` is rendered only when `isIstAccount` and `isDragEnabled` are both true; keep the indicator in normal document flow above the team board so it cannot cover volunteer or team data.
