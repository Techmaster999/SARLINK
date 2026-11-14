import { useCallback, useEffect, useState } from "react";
import {
  CreateTeamModal,
  closeCreateTeamModal as closeModalHelper,
  getNextTeamNumber,
  calculateLocalNextTeamNumber,
  TEAM_PALETTE,
  DEFAULT_INCIDENT_VOLUNTEERS,
} from "./CreateTeamModal";
import {
  DashboardHeader,
  SiteHeader,
  StatChip,
  StatusLegend,
  MedQualLegend,
  MedQualBadge,
  MED_QUALS,
  SHOWN_STATUSES,
  INCIDENT_TYPES,
  INCIDENT_LEVELS,
} from "./DashboardHeader";
import { DraggableVolunteerTab } from "../../../src/components/DraggableVolunteerTab/DraggableVolunteerTab";
import { DroppableTeamColumn } from "../../../src/components/DroppableTeamColumn/DroppableTeamColumn";
import {
  EtaDisplay,
  formatEta,
  useCurrentTime,
  getEtaStatus,
} from "./EtaDisplay";
import "./Dashboard.css";
import { onVolunteerReassigned } from "../api/realtime";

export {
  CreateTeamModal,
  closeModalHelper as closeCreateTeamModal,
  getNextTeamNumber,
  calculateLocalNextTeamNumber,
  TEAM_PALETTE,
  DEFAULT_INCIDENT_VOLUNTEERS,
  DashboardHeader,
  SiteHeader,
  StatChip,
  StatusLegend,
  MedQualLegend,
  MedQualBadge,
  MED_QUALS,
  SHOWN_STATUSES,
  INCIDENT_TYPES,
  INCIDENT_LEVELS,
  EtaDisplay,
  formatEta,
  useCurrentTime,
  getEtaStatus,
};

export function DragModeIndicator({ isDragEnabled }) {
  if (!isDragEnabled) return null;

  return (
    <div className="sar-drag-mode-indicator" role="status" aria-live="polite">
      <span className="sar-drag-mode-indicator__signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>Drag and drop is on</span>
    </div>
  );
}

function memberValue(member, key) {
  if (typeof member === "string") return key === "name" ? member : "";
  return member?.[key] ?? member?.volunteer?.[key] ?? "";
}

function isIstMember(member) {
  if (typeof member === "string") return false;
  const assignment = String(
    member?.assignment ?? member?.teamType ?? member?.category ?? ""
  ).toLowerCase();
  return (
    member?.isIst === true ||
    member?.isIST === true ||
    member?.ist === true ||
    assignment === "ist" ||
    Boolean(member?.istRole)
  );
}

export function getIstMembers(commandPostTeam) {
  const members = Array.isArray(commandPostTeam?.members)
    ? commandPostTeam.members
    : [];
  return members.filter(isIstMember);
}

function getStandbyMembers(commandPostTeam) {
  const istIds = new Set(
    getIstMembers(commandPostTeam).map((member) => memberValue(member, "id"))
  );
  const standbyMembers = Array.isArray(commandPostTeam?.standbyMembers)
    ? commandPostTeam.standbyMembers
    : Array.isArray(commandPostTeam?.standby)
      ? commandPostTeam.standby
      : commandPostTeam?.members;
  return (standbyMembers || []).filter(
    (member) => !isIstMember(member) && !istIds.has(memberValue(member, "id"))
  );
}

export function toggleIstCollapsed(setIsCollapsed) {
  if (typeof setIsCollapsed === "function") {
    setIsCollapsed((collapsed) => !collapsed);
  }
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
        onClick={() => toggleIstCollapsed(setIsCollapsed)}
      >
        <span className="sar-ist-subteam__title">
          <span className="sar-ist-subteam__mark" aria-hidden="true">+</span>
          IST <span className="sar-ist-subteam__count">{members.length}</span>
        </span>
        <span className="sar-ist-subteam__toggle" aria-hidden="true">
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

function isCommandPostTeam(team) {
  const type = String(team?.type ?? team?.teamType ?? "").toLowerCase();
  const name = String(team?.name ?? "").toLowerCase().replace(/[-_]/g, " ");
  return team?.isCommandPost === true || type === "command post" || name === "command post";
}

function buildDefaultIncomingVolunteers(baseMs = Date.now()) {
  return [
    {
      id: "vol-1",
      name: "Handler Lisa Grant",
      role: "K9 Handler",
      organization: "El Dorado K9 SAR",
      requestedTeam: { id: 101, name: "101" },
      eta: new Date(baseMs + 30 * 1000).toISOString(),
    },
    {
      id: "vol-2",
      name: "SAR. Marcus Greene",
      role: "Ground Searcher 1",
      organization: "EDSAR Volunteer Unit",
      requestedTeam: { id: 101, name: "101" },
      eta: new Date(baseMs + 10 * 60 * 1000).toISOString(),
    },
    {
      id: "vol-3",
      name: "PM. Diane Okafor",
      role: "Paramedic / Field Medic",
      organization: "AMR Northern California",
      requestedTeam: { id: 102, name: "102" },
      eta: new Date(baseMs + 15 * 60 * 1000).toISOString(),
    },
    {
      id: "vol-4",
      name: "Spec. Joel Whitmore",
      role: "Technical Rope Rescue",
      organization: "CALSAR Volunteer Unit",
      requestedTeam: { id: 102, name: "102" },
      eta: new Date(baseMs + 25 * 60 * 1000).toISOString(),
    },
    {
      id: "vol-5",
      name: "Tech. Amy Chen",
      role: "USAR — Drone Operator",
      organization: "Cal OES Drone Team",
      requestedTeam: null,
      eta: new Date(baseMs - 5 * 60 * 1000).toISOString(),
    },
  ];
}

export default function Dashboard({
  incidentName = "Operation Granite Peak",
  incidentType = "lost_hiker",
  incidentLevel = "2",
  op = "1",
  initialTeams = [],
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
  incomingVolunteers,
  totalPersonnel = 26,
  totalTeams,
  onAddTeam,
  onSearchQuals,
  onSignOut,
  isDragEnabled = false,
  isIstAccount = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState(initialTeams);
  const [dashboardVolunteers, setDashboardVolunteers] = useState(volunteers);
  const [defaultIncoming] = useState(() => buildDefaultIncomingVolunteers());
  const now = useCurrentTime(60000);

  useEffect(() => {
    setDashboardVolunteers(volunteers);
  }, [volunteers]);

  const resolvedIncomingVolunteers = Array.isArray(incomingVolunteers)
    ? incomingVolunteers
    : Array.isArray(dashboardVolunteers) &&
        dashboardVolunteers.some((v) => v?.eta != null || v?.arrivalTime != null)
      ? dashboardVolunteers.filter(
          (v) => v?.eta != null || v?.arrivalTime != null
        )
      : defaultIncoming;

  useEffect(() => {
    return onVolunteerReassigned((membership) => {
      setDashboardVolunteers((current) =>
        current.map((volunteer) =>
          String(volunteer.id) === String(membership.volunteerId)
            ? { ...volunteer, status: membership.status }
            : volunteer
        )
      );
    });
  }, []);

  const closeCreateTeamModal = useCallback(() => {
    closeModalHelper(setIsOpen);
  }, []);

  const handleCreateTeam = useCallback((newTeam) => {
    setTeams((prev) => [...prev, newTeam]);
    setIsOpen(false);
  }, []);

  const handleAddTeam = useCallback(() => {
    if (typeof onAddTeam === "function") {
      onAddTeam();
    }
    setIsOpen(true);
  }, [onAddTeam]);

  const displayedTeamCount =
    typeof totalTeams === "number" ? totalTeams : teams.length;

  return (
    <div className="sar-dashboard">
      <DashboardHeader
        incidentName={incidentName}
        incidentType={incidentType}
        incidentLevel={incidentLevel}
        op={op}
        totalPersonnel={totalPersonnel}
        totalTeams={displayedTeamCount}
        onAddTeam={handleAddTeam}
        onSearchQuals={onSearchQuals}
        onSignOut={onSignOut}
      />

      <main className="sar-dashboard-main">
        {isIstAccount && <DragModeIndicator isDragEnabled={isDragEnabled} />}
        {teams.length === 0 ? (
          <div className="sar-dashboard-empty">
            No teams formed yet for OP {op}. Click <strong>Add Team</strong> to
            create the first team (starting at 101).
          </div>
        ) : (
          <div className="sar-teams-grid">
            {teams.map((team) => (
              <div
                key={team.id}
                className="sar-team-card"
                style={{ borderColor: `${team.accent}40` }}
              >
                <div
                  className="sar-team-card__header"
                  style={{ backgroundColor: team.accent }}
                >
                  <div>
                    <div className="sar-team-card__eyebrow">Team</div>
                    <div className="sar-team-card__name">
                      {team.name || team.number}
                    </div>
                    <div className="sar-team-card__leader">
                      Leader: {team.leader || "Unassigned"}
                    </div>
                  </div>
                </div>
                <div
                  className="sar-team-card__body"
                  style={{ backgroundColor: team.tint }}
                >
                  {isCommandPostTeam(team) ? (
                    <>
                      <IstSubTeam members={getIstMembers(team)} />
                      <div className="sar-standby-list">
                        <div className="sar-standby-list__heading">
                          <span>Standby volunteers</span>
                          <span>{getStandbyMembers(team).length}</span>
                        </div>
                        {getStandbyMembers(team).length > 0 ? (
                          getStandbyMembers(team).map((member, index) => (
                            <CompactVolunteerTab
                              key={memberValue(member, "id") || `standby-${index}`}
                              volunteer={member}
                            />
                          ))
                        ) : (
                          <p className="sar-team-card__empty">No standby volunteers assigned.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="sar-team-card__empty">No members assigned yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <section
          className="sar-incoming-volunteers"
          aria-label="Incoming Volunteers"
        >
          <div className="sar-incoming-volunteers__header">
            <span className="sar-incoming-volunteers__title">
              Incoming Volunteers
            </span>
            <span className="sar-incoming-volunteers__count">
              {resolvedIncomingVolunteers.length} inbound
            </span>
          </div>
          {resolvedIncomingVolunteers.length === 0 ? (
            <div className="sar-incoming-volunteers__empty">
              All volunteers have been deployed.
            </div>
          ) : (
            <div className="sar-incoming-volunteers__list">
              {resolvedIncomingVolunteers.map((vol, index) => {
                const requestedTeamName =
                  typeof vol.requestedTeam === "string"
                    ? vol.requestedTeam
                    : vol.requestedTeam?.name;
                return (
                  <div
                    key={vol.id || `${vol.name}-${index}`}
                    className="sar-incoming-volunteers__row"
                  >
                    <div className="sar-incoming-volunteers__info">
                      <span className="sar-incoming-volunteers__name">
                        {vol.name}
                      </span>
                      {(requestedTeamName || vol.role || vol.organization) && (
                        <span className="sar-incoming-volunteers__meta">
                          {requestedTeamName
                            ? `Requested Team: ${requestedTeamName}`
                            : vol.role || vol.organization}
                        </span>
                      )}
                    </div>
                    <EtaDisplay
                      arrivalTime={vol.eta ?? vol.arrivalTime}
                      now={now}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <CreateTeamModal
        isOpen={isOpen}
        onClose={closeCreateTeamModal}
        onSubmit={handleCreateTeam}
        existingTeams={teams}
        volunteers={dashboardVolunteers}
        op={op}
      />
    </div>
  );
}
