/* Dashboard Header (DT-240) — matches Figma SiteHeader + StatusLegend + MedQualLegend */
import "./Dashboard.css";

// ── Incident Types & Levels (from Figma main.tsx) ─────────────────────────────
export const INCIDENT_TYPES = [
  { value: "lost_hiker", label: "Lost Hiker / SAR" },
  { value: "wildfire", label: "Wildfire" },
  { value: "flood", label: "Flood" },
  { value: "hazmat", label: "HAZMAT" },
  { value: "earthquake", label: "Earthquake" },
  { value: "mass_casualty", label: "Mass Casualty" },
];

export const INCIDENT_LEVELS = [
  { value: "1", label: "Level 1 — Local" },
  { value: "2", label: "Level 2 — Regional" },
  { value: "3", label: "Level 3 — State" },
];

// ── Status & Medical Qualification Legend Data (from Figma) ───────────────────
export const SHOWN_STATUSES = [
  { key: "assigned", label: "Assigned", where: "on a team", color: "#0B2A5B" },
  { key: "standby", label: "Standby", where: "at the command post", color: "#5B6470" },
];

export const MED_QUALS = [
  {
    id: "emt",
    label: "EMT",
    shortLabel: "EMT",
    title: "Emergency Medical Technician",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    color: "#1D4ED8",
  },
  {
    id: "fa-aed",
    label: "First Aid / AED",
    shortLabel: "FA/AED",
    title: "First Aid / AED",
    bg: "#FFF7ED",
    border: "#FED7AA",
    color: "#C2410C",
  },
  {
    id: "wfa",
    label: "Wilderness First Aid",
    shortLabel: "WFA",
    title: "Wilderness First Aid",
    bg: "#EFFAF4",
    border: "#BBE5CD",
    color: "#2D7A50",
  },
];

// ── Inline SVG Icons (matching Figma icons without external dependencies) ─────
function HexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function IconAlertNav({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2L14.5 13H1.5L8 2Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M8 7V9.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

function IconFormsNav({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M9.5 9.5L13 7L9.5 4.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 7H5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function UsersIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B6470"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function RadioIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5B6470"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
    </svg>
  );
}

function PlusIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function SearchIcon({ size = 14 }) {
  return (
    <svg
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MedCrossIcon({ size = 8, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <rect x="3.5" y="0" width="3" height="10" rx="1" fill={color} />
      <rect x="0" y="3.5" width="10" height="3" rx="1" fill={color} />
    </svg>
  );
}

// ── StatChip (Personnel / Teams counters in Tier 2) ───────────────────────────
export function StatChip({ icon, label, value }) {
  return (
    <div className="sar-stat-chip">
      <div className="sar-stat-chip__icon">{icon}</div>
      <div>
        <div className="sar-stat-chip__value">{value}</div>
        <div className="sar-stat-chip__label">{label}</div>
      </div>
    </div>
  );
}

// ── MedQualBadge & MedQualLegend (Tier 3 Legend Bar) ──────────────────────────
export function MedQualBadge({ qual }) {
  const c = MED_QUALS.find((q) => q.id === qual);
  if (!c) return null;
  return (
    <span
      title={c.title}
      className="sar-med-qual-badge"
      style={{
        backgroundColor: c.bg,
        borderColor: c.border,
        color: c.color,
      }}
    >
      <MedCrossIcon size={8} color={c.color} />
      {c.shortLabel}
    </span>
  );
}

export function MedQualLegend() {
  return (
    <>
      {MED_QUALS.map((q) => (
        <div key={q.id} className="sar-legend-med-item">
          <MedQualBadge qual={q.id} />
          <span className="sar-legend-med-label">{q.label}</span>
        </div>
      ))}
    </>
  );
}

export function StatusLegend() {
  return (
    <div className="sar-status-legend">
      <span className="sar-legend-heading">Status:</span>
      {SHOWN_STATUSES.map(({ key, label, where, color }) => (
        <div key={key} className="sar-legend-status-item">
          <span
            className="sar-legend-status-dot"
            style={{ backgroundColor: color }}
          />
          <span className="sar-legend-status-text">
            <span className="sar-legend-status-name">{label}</span> · {where}
          </span>
        </div>
      ))}
      <span className="sar-legend-divider" aria-hidden="true" />
      <span className="sar-legend-heading">Medical:</span>
      <MedQualLegend />
    </div>
  );
}

/**
 * DashboardHeader (SiteHeader in Figma)
 * Renders the 3-tier Dashboard header from Dashboard-figma/main.tsx:
 * - Tier 1: SARLINK EDSAR brand, Incidents & ICS Forms navigation, Live indicator, Sign Out
 * - Tier 2: Shield icon, Incident title + ACTIVE & OP badges, ICS subtitle, Personnel & Teams StatChips,
 *           Add Team button, Search for Qualifications button, ICS Forms button
 * - Tier 3: Status & Medical Qualification legend bar
 */
export function DashboardHeader({
  incidentName = "Operation Granite Peak",
  incidentType = "lost_hiker",
  incidentLevel = "2",
  incidentTypeLabel: customTypeLabel,
  incidentLevelLabel: customLevelLabel,
  op = "1",
  totalPersonnel = 26,
  totalTeams = 7,
  onAddTeam,
  onSearchQuals,
  onSignOut,
}) {
  const resolvedTypeLabel =
    customTypeLabel ||
    INCIDENT_TYPES.find((t) => t.value === incidentType)?.label ||
    incidentType;
  const resolvedLevelLabel =
    customLevelLabel ||
    INCIDENT_LEVELS.find((l) => l.value === String(incidentLevel))?.label ||
    `Level ${incidentLevel}`;

  const navItems = [
    { id: "incidents", label: "Incidents", icon: <IconAlertNav size={14} />, href: "/incident-hub" },
    { id: "forms", label: "ICS Forms", icon: <IconFormsNav size={14} />, href: "/forms" },
  ];

  return (
    <header className="sar-site-header">
      {/* Tier 1: Brand, Navigation, Live Status, Sign Out */}
      <div className="sar-site-header__tier1">
        <div className="sar-site-header__brand">
          <div className="sar-site-header__logo">
            <HexIcon />
          </div>
          <span className="sar-site-header__brand-name">SARLINK</span>
          <span className="sar-site-header__brand-agency">EDSAR</span>
        </div>

        <nav className="sar-site-header__nav" aria-label="Dashboard navigation">
          {navItems.map((item) => (
            <a key={item.id} href={item.href} className="sar-site-header__nav-link">
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sar-site-header__right">
          <div className="sar-live-pill">
            <span className="sar-live-pill__dot" />
            <span className="sar-live-pill__text">Live</span>
          </div>
          <div className="sar-site-header__divider-sm" aria-hidden="true" />
          <button
            type="button"
            className="sar-signout-btn"
            onClick={onSignOut}
          >
            <IconSignOut />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tier 2: Incident Title, Stats, and Action Buttons */}
      <div className="sar-site-header__tier2">
        <div className="sar-site-header__shield">
          <ShieldIcon size={18} />
        </div>

        <div className="sar-site-header__incident">
          <div className="sar-site-header__incident-row">
            <span className="sar-site-header__incident-name">{incidentName}</span>
            <span className="sar-badge-active">ACTIVE</span>
            <span
              className="sar-badge-op"
              title={`Operational Period ${op}`}
            >
              OP {op}
            </span>
          </div>
          <p className="sar-site-header__incident-sub">
            ICS · {resolvedTypeLabel} · {resolvedLevelLabel} · Operational Period {op}
          </p>
        </div>

        <div className="sar-site-header__divider-md" aria-hidden="true" />

        {/* Personnel + Teams Stat Chips */}
        <div className="sar-site-header__stats">
          <StatChip
            icon={<UsersIcon size={13} />}
            label="Personnel"
            value={totalPersonnel}
          />
          <StatChip
            icon={<RadioIcon size={13} />}
            label="Teams"
            value={totalTeams}
          />
        </div>

        <div className="sar-site-header__divider-md" aria-hidden="true" />

        {/* Action Buttons */}
        <div className="sar-site-header__actions">
          <button
            type="button"
            className="sar-header-btn sar-header-btn--primary"
            onClick={onAddTeam}
          >
            <PlusIcon size={14} />
            Add Team
          </button>

          <button
            type="button"
            className="sar-header-btn sar-header-btn--outline"
            onClick={onSearchQuals}
          >
            <SearchIcon size={14} />
            Search for Qualifications
          </button>

          <a
            href="/forms"
            className="sar-header-btn sar-header-btn--secondary"
          >
            ICS Forms
          </a>
        </div>
      </div>

      {/* Tier 3: Status & Medical Qualification Legend Bar */}
      <StatusLegend />
    </header>
  );
}

export const SiteHeader = DashboardHeader;
export default DashboardHeader;

