/* Incident Hub - SARLINK search & rescue incident dashboard */
import { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";
import "./IncidentHub.css";

// Inline icons so no extra dependency is needed
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

// Icon component to render SVG icons based on the ICONS object
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

// Sample data - can be removed once database is connected. This is just to show how the dashboard will look with real data.
const incidents = [
  { id: "INC-2026-041", title: "Lost Hikers – Desolation Wilderness", location: "Desolation Wilderness, El Dorado Co.", status: "Active", type: "Hiking", ops: 3, aid: null, missing: 2, reported: "03 Oct 06:42", coordinator: "Cpt. D. Reeves" },
  { id: "INC-2026-040", title: "Missing Climber – Lover's Leap", location: "Twin Bridges, El Dorado Co.", status: "Active", type: "Climbing", ops: 2, aid: null, missing: 1, reported: "03 Oct 03:15", coordinator: "Lt. S. Nakamura" },
  { id: "INC-2026-039", title: "Overdue Kayakers – American River", location: "Coloma, El Dorado Co.", status: "Active", type: "Water", ops: 2, aid: "Placer", missing: 4, reported: "02 Oct 22:10", coordinator: "Cpt. M. Torres" },
  { id: "INC-2026-038", title: "Overdue Trail Runner – Mount Tallac", location: "Georgetown, El Dorado Co.", status: "Standby", type: "Hiking", ops: 1, aid: null, missing: 1, reported: "02 Oct 18:30", coordinator: "Sgt. K. Wallace" },
  { id: "INC-2026-037", title: "Overdue Family Hike – Ice House Reservoir", location: "Ice House Reservoir, El Dorado Co.", status: "Resolved", type: "Hiking", ops: 2, aid: null, missing: 0, reported: "02 Oct 09:00", coordinator: "Lt. A. Chen" },
  { id: "INC-2026-036", title: "Injured Backcountry Skier – Echo Summit", location: "South Lake Tahoe, El Dorado Co.", status: "Resolved", type: "Skiing", ops: 1, aid: null, missing: 0, reported: "01 Oct 14:22", coordinator: "Cpt. D. Reeves" },
];

// Constants for tabs and navigation items
const TABS = ["All", "Active", "Standby", "Resolved"];
const openCount = incidents.filter((i) => i.status !== "Resolved").length;

const NAV = [
  { to: "/", label: "Incidents", icon: "alert", badge: openCount },
  { to: "/map", label: "Area Map", icon: "map" },
  { to: "/forms", label: "Forms", icon: "file" },
  { to: "/admin", label: "Admin", icon: "shield" },
];

// Component to display the status of an incident with a colored pill
function StatusPill({ status }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <i />
      {status}
    </span>
  );
}

// Component to display the number of missing persons, with special styling if there are any
function Missing({ count }) {
  return (
    <span className={count ? "missing" : "missing none"}>
      <Icon name="users" size={16} />
      {count || "—"}
    </span>
  );
}

function IncidentOverview() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const kpis = [
    { label: "Open Incidents", value: openCount, detail: "2 resolved today", icon: "alert" },
    { label: "Operational Periods", value: incidents.reduce((n, i) => n + i.ops, 0), detail: "Across all incidents", icon: "calendar" },
    { label: "Mutual Aid", value: incidents.filter((i) => i.aid).length, detail: "Open out-of-county searches", icon: "aid" },
    { label: "Persons Missing", value: incidents.reduce((n, i) => n + i.missing, 0), detail: "Pending recovery", icon: "user", danger: true },
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

        {visible.length === 0 && <p className="empty">No incidents match your filters.</p>}
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
  return (
    <div className="incident-hub">
      <header className="header">
        <div className="brand">
          <span className="brand-mark"><Icon name="hex" size={20} /></span>
          SARLINK
          <span className="brand-tag">EDSAR</span>
        </div>
        {/* header actions + sign out button, no functionality yet, just a placeholder for now */}
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
      {/* where sidebar and header are defined, the main content will be rendered here */}
      <aside className="sidebar">
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end className="nav-link">
              <Icon name={n.icon} />
              {n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <span className="avatar">DR</span>
          <div>
            <p className="user-name">Cpt. D. Reeves</p>
            <p className="user-role">Operations Lead</p>
          </div>
        </div>
      </aside>
      {/* where sidebar and header are defined, the main content will be rendered here */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<IncidentOverview />} />
          <Route path="/map" element={<Placeholder title="Area Map" />} />
          <Route path="/forms" element={<Placeholder title="Forms" />} />
          <Route path="/admin" element={<Placeholder title="Admin" />} />
        </Routes>
      </main>
    </div>
  );
}