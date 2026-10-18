import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import "./style.css";

function renderIncidentOverview() {
  const incidents = [
    {
      id: "INC-001",
      title: "Network outage",
      location: "Downtown facility",
      status: "Active",
    },
    {
      id: "INC-002",
      title: "Power disruption",
      location: "North campus",
      status: "Investigating",
    },
  ];

  return (
    <section className="incident-overview">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Incident Hub</p>
          <h1>Ongoing incidents</h1>
        </div>

        <span className="incident-count">
          {incidents.length} active
        </span>
      </div>

      <div className="incident-list">
        {incidents.map((incident) => (
          <article className="incident-card" key={incident.id}>
            <div>
              <p className="incident-id">{incident.id}</p>
              <h2>{incident.title}</h2>
              <p>{incident.location}</p>
            </div>

            <span className="status-badge">{incident.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function IncidentHubLayout() {
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
          <Route
            path="/"
            element={renderIncidentOverview()}
          />

          <Route
            path="/incidents"
            element={<h2>All incidents</h2>}
          />

          <Route
            path="/teams"
            element={<h2>Response teams</h2>}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <IncidentHubLayout />
    </BrowserRouter>
  );
}

export default App;