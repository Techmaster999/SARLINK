/* Command Post panel (Figma CommandPostPanel): IC header with On Post / Standby counts,
 * then two columns — CP Roster (IC row, roster, IST sub-team) and Standby at CP. */
import { useState } from "react";
import { SHOWN_STATUSES } from "./DashboardHeader";
import { MemberList } from "./OperatingTeamCard";
import { ChevronIcon, ShieldIcon, UserIcon, UsersIcon } from "./dashboardIcons";

const TEXT_SUB = "#5B6470";
const STANDBY_COLOR = SHOWN_STATUSES.find((s) => s.key === "standby")?.color ?? TEXT_SUB;
// IST sub-team colour (kept clear of the team palette)
const IST = { label: "IST", accent: "#A3246B", tint: "#FDF1F7" };

function IstSubTeam({ members }) {
  return (
    <div className="sar-ist" style={{ borderColor: `${IST.accent}55` }}>
      <div className="sar-ist__header" style={{ backgroundColor: IST.accent }}>
        <span className="sar-ist__label">{IST.label}</span>
        <span className="sar-ist__sub">Sub-team</span>
        <span className="sar-ist__count">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>
      <MemberList
        members={members}
        tint={IST.tint}
        emptyText={`No one on ${IST.label} yet.`}
      />
    </div>
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

export function CommandPostCard({ icName = "Unassigned", commandPost }) {
  const roster = commandPost?.roster ?? [];
  const ist = commandPost?.ist ?? [];
  const standby = commandPost?.standby ?? [];
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
              <MemberList members={roster} emptyText="No one else on the CP roster." />
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
          {standbyOpen && <MemberList members={standby} emptyText="No personnel on standby." />}
        </div>
      </div>
    </section>
  );
}

export default CommandPostCard;
