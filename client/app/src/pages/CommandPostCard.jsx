/* Command Post panel (Figma CommandPostPanel): IC header with On Post / Standby counts,
 * then two columns — CP Roster (IC row, roster, IST sub-team) and Standby at CP. */
import { useState } from "react";
import { SHOWN_STATUSES } from "./DashboardHeader";
import { MemberList } from "./OperatingTeamCard";
import { CP_IDS } from "./dashboardBoard";
import { ChevronIcon, ShieldIcon, UserIcon, UsersIcon } from "./dashboardIcons";

const TEXT_SUB = "#5B6470";
const STANDBY_COLOR = SHOWN_STATUSES.find((s) => s.key === "standby")?.color ?? TEXT_SUB;

function memberValue(member, key) {
  if (typeof member === "string") return key === "name" ? member : "";
  return member?.[key] ?? member?.volunteer?.[key] ?? "";
}

export function CompactVolunteerTab({ volunteer }) {
  const name = memberValue(volunteer, "name") || "Unnamed volunteer";
  const role =
    memberValue(volunteer, "istRole") ||
    memberValue(volunteer, "role") ||
    memberValue(volunteer, "teamRole");

  return (
    <div className="sar-compact-volunteer-tab">
      <span className="sar-compact-volunteer-tab__avatar" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="sar-compact-volunteer-tab__copy">
        <strong>{name}</strong>
        {role && <small>{role}</small>}
      </span>
    </div>
  );
}

export function IstSubTeam({ members = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="sar-ist-subteam" aria-label="IST sub-team">
      <button
        type="button"
        className="sar-ist-subteam__header"
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed((collapsed) => !collapsed)}
      >
        <span className="sar-ist-subteam__title">
          <span className="sar-ist-subteam__mark" aria-hidden="true">+</span>
          IST · <span className="sar-ist-subteam__count">{members.length}</span>
        </span>
        <span className="sar-ist-subteam__toggle">
          {isCollapsed ? "Show" : "Hide"}
        </span>
      </button>
      {!isCollapsed && (
        <div className="sar-ist-subteam__body">
          {members.length > 0 ? (
            members.map((member, index) => (
              <CompactVolunteerTab
                key={memberValue(member, "id") || `${memberValue(member, "name")}-${index}`}
                volunteer={member}
              />
            ))
          ) : (
            <p className="sar-ist-subteam__empty">No IST members assigned</p>
          )}
        </div>
      )}
    </section>
  );
}

function GroupToggle({ icon, label, detail, open, onToggle }) {
  return (
    <button type="button" className="sar-cp__group-toggle" onClick={onToggle} aria-expanded={open}>
      {icon}
      <span className="sar-cp__group-label">{label}</span>
      <span className="sar-cp__group-detail">{detail}</span>
      <ChevronIcon open={open} size={12} color={TEXT_SUB} />
    </button>
  );
}

export function CommandPostCard({ icName = "Unassigned", commandPost, dragEnabled = false }) {
  const roster = commandPost?.roster ?? [];
  const ist = commandPost?.ist ?? [];
  const standby = commandPost?.standby ?? [];
  const standbyContainerId = commandPost?.teamId ?? commandPost?.id ?? CP_IDS.standby;
  const [rosterOpen, setRosterOpen] = useState(true);
  const [standbyOpen, setStandbyOpen] = useState(true);
  const onPost = 1 + roster.length + ist.length; // the IC is always on post

  return (
    <section className="sar-cp" aria-label="Command Post">
      <div className="sar-cp__header">
        <div className="sar-cp__badge-icon">
          <ShieldIcon size={18} />
        </div>
        <div className="sar-cp__title">
          <div className="sar-cp__eyebrow">Command Post</div>
          <div className="sar-cp__ic-name">{icName}</div>
          <div className="sar-cp__ic-role">Incident Commander</div>
        </div>
        <div className="sar-cp__stats">
          <div className="sar-cp__stat">
            <div className="sar-cp__stat-value">{onPost}</div>
            <div className="sar-cp__stat-label">On Post</div>
          </div>
          <div className="sar-cp__stat">
            <div className="sar-cp__stat-value">{standby.length}</div>
            <div className="sar-cp__stat-label">Standby</div>
          </div>
        </div>
        <span className="sar-cp__tag">CP</span>
      </div>

      <div className="sar-cp__columns">
        <div className="sar-cp__column sar-cp__column--roster">
          <GroupToggle
            icon={<UserIcon size={13} color={TEXT_SUB} />}
            label="CP Roster"
            detail={`${onPost} personnel`}
            open={rosterOpen}
            onToggle={() => setRosterOpen((v) => !v)}
          />
          {rosterOpen && (
            <>
              {/* IC row (fixed) */}
              <div className="sar-cp__ic-row-wrap">
                <div className="sar-cp__ic-row">
                  <div className="sar-cp__ic-avatar">
                    <ShieldIcon size={13} />
                  </div>
                  <div className="sar-cp__ic-text">
                    <div className="sar-member__name-row">
                      <span className="sar-member__dot" style={{ backgroundColor: STANDBY_COLOR }} />
                      <span className="sar-member__name">{icName}</span>
                    </div>
                    <p className="sar-member__role">Incident Commander</p>
                  </div>
                  <span className="sar-cp__ic-tag">IC</span>
                </div>
              </div>
              <MemberList
                members={roster}
                containerId={CP_IDS.roster}
                label="CP roster"
                dragEnabled={dragEnabled}
                emptyText={
                  dragEnabled
                    ? "Drag members here to add them to the CP roster."
                    : "No one else on the CP roster."
                }
              />
              <div className="sar-cp__ist-wrap">
                <IstSubTeam members={ist} />
              </div>
            </>
          )}
        </div>

        <div className="sar-cp__column">
          <GroupToggle
            icon={<UsersIcon size={13} color={TEXT_SUB} />}
            label="Standby at CP"
            detail={`${standby.length} standing by`}
            open={standbyOpen}
            onToggle={() => setStandbyOpen((v) => !v)}
          />
          {standbyOpen && (
            <MemberList
              members={standby}
              containerId={standbyContainerId}
              label="CP standby"
              dragEnabled={dragEnabled}
              emptyText={
                dragEnabled ? "No personnel on standby. Drag a member here." : "No personnel on standby."
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default CommandPostCard;
