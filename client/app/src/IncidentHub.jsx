/* Incident Hub - React application for monitoring ongoing incidents and field team assignments */
import { Link, Routes, Route } from "react-router-dom";
import "./IncidentHub.css";

// Sample data for ongoing incidents
const incidents = [
  {
    id: "INC-001",
    team: "Team Alpha",
    incident: "Network outage",
    location: "Downtown facility",
    personnel: 12,
    status: "Active",
    updated: "10:45 AM",
  },
  {
    id: "INC-002",
    team: "Team Bravo",
    incident: "Power disruption",
    location: "North campus",
    personnel: 8,
    status: "Active",
    updated: "9:30 AM",
  },
];

// acceptance criteria: include dashboard overview with summary cards and table of ongoing incidents
function IncidentOverview() {
  // Summary values are derived from the data so they always stay in sync
  const teamCount = new Set(incidents.map((incident) => incident.team)).size;
  const personnelCount = incidents.reduce(
    (total, incident) => total + incident.personnel,
    0
  );

  return (
    <div className="dashboard">
      <section className="dashboard-overview">
        <div className="dashboard-heading">
          <div className="heading-copy">
            <p className="eyebrow">Incident Hub</p>

            <h2 className="dashboard-title">
              Incident teams dashboard
            </h2>

            <p className="dashboard-description">
              Monitor ongoing incidents and field team assignments.
            </p>
          </div>

          <button className="secondary-button">
            New incident
          </button>
        </div>

        <div className="incident-summary">
          <article className="summary-card">
            <p className="summary-label">Ongoing incidents</p>
            <p className="summary-value">{incidents.length}</p>
            <p className="summary-detail">Currently active</p>
          </article>

          <article className="summary-card">
            <p className="summary-label">Response teams</p>
            <p className="summary-value">{teamCount}</p>
            <p className="summary-detail">Teams assigned</p>
          </article>

          <article className="summary-card">
            <p className="summary-label">Personnel deployed</p>
            <p className="summary-value">{personnelCount}</p>
            <p className="summary-detail">Currently in the field</p>
          </article>
        </div>
      </section>

      <section className="field-team-assignments">
        <div className="assignment-table">
          <div className="table-heading">
            <div className="table-heading-copy">
              <h2 className="table-title">
                Ongoing incidents
              </h2>

              <p className="table-detail">
                Current field team assignments
              </p>
            </div>

            <span className="brand-badge">
              Active
            </span>
          </div>

          <div className="table-header">
            <p className="table-label">Team</p>
            <p className="table-label">Incident</p>
            <p className="table-label">Assignment / Location</p>
            <p className="table-label">Personnel</p>
            <p className="table-label">Status</p>
            <p className="table-label">Last update</p>
          </div>

          {incidents.map((incident) => (
            <div className="table-row" key={incident.id}>
              <div className="table-cell">
                <p className="table-label">{incident.team}</p>
                <p className="table-detail">{incident.id}</p>
              </div>

              <div className="table-cell">
                <p className="table-label">{incident.incident}</p>
                <p className="table-detail">{incident.id}</p>
              </div>

              <div className="table-cell">
                <p className="table-label">{incident.location}</p>
                <p className="table-detail">
                  Field response location
                </p>
              </div>

              <div className="table-cell">
                <p className="table-label">{incident.personnel}</p>
              </div>

              <div className="table-cell">
                <span className="brand-badge">
                  {incident.status}
                </span>
              </div>

              <div className="table-cell">
                <p className="table-label">Today</p>
                <p className="table-detail">{incident.updated}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// acceptance criteria: include header and sidebar navigation
export default function IncidentHubLayout() {
  return (
    <div className="incident-hub">
      <header className="header">
        <h1>Incident Hub</h1>

        <div className="header-actions">
          <span>Admin</span>
          <button>Notifications</button>
        </div>
      </header>

      <aside className="sidebar">
        <nav>
          <Link to="/">Overview</Link>
          <Link to="/incidents">Incidents</Link>
          <Link to="/teams">Response teams</Link>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<IncidentOverview />} />
          <Route path="/incidents" element={<h2>All incidents</h2>} />
          <Route path="/teams" element={<h2>Response teams</h2>} />
        </Routes>
      </main>
    </div>
  );
}