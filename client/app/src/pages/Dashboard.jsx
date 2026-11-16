import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
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
import { OperatingTeamCard } from "./OperatingTeamCard";
import { CommandPostCard } from "./CommandPostCard";
import { IncomingVolunteersBox } from "./IncomingVolunteersBox";
import {
  SAMPLE_COMMAND_POST,
  SAMPLE_INCIDENT_COMMANDER,
  SAMPLE_INCOMING_VOLUNTEERS,
  SAMPLE_TEAMS,
} from "./dashboardSampleData";
import { applyDrop, createBoard } from "./dashboardBoard";
import "./Dashboard.css";
import { onVolunteerReassigned } from "../api/realtime";
import { reassignVolunteerToTeam } from "../api/team";
import { EtaDisplay, formatEta, getEtaStatus, useCurrentTime } from "./EtaDisplay";

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
  if (Array.isArray(commandPostTeam?.ist)) {
    return commandPostTeam.ist;
  }
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

// Pointer position decides the drop target; keyboard drags fall back to overlap.
function collisionDetection(args) {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
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
  incidentId = 1,
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
  // Everything drag and drop can change lives in one board (see dashboardBoard.js).
  const [board, setBoard] = useState(() =>
    createBoard({ teams: initialTeams, commandPost, incoming: incomingVolunteers }),
  );
  const { teams } = board;
  // TODO: Only IST members should be able to drag and drop (the server already limits
  // reassignment to IST via requireIst). Drag is always on for now because login doesn't
  // record a user's role yet; once it does, gate this on the IST role,
  // e.g. `isIstAccount && isDragEnabled`.
  const canDrag = true;
  const [dragging, setDragging] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );
  const handleDragStart = useCallback((event) => {
    setDragging(event.active.data.current ?? null);
  }, []);
  const handleDragCancel = useCallback(() => setDragging(null), []);

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
      setBoard((current) => {
        const volunteerId = String(membership.volunteerId);
        const targetId = String(membership.teamId);
        const status = String(membership.status || "").toLowerCase();
        const sameTeam = (left, right) =>
            String(left).replace(/^team-/, "") === String(right).replace(/^team-/, "");
        const allMembers = [
            ...current.teams.flatMap((team) => team.members || []),
            ...(current.commandPost.roster || []),
            ...(current.commandPost.ist || []),
            ...(current.commandPost.standby || []),
        ];
        const existingMember = allMembers.find(
            (member) => String(memberValue(member, "id")) === volunteerId,
        ) || { id: membership.volunteerId, name: membership.volunteerId };
        const removeMember = (members) =>
            members.filter((member) => String(memberValue(member, "id")) !== volunteerId);
        const updateMember = (member) => ({ ...member, status });
        const nextTeams = current.teams.map((team) => {
            const members = removeMember(team.members || []);
            return sameTeam(team.id, targetId)
              ? { ...team, members: [...members, updateMember(existingMember)] }
              : { ...team, members };
        });
        const commandPost = current.commandPost;
        const commandPostId = commandPost.teamId ?? commandPost.id;
        const nextCommandPost =
            commandPostId != null && sameTeam(commandPostId, targetId)
              ? {
                  ...commandPost,
                  roster: removeMember(commandPost.roster || []),
                  ist: removeMember(commandPost.ist || []),
                  standby: [...removeMember(commandPost.standby || []), updateMember(existingMember)],
                }
              : {
                  ...commandPost,
                  roster: removeMember(commandPost.roster || []),
                  ist: removeMember(commandPost.ist || []),
                  standby: removeMember(commandPost.standby || []),
                };
        return { ...current, teams: nextTeams, commandPost: nextCommandPost };
      });
    });
  }, []);

  const closeCreateTeamModal = useCallback(() => {
    closeModalHelper(setIsOpen);
  }, []);

  const handleCreateTeam = useCallback((newTeam) => {
    // Team numbers are unique within the operational period.
    setBoard((prev) =>
      prev.teams.some((t) => String(t.number) === String(newTeam.number))
        ? prev
        : { ...prev, teams: [...prev.teams, newTeam] },
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

  const handleDragEnd = useCallback(
    async (event) => {
      setDragging(null);
      const { active, over } = event || {};
      if (!active || !over) return;
      const targetTeamId = over.data?.current?.team?.id;
      if (targetTeamId == null) return;
      const previous = board;
      const item = active.data?.current;
      const volunteerId = item?.memberId ?? item?.volunteerId;
      if (volunteerId == null) return;
      setBoard((current) => applyDrop(current, item, targetTeamId));
      try {
        await reassignVolunteerToTeam(volunteerId, targetTeamId);
      } catch (error) {
        setBoard(previous);
        console.error("Unable to reassign volunteer:", error);
      }
    },
    [board]
  );

  const displayedTeamCount =
    typeof totalTeams === "number" ? totalTeams : teams.length;
  // Everyone on a team plus everyone at the command post (the IC counts as one).
  const boardPersonnel =
    teams.reduce((sum, t) => sum + (Array.isArray(t.members) ? t.members.length : 0), 0) +
    1 +
    board.commandPost.roster.length +
    board.commandPost.ist.length +
    board.commandPost.standby.length;
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
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="sar-board">
            <CommandPostCard
              icName={incidentCommander}
              commandPost={board.commandPost}
              dragEnabled={canDrag}
            />

            {sortedTeams.length === 0 ? (
              <div className="sar-dashboard-empty">
                No teams formed yet for OP {op}. Use Add Team to form the first one.
              </div>
            ) : (
              <div className="sar-teams-grid">
                {sortedTeams.map((team) => (
                  <OperatingTeamCard key={team.id} team={team} dragEnabled={canDrag} />
                ))}
              </div>
            )}

            <IncomingVolunteersBox volunteers={board.incoming} dragEnabled={canDrag} />
          </div>

          <DragOverlay dropAnimation={null}>
            {dragging ? (
              <div className="sar-volunteer-tab sar-volunteer-tab--overlay" aria-hidden="true">
                {dragging.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      <CreateTeamModal
        isOpen={isOpen}
        onClose={closeCreateTeamModal}
        onSubmit={handleCreateTeam}
        existingTeams={teams}
        volunteers={dashboardVolunteers}
        op={op}
        incidentId={incidentId}
      />
    </div>
  );
}
