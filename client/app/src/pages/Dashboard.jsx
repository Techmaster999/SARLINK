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
import { OperatingTeamCard } from "./OperatingTeamCard";
import { CommandPostCard } from "./CommandPostCard";
import { IncomingVolunteersBox } from "./IncomingVolunteersBox";
import {
  SAMPLE_COMMAND_POST,
  SAMPLE_INCIDENT_COMMANDER,
  SAMPLE_INCOMING_VOLUNTEERS,
  SAMPLE_TEAMS,
} from "./dashboardSampleData";
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

export default function Dashboard({
  incidentName = "Operation Granite Peak",
  incidentType = "lost_hiker",
  incidentLevel = "2",
  op = "1",
  initialTeams = SAMPLE_TEAMS,
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
  incidentCommander = SAMPLE_INCIDENT_COMMANDER,
  commandPost = SAMPLE_COMMAND_POST,
  incomingVolunteers = SAMPLE_INCOMING_VOLUNTEERS,
  totalPersonnel,
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

  useEffect(() => {
    setDashboardVolunteers(volunteers);
  }, [volunteers]);

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
    // Team numbers are unique within the operational period.
    setTeams((prev) =>
      prev.some((t) => String(t.number) === String(newTeam.number)) ? prev : [...prev, newTeam],
    );
    setIsOpen(false);
  }, []);

  // Teams are shown in number order (101, 102, …).
  const sortedTeams = [...teams].sort((a, b) => Number(a.number) - Number(b.number));

  const handleAddTeam = useCallback(() => {
    if (typeof onAddTeam === "function") {
      onAddTeam();
    }
    setIsOpen(true);
  }, [onAddTeam]);

  const displayedTeamCount =
    typeof totalTeams === "number" ? totalTeams : teams.length;
  // Everyone on a team plus everyone at the command post (the IC counts as one).
  const boardPersonnel =
    teams.reduce((sum, t) => sum + (Array.isArray(t.members) ? t.members.length : 0), 0) +
    1 +
    (commandPost?.roster?.length ?? 0) +
    (commandPost?.ist?.length ?? 0) +
    (commandPost?.standby?.length ?? 0);
  const displayedPersonnel =
    typeof totalPersonnel === "number" ? totalPersonnel : boardPersonnel;

  return (
    <div className="sar-dashboard">
      <DashboardHeader
        incidentName={incidentName}
        incidentType={incidentType}
        incidentLevel={incidentLevel}
        op={op}
        totalPersonnel={displayedPersonnel}
        totalTeams={displayedTeamCount}
        onAddTeam={handleAddTeam}
        onSearchQuals={onSearchQuals}
        onSignOut={onSignOut}
      />

      <main className="sar-dashboard-main">
        {isIstAccount && <DragModeIndicator isDragEnabled={isDragEnabled} />}
        <div className="sar-board">
          <CommandPostCard icName={incidentCommander} commandPost={commandPost} />

          {sortedTeams.length === 0 ? (
            <div className="sar-dashboard-empty">
              No teams formed yet for OP {op}. Use Add Team to form the first one.
            </div>
          ) : (
            <div className="sar-teams-grid">
              {sortedTeams.map((team) => (
                <OperatingTeamCard key={team.id} team={team} />
              ))}
            </div>
          )}

          <IncomingVolunteersBox volunteers={incomingVolunteers} />
        </div>
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
