/* Incident Hub - SARLINK search & rescue incident dashboard */
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../../src/components/Sidebar/Sidebar.jsx";
import { INCIDENT_NAV_ITEMS } from "../../../src/components/Sidebar/sidebarNavData.js";
import "./IncidentHub.css";

// Inline icons (Lucide-style paths) so no extra dependency is needed
const ICONS = {
  hex: ["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M15 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0"],
  alert: ["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", "M12 9v4", "M12 17h.01"],
  map: ["M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z", "M9 3v15", "M15 6v15"],
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h8"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M15 10a3 3 0 1 0-6 0a3 3 0 0 0 6 0", "M8 17c1-2 7-2 8 0"],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M8 14h.01", "M12 14h.01", "M16 14h.01"],
  aid: ["M21 12a9 9 0 1 0-18 0a9 9 0 0 0 18 0", "M12 8v8", "M8 12h8"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M16 7a4 4 0 1 0-8 0a4 4 0 0 0 8 0"],
  users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M13 7a4 4 0 1 0-8 0a4 4 0 0 0 8 0", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
  search: ["M19 11a8 8 0 1 0-16 0a8 8 0 0 0 16 0", "m21 21-4.3-4.3"],
  clock: ["M22 12a10 10 0 1 0-20 0a10 10 0 0 0 20 0", "M12 6v6l4 2"],
  plus: ["M5 12h14", "M12 5v14"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
};

function Icon({ name, size = 18 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

// Incidents are loaded from the API. Each item is expected to look like:
// { id, title, location, status, type, ops, aid, missing, reported, coordinator }
const INCIDENTS_ENDPOINT = "/api/incidents";

const TABS = ["All", "Active", "Standby", "Resolved"];
const countOpen = (list) => list.filter((i) => i.status !== "Resolved").length;
const sum = (list, key) => list.reduce((total, i) => total + (Number(i[key]) || 0), 0);

// The hub lives under this path (see main.jsx)
const BASE_PATH = "/incident-hub";

function StatusPill({ status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

function Missing({ count }) {
  return (
    <span className={count ? "missing" : "missing none"}>
      <Icon name="users" size={16} />
      {count || "—"}
    </span>
  );
}

function IncidentOverview({ incidents, isLoading, error }) {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const kpis = [
    { label: "Open Incidents", value: countOpen(incidents), detail: `${resolvedCount} resolved`, icon: "alert" },
    { label: "Operational Periods", value: sum(incidents, "ops"), detail: "Across all incidents", icon: "calendar" },
    { label: "Mutual Aid", value: incidents.filter((i) => i.aid).length, detail: "Open out-of-county searches", icon: "aid" },
    { label: "Persons Missing", value: sum(incidents, "missing"), detail: "Pending recovery", icon: "user", danger: true },
  ];

  const q = query.trim().toLowerCase();
  const visible = incidents.filter(
    (i) =>
      (tab === "All" || i.status === tab) &&
      (!q || [i.id, i.title, i.location, i.coordinator].join(" ").toLowerCase().includes(q))
  );

  return (
    <div className="page">
      <div className="page-heading">
        <h1 className="page-title">Incident Hub</h1>
        <p className="page-subtitle">Search &amp; Rescue operations — El Dorado County</p>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <article className="kpi-card" key={k.label}>
            <div className="kpi-copy">
              <p className="kpi-label">{k.label}</p>
              <p className="kpi-value">{k.value}</p>
              <p className="kpi-detail">{k.detail}</p>
            </div>
            <span className={k.danger ? "kpi-icon danger" : "kpi-icon"}>
              <Icon name={k.icon} size={20} />
            </span>
          </article>
        ))}
      </div>

      <section className="incidents-card">
        <div className="card-head">
          <h2 className="card-title">
            Incidents <span className="count">{incidents.length}</span>
          </h2>
          <label className="search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search incidents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? "tab active" : "tab"}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <div className="table-header">
            <span>Incident ID</span>
            <span>Incident</span>
            <span>Status</span>
            <span>Type</span>
            <span>Ops</span>
            <span>Mutual Aid</span>
            <span>Missing</span>
            <span>Reported</span>
            <span>Coordinator</span>
          </div>

          {visible.map((i) => (
            <div className="table-row" key={i.id}>
              <span className="incident-id">{i.id}</span>
              <span className="incident-name">
                <strong>{i.title}</strong>
                <small>{i.location}</small>
              </span>
              <span><StatusPill status={i.status} /></span>
              <span>{i.type}</span>
              <span>{i.ops}</span>
              <span>{i.aid || "—"}</span>
              <Missing count={i.missing} />
              <span className="reported">
                <Icon name="clock" size={15} />
                {i.reported}
              </span>
              <span>{i.coordinator}</span>
            </div>
          ))}
        </div>

        {isLoading && <p className="empty">Loading incidents…</p>}
        {!isLoading && error && <p className="empty empty-error" role="alert">{error}</p>}
        {!isLoading && !error && visible.length === 0 && (
          <p className="empty">
            {incidents.length === 0 ? "No incidents yet." : "No incidents match your filters."}
          </p>
        )}
      </section>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
    </div>
  );
}

export default function IncidentHubLayout() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(INCIDENTS_ENDPOINT, { signal: controller.signal, withCredentials: true })
      .then((res) => setIncidents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setLoadError("Unable to load incidents. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  // Current page, read straight from the URL (no router)
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  function renderPage() {
    switch (path) {
      case BASE_PATH:
        return <IncidentOverview incidents={incidents} isLoading={isLoading} error={loadError} />;
      case `${BASE_PATH}/map`:
        return <Placeholder title="Area Map" />;
      case `${BASE_PATH}/forms`:
        return <Placeholder title="Forms" />;
      case `${BASE_PATH}/admin`:
        return <Placeholder title="Admin" />;
      default:
        return <Placeholder title="Page not found" />;
    }
  }

  // The sidebar badge follows the loaded data
  const openCount = countOpen(incidents);
  const navItems = INCIDENT_NAV_ITEMS.map((item) =>
    item.id === "incidents" && openCount > 0
      ? { ...item, badge: String(openCount) }
      : item
  );

  return (
    <div className="incident-hub">
      <header className="header">
        <div className="brand">
          <span className="brand-mark"><Icon name="hex" size={20} /></span>
          SARLINK
          <span className="brand-tag">EDSAR</span>
        </div>

        <div className="header-actions">
          <button className="callout-button" aria-label="New Callout">
            <Icon name="plus" size={18} />
            <span className="callout-label">New Callout</span>
          </button>
          <span className="header-divider" />
          <button className="signout">
            <Icon name="logout" size={18} />
            Sign Out
          </button>
        </div>
      </header>

      <Sidebar currentPath={path} navItems={navItems} />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}