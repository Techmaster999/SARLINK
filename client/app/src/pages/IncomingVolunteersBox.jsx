/* Incoming Volunteers panel (Figma IncomingVolunteersPanel): collapsible table of who is
 * on the way — staging first, then soonest ETA. Drag to deploy is added separately. */
import { useState } from "react";
import { CheckCircleIcon, ChevronIcon, ClockIcon, TruckIcon, UserIcon } from "./dashboardIcons";

const TEXT_SUB = "#5B6470";

const VOL_STATUS_STYLE = {
  "en-route": { bg: "#EFFAF4", color: "#2D7A50" },
  staging: { bg: "#EEF3FF", color: "#3558A8" },
  delayed: { bg: "#FFF8EE", color: "#C97A1A" },
};
const VOL_STATUS_LABEL = {
  "en-route": "En Route",
  staging: "Staging",
  delayed: "Delayed",
};

/** Staging volunteers first, then soonest ETA. */
export function sortIncoming(volunteers) {
  return [...volunteers].sort((a, b) => {
    if (a.status === "staging" && b.status !== "staging") return -1;
    if (b.status === "staging" && a.status !== "staging") return 1;
    return (a.etaMinutes ?? Infinity) - (b.etaMinutes ?? Infinity);
  });
}

function VolunteerRow({ vol }) {
  const s = VOL_STATUS_STYLE[vol.status] ?? VOL_STATUS_STYLE["en-route"];
  const etaText =
    vol.status === "staging" ? VOL_STATUS_LABEL.staging : vol.eta || VOL_STATUS_LABEL[vol.status] || "—";

  return (
    <div className="sar-incoming__row" data-volunteer-id={vol.id}>
      <div className="sar-incoming__who">
        <div className="sar-incoming__avatar">
          <UserIcon size={12} color={TEXT_SUB} />
        </div>
        <span className="sar-incoming__name">{vol.name}</span>
      </div>
      <span className="sar-incoming__cell" data-label="Organization">{vol.organization}</span>
      <span className="sar-incoming__cell" data-label="Role">{vol.role}</span>
      <div className="sar-incoming__eta">
        <ClockIcon size={11} color={s.color} />
        <span
          className="sar-incoming__eta-pill"
          style={{ backgroundColor: s.bg, color: s.color }}
          title={VOL_STATUS_LABEL[vol.status]}
        >
          {etaText}
        </span>
      </div>
    </div>
  );
}

export function IncomingVolunteersBox({ volunteers = [] }) {
  const [open, setOpen] = useState(true);
  const sorted = sortIncoming(volunteers);

  return (
    <section className="sar-incoming" aria-label="Incoming Volunteers">
      <button
        type="button"
        className="sar-incoming__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <TruckIcon size={16} color={TEXT_SUB} />
        <span className="sar-incoming__title">Incoming Volunteers</span>
        <span className="sar-incoming__summary">{volunteers.length} inbound</span>
        <ChevronIcon open={open} size={14} color={TEXT_SUB} />
      </button>

      {open &&
        (sorted.length === 0 ? (
          <div className="sar-incoming__empty">
            <CheckCircleIcon size={16} />
            All volunteers have been deployed.
          </div>
        ) : (
          <div className="sar-incoming__table">
            <div className="sar-incoming__head">
              {["Volunteer", "Organization", "Role", "ETA / Status"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {sorted.map((vol) => (
              <VolunteerRow key={vol.id} vol={vol} />
            ))}
          </div>
        ))}
    </section>
  );
}

export default IncomingVolunteersBox;
