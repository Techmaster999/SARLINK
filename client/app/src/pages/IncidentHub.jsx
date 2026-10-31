/* Incident Hub - SARLINK search & rescue incident dashboard */
import { useEffect, useState } from "react";
import axios from "axios";
import { Header } from "../../../src/components/header/index.js";
import { Sidebar } from "../../../src/components/Sidebar/index.js";
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
  download: ["M12 3v12", "m7 10 5 5 5-5", "M5 21h14"],
  arrowLeft: ["m15 18-6-6 6-6", "M9 12h12"],
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

// Incidents are loaded from the API. Each item is expected to use the canonical incident shape.
const INCIDENTS_ENDPOINT = "/api/incidents";
const SESSION_ENDPOINT = "/api/auth/session";
const TABS = ["All", "Active", "Standby", "Resolved"];
const SEARCH_DEBOUNCE_MS = 300;

// The hub lives under this path (see main.jsx)
const BASE_PATH = "/incident-hub";
const incidentDetailsPath = (incidentId) => (
  `${BASE_PATH}/incidents/${encodeURIComponent(String(incidentId))}`
);

export async function fetchAndMapIncidents(signal) {
  const { data: session } = await axios.get(SESSION_ENDPOINT, {
    signal,
    withCredentials: true,
  });
  if (!session?.user) {
    const error = new Error("You are not authorized to view incidents.");
    error.code = "ERR_FORBIDDEN";
    throw error;
  }

  const { data } = await axios.get(INCIDENTS_ENDPOINT, {
    signal,
    withCredentials: true,
  });
  return (Array.isArray(data) ? data : []).map((incident) => ({
    ...incident,
    id: incident?.id ?? incident?.caseId,
    name: incident?.name ?? incident?.incidentName ?? "",
    status: incident?.status ?? "active",
    type: incident?.type ?? "SAR",
    operationalPeriods: Number.isFinite(incident?.operationalPeriods)
      ? incident.operationalPeriods
      : 1,
    mutualAid: incident?.mutualAid === true,
    missingPersons: Number.isFinite(incident?.missingPersons)
      ? incident.missingPersons
      : 0,
    reportedAt: incident?.reportedAt ?? incident?.dateTime ?? incident?.occurredAt,
    description: incident?.description ?? "",
    lastUpdate: incident?.lastUpdate ?? incident?.updatedAt ?? "",
  }));
}

const NAV = [
  { id: "incidents", path: BASE_PATH, label: "Incidents", icon: "fire" },
  { id: "map", path: `${BASE_PATH}/map`, label: "Area Map", icon: "document" },
  { id: "forms", path: `${BASE_PATH}/forms`, label: "Forms", icon: "document" },
  { id: "admin", path: `${BASE_PATH}/admin`, label: "Admin", icon: "shield" },
];

const DASH = "—";
const displayValue = (value) => {
  if (value === 0) return 0;
  if (typeof value === "string" && value.trim()) return value;
  return DASH;
};
const displayNumber = (value) => (
  typeof value === "number" && Number.isFinite(value) ? value : DASH
);
const statusValue = (value) => {
  const status = typeof value === "string" ? value.toLowerCase() : "";
  return ["active", "standby", "resolved"].includes(status) ? status : "unknown";
};
const countOpen = (list) => list.filter((incident) => (
  ["active", "standby"].includes(statusValue(incident?.status))
)).length;
const sum = (list, key) => list.reduce(
  (total, incident) => total + (typeof incident?.[key] === "number" && Number.isFinite(incident[key]) ? incident[key] : 0),
  0,
);

function StatusPill({ status }) {
  const normalizedStatus = statusValue(status);
  const labels = { active: "Active", standby: "Standby", resolved: "Resolved", unknown: "Unknown" };
  return (
    <span className={`status status-${normalizedStatus}`}>
      <i />
      {labels[normalizedStatus]}
    </span>
  );
}

function Missing({ count }) {
  return (
    <span className={count ? "missing" : "missing none"}>
      <Icon name="users" size={16} />
      {displayNumber(count)}
    </span>
  );
}

function formatReportedAt(value) {
  if (typeof value !== "string" || !value.trim()) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date).replace(",", "");
}

function exportIncident(incident) {
  const incidentId = String(incident?.id ?? "incident");
  const payload = JSON.stringify(incident, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${incidentId.replace(/[^a-z0-9._-]/gi, "_")}-incident.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, detail, icon, danger = false }) {
  return (
    <article className="kpi-card">
      <div className="kpi-copy">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        <p className="kpi-detail">{detail}</p>
      </div>
      <span className={danger ? "kpi-icon danger" : "kpi-icon"}>
        <Icon name={icon} size={20} />
      </span>
    </article>
  );
}

function IncidentQuickView({ incidents }) {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const activeIncidents = incidents.filter((incident) => (
    ["active", "standby"].includes(statusValue(incident?.status))
  ));
  const openCount = activeIncidents.length;
  const operationalPeriods = sum(incidents, "operationalPeriods");
  const mutualAidCount = incidents.filter((incident) => incident?.mutualAid === true).length;
  const missingPersons = sum(incidents, "missingPersons");
  const q = query.trim();
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Search runs in the database; wait for typing to pause before asking.
  useEffect(() => {
    setSearchError("");
    if (!q) {
      setResults(null);
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(() => {
      axios
        .get(INCIDENTS_ENDPOINT, { params: { q }, signal: controller.signal, withCredentials: true })
        .then((res) => setResults(Array.isArray(res.data) ? res.data : []))
        .catch((err) => {
          if (axios.isCancel(err)) return;
          setResults([]);
          setSearchError("Search failed. Please try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const source = q && results ? results : incidents;
  const visible = source.filter((incident) => (
    tab === "All" || statusValue(incident?.status) === tab.toLowerCase()
  ));

  return (
    <div className="page quick-view">
      <div className="page-heading">
        <h1 className="page-title">Incident Hub</h1>
        <p className="page-subtitle">Search &amp; Rescue operations — El Dorado County</p>
      </div>

      <div className="kpi-grid">
        <StatCard label="Open Incidents" value={openCount} detail="Active and standby" icon="alert" />
        <StatCard label="Operational Periods" value={operationalPeriods} detail="Across all incidents" icon="calendar" />
        <StatCard label="Mutual Aid" value={mutualAidCount} detail="Incidents with mutual aid" icon="aid" />
        <StatCard label="Persons Missing" value={missingPersons} detail="Across all incidents" icon="user" danger />
      </div>

      <section className="incidents-card">
        <div className="card-head">
          <h2 className="card-title">
            Incidents <span className="count">{visible.length}</span>
          </h2>
          <label className="search">
            <Icon name="search" size={16} />
            <span className="sr-only">Search incidents</span>
            <input
              type="search"
              placeholder="Search incidents..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="tabs" role="tablist" aria-label="Filter incidents by status">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "tab active" : "tab"}
              onClick={() => setTab(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table className="incident-table">
            <thead>
              <tr>
                <th scope="col">Incident ID</th>
                <th scope="col">Incident</th>
                <th scope="col">Status</th>
                <th scope="col">Type</th>
                <th scope="col">OPs</th>
                <th scope="col">Mutual Aid</th>
                <th scope="col">Missing</th>
                <th scope="col">Reported</th>
                <th scope="col">Coordinator</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((incident, index) => (
                <tr className="incident-row" key={incident?.id ?? index}>
                  <td className="incident-id">{displayValue(incident?.id)}</td>
                  <td className="incident-name">
                    <strong>{displayValue(incident?.name)}</strong>
                    <small>{displayValue(incident?.location)}</small>
                  </td>
                  <td><StatusPill status={incident?.status} /></td>
                  <td>{displayValue(incident?.type)}</td>
                  <td>{displayNumber(incident?.operationalPeriods)}</td>
                  <td>{incident?.mutualAid ? displayValue(incident?.mutualAidCounty) : DASH}</td>
                  <td><Missing count={incident?.missingPersons} /></td>
                  <td className="reported">
                    <Icon name="clock" size={15} />
                    {formatReportedAt(incident?.reportedAt)}
                  </td>
                  <td>{displayValue(incident?.coordinator)}</td>
                  <td className="incident-actions">
                    <a
                      className="incident-action"
                      href={incidentDetailsPath(incident?.id)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open full details for ${displayValue(incident?.name)} in a new tab`}
                    >
                      Details
                    </a>
                    <button
                      type="button"
                      className="incident-action incident-action-button"
                      onClick={() => exportIncident(incident)}
                      aria-label={`Export ${displayValue(incident?.name)}`}
                    >
                      <Icon name="download" size={15} />
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="incident-cards">
          {visible.map((incident, index) => {
            const location = typeof incident?.location === "string" ? incident.location.trim() : "";
            const type = typeof incident?.type === "string" ? incident.type.trim() : "";
            const locationAndType = [location, type].filter(Boolean).join(" · ") || DASH;
            const mutualAidLabel = incident?.mutualAid
              ? `Mutual Aid${incident.mutualAidCounty ? ` · ${incident.mutualAidCounty}` : ""}`
              : "";
            return (
              <article className="incident-card" key={incident?.id ?? index}>
                <div className="incident-card-heading">
                  <span className="incident-card-id">{displayValue(incident?.id)}</span>
                  <StatusPill status={incident?.status} />
                </div>
                <h3 className="incident-card-title">{displayValue(incident?.name)}</h3>
                <p className="incident-card-location">{locationAndType}</p>
                <div className="incident-card-facts">
                  <span>
                    <Icon name="clock" size={13} />
                    {displayNumber(incident?.operationalPeriods)} OP{incident?.operationalPeriods === 1 ? "" : "s"}
                  </span>
                  <span className={incident?.missingPersons > 0 ? "incident-card-missing" : ""}>
                    <Icon name="users" size={13} />
                    {displayNumber(incident?.missingPersons)} missing
                  </span>
                  {mutualAidLabel && <span className="incident-card-aid">{mutualAidLabel}</span>}
                </div>
                <dl className="incident-card-meta">
                  <div><dt>Reported</dt><dd>{formatReportedAt(incident?.reportedAt)}</dd></div>
                  <div><dt>Coordinator</dt><dd>{displayValue(incident?.coordinator)}</dd></div>
                </dl>
                <div className="incident-card-actions">
                  <a
                    className="incident-action"
                    href={incidentDetailsPath(incident?.id)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open full details for ${displayValue(incident?.name)} in a new tab`}
                  >
                    Details
                  </a>
                  <button
                    type="button"
                    className="incident-action incident-action-button"
                    onClick={() => exportIncident(incident)}
                    aria-label={`Export ${displayValue(incident?.name)}`}
                  >
                    <Icon name="download" size={15} />
                    Export
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {isSearching && <p className="empty" role="status">Searching…</p>}
        {searchError && <p className="empty" role="alert">{searchError}</p>}
        {!isSearching && !searchError && visible.length === 0 && (
          <p className="empty">
            {incidents.length === 0 ? "No incidents yet." : "No incidents match your filters."}
          </p>
        )}
      </section>
    </div>
  );
}

function IncidentDetails({ incident }) {
  if (!incident) {
    return <Placeholder title="Incident not found" />;
  }

  const fields = [
    ["Incident ID", incident.id],
    ["Incident name", incident.name],
    ["Status", statusValue(incident.status)],
    ["Type", incident.type],
    ["Location", incident.location],
    ["Reported", formatReportedAt(incident.reportedAt)],
    ["Coordinator", incident.coordinator],
    ["Operational periods", incident.operationalPeriods],
    ["Missing persons", incident.missingPersons],
    ["Mutual aid county", incident.mutualAidCounty],
    ["Description", incident.description],
    ["Last update", incident.lastUpdate],
  ];

  return (
    <div className="page incident-details">
      <a className="back-link" href={BASE_PATH}>
        <Icon name="arrowLeft" size={18} />
        Back to incident quick view
      </a>
      <div className="page-heading">
        <h1 className="page-title">{displayValue(incident.name)}</h1>
        <p className="page-subtitle">Incident {displayValue(incident.id)}</p>
      </div>
      <section className="details-card" aria-labelledby="incident-details-title">
        <div className="details-card-heading">
          <h2 id="incident-details-title">Incident details</h2>
          <StatusPill status={incident.status} />
        </div>
        <dl className="details-grid">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{displayValue(value)}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="state-action"
          onClick={() => exportIncident(incident)}
          aria-label={`Export ${displayValue(incident.name)}`}
        >
          <Icon name="download" size={16} />
          Export incident
        </button>
      </section>
    </div>
  );
}

export function renderIncidentQuickView({ incidents }) {
  return <IncidentQuickView incidents={Array.isArray(incidents) ? incidents : []} />;
}

function Placeholder({ title }) {
  return (
    <div className="page">
      <h1 className="page-title">{title}</h1>
    </div>
  );
}

function IncidentDataState({ type, onRetry, message }) {
  const states = {
    loading: {
      title: "Loading incidents",
      message: "Retrieving the latest incident data.",
      role: "status",
    },
    empty: {
      title: "No incidents available",
      message: "There are no incidents to display yet. Create a new callout to begin tracking an operation.",
      role: "status",
    },
    error: {
      title: "Incident data unavailable",
      message: message || "We could not retrieve incident data. Check your connection and try again.",
      role: "alert",
    },
  };
  const state = states[type];

  return (
    <section
      className={`incident-state incident-state-${type}`}
      role={state.role}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div className="incident-state-icon" aria-hidden="true">
        {type === "loading" ? <span className="state-spinner" /> : <Icon name={type === "error" ? "alert" : "file"} size={22} />}
      </div>
      <h2 className="incident-state-title">{state.title}</h2>
      <p className="incident-state-message">{state.message}</p>
      {type === "loading" && <p className="sr-only">Please wait.</p>}
      {type === "empty" && (
        <a className="state-action" href="/switchboard--callout">
          New Callout
        </a>
      )}
      {type === "error" && (
        <button type="button" className="state-action" onClick={onRetry}>
          Retry
        </button>
      )}
    </section>
  );
}

export default function IncidentHubLayout() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError("");

    fetchAndMapIncidents(controller.signal)
      .then(setIncidents)
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setLoadError(err.code === "ERR_FORBIDDEN"
          ? "You are not authorized to view incidents."
          : "Unable to load incidents. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  // Current page, read straight from the URL (no router)
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  function renderPage() {
    switch (path) {
      case BASE_PATH:
        if (isLoading) return <IncidentDataState type="loading" />;
        if (loadError) {
          return (
            <IncidentDataState
              type="error"
              message={loadError}
              onRetry={() => setRetryCount((count) => count + 1)}
            />
          );
        }
        if (incidents.length === 0) return <IncidentDataState type="empty" />;
        return renderIncidentQuickView({ incidents });
      case path.startsWith(`${BASE_PATH}/incidents/`) ? path : "":
        if (isLoading) return <IncidentDataState type="loading" />;
        if (loadError) {
          return (
            <IncidentDataState
              type="error"
              message={loadError}
              onRetry={() => setRetryCount((count) => count + 1)}
            />
          );
        }
        return (
          <IncidentDetails
            incident={incidents.find(
              (incident) => String(incident?.id) === decodeURIComponent(path.slice(`${BASE_PATH}/incidents/`.length)),
            )}
          />
        );
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
  const nav = NAV.map((item) => (
    item.path === BASE_PATH ? { ...item, badge: openCount } : item
  ));

  return (
    <div className="incident-hub">
      <Header
        onCreateCallout={(calloutPath) => window.location.assign(calloutPath)}
      />
      <Sidebar currentPath={path} navItems={nav} />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}
