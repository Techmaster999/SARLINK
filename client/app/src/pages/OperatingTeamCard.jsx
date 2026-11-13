/* Operating team card (Figma TeamCard): coloured header with the team number, leader and
 * member count, collapsible list of members underneath. Drag and drop is added separately. */
import { useState } from "react";
import { MedQualBadge, SHOWN_STATUSES } from "./DashboardHeader";
import { ChevronIcon } from "./dashboardIcons";

const STATUS_COLOR = Object.fromEntries(SHOWN_STATUSES.map((s) => [s.key, s.color]));

/** One person on a team or in a command-post group. */
export function MemberRow({ member }) {
  const quals = Array.isArray(member.quals) ? member.quals : [];
  return (
    <div className="sar-member" data-member-id={member.id}>
      <div className="sar-member__main">
        <div className="sar-member__name-row">
          <span
            className="sar-member__dot"
            style={{ backgroundColor: STATUS_COLOR[member.status] ?? "#D5D9DF" }}
          />
          <span className="sar-member__name">{member.name}</span>
        </div>
        {member.role && <p className="sar-member__role">{member.role}</p>}
      </div>
      {quals.length > 0 && (
        <div className="sar-member__quals">
          {quals.map((q) => (
            <MedQualBadge key={q} qual={q} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The member list under a team or command-post group header. */
export function MemberList({ members = [], tint = "#FFFFFF", emptyText }) {
  return (
    <div className="sar-member-list" style={{ backgroundColor: tint }}>
      {members.map((m) => (
        <MemberRow key={m.id} member={m} />
      ))}
      {members.length === 0 && <p className="sar-member-list__empty">{emptyText}</p>}
    </div>
  );
}

export function OperatingTeamCard({ team }) {
  const [open, setOpen] = useState(true);
  const members = Array.isArray(team.members) ? team.members : [];
  const number = team.number || team.name;

  return (
    <section
      className="sar-team-card"
      style={{ borderColor: `${team.accent}30` }}
      aria-label={`Team ${number}`}
    >
      <button
        type="button"
        className="sar-team-card__toggle"
        style={{ backgroundColor: team.accent }}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="sar-team-card__title">
          <div className="sar-team-card__eyebrow">Team</div>
          <div className="sar-team-card__name">{number}</div>
          <div className="sar-team-card__leader">Leader: {team.leader || "Unassigned"}</div>
        </div>
        <div className="sar-team-card__meta">
          <div className="sar-team-card__count">
            <div className="sar-team-card__count-value">{members.length}</div>
            <div className="sar-team-card__count-label">
              {members.length === 1 ? "member" : "members"}
            </div>
          </div>
          <ChevronIcon open={open} size={15} color="rgba(255,255,255,0.8)" />
        </div>
      </button>
      {open && (
        <MemberList members={members} tint={team.tint} emptyText="No one assigned yet." />
      )}
    </section>
  );
}

export default OperatingTeamCard;
