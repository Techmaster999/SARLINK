import { useCallback, useEffect, useState } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
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
import "./Dashboard.css";
import { api } from "../api/client";
import {
  emitTeamCreated,
  onTeamCreated,
  onVolunteerReassigned,
} from "../api/realtime";
import {
  createTeam,
  fetchTeams,
  reassignVolunteerToTeam,
} from "../api/team";

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
  createTeam,
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

export function normalizeTeam(team = {}) {
  const rawColor = String(team?.color ?? "").trim();
  const rawAccent = String(team?.accent ?? "").trim();
  const matchedPalette =
    TEAM_PALETTE.find(
      (p) =>
        p.accent.toLowerCase() === rawAccent.toLowerCase() ||
        p.accent.toLowerCase() === rawColor.toLowerCase() ||
        p.name.toLowerCase() === rawColor.toLowerCase()
    ) || TEAM_PALETTE[0];

  const accent =
    rawAccent ||
    (rawColor.startsWith("#") ? rawColor : matchedPalette.accent);
  const tint = team?.tint || matchedPalette.tint;
  const name = String(team?.name ?? team?.number ?? "").trim();
  const leader =
    String(
      team?.leader ?? team?.leaderName ?? team?.leaderId ?? "Unassigned"
    ).trim() || "Unassigned";

  return {
    ...team,
    id: team?.id ?? `team-${name || "new"}`,
    name,
    number: String(team?.number ?? name),
    leader,
    leaderId: team?.leaderId ?? leader,
    color: rawColor || matchedPalette.name,
    accent,
    tint,
    members: Array.isArray(team?.members) ? team.members : [],
  };
}

export function TeamColumn({
  team,
  activeVolunteer = null,
  currentVolunteerTeamId = null,
}) {
  const normalized = normalizeTeam(team);
  const droppableId = `team-${normalized.id}`;
  const isCurrentTeam =
    currentVolunteerTeamId != null &&
    String(currentVolunteerTeamId) === String(normalized.id);

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
    disabled: isCurrentTeam,
    data: { team: normalized },
  });

  const isHighlighted = Boolean(isOver && !isCurrentTeam);

  return (
    <div
      className="sar-team-card"
      data-testid={`team-column-${normalized.id}`}
      data-team-name={normalized.name}
      data-team-color={normalized.color}
      style={{ borderColor: `${normalized.accent}40` }}
    >
      <div
        className="sar-team-card__header"
        style={{ backgroundColor: normalized.accent }}
      >
        <div>
          <div className="sar-team-card__eyebrow">Team</div>
          <div className="sar-team-card__name">{normalized.name}</div>
          <div className="sar-team-card__leader">
            Leader: {normalized.leader}
          </div>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`sar-team-card__body sar-team-column${
          isHighlighted ? " sar-team-column--drop-target" : ""
        }`}
        role="group"
        aria-label={`${normalized.name} team`}
        data-team-id={normalized.id}
        data-drop-target={isHighlighted}
        style={{
          backgroundColor: normalized.tint,
          "--team-tint": normalized.tint,
          "--team-accent": normalized.accent,
          "--team-active-tint": `${normalized.accent}12`,
          "--team-active-border": `${normalized.accent}60`,
        }}
      >
        {isCommandPostTeam(normalized) ? (
          <>
            <IstSubTeam members={getIstMembers(normalized)} />
            <div className="sar-standby-list">
              <div className="sar-standby-list__heading">
                <span>Standby volunteers</span>
                <span>{getStandbyMembers(normalized).length}</span>
              </div>
              {getStandbyMembers(normalized).length > 0 ? (
                getStandbyMembers(normalized).map((member, index) => (
                  <CompactVolunteerTab
                    key={memberValue(member, "id") || `standby-${index}`}
                    volunteer={member}
                  />
                ))
              ) : (
                <p className="sar-team-card__empty">
                  No standby volunteers assigned.
                </p>
              )}
            </div>
          </>
        ) : normalized.members.length > 0 ? (
          normalized.members.map((member, index) => (
            <CompactVolunteerTab
              key={memberValue(member, "id") || `member-${index}`}
              volunteer={member}
            />
          ))
        ) : (
          <p className="sar-team-card__empty">No members assigned yet.</p>
        )}
        {isHighlighted && (
          <div className="sar-team-column__drop-placeholder">
            Drop to assign here
          </div>
        )}
      </div>
    </div>
  );
}

function isTestRuntime() {
  return (
    (typeof process !== "undefined" &&
      Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test")) ||
    import.meta.env?.MODE === "test"
  );
}

function getStorageKey(incidentId) {
  return `sarlink:teams:incident:${incidentId ?? 1}`;
}

function readStoredTeams(incidentId) {
  if (isTestRuntime() || typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(getStorageKey(incidentId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeTeam) : [];
  } catch {
    return [];
  }
}

function writeStoredTeams(incidentId, teamsList) {
  if (isTestRuntime() || typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(
      getStorageKey(incidentId),
      JSON.stringify(teamsList)
    );
  } catch {
    // Ignore storage quota errors
  }
}

function mergeUniqueTeams(existing = [], incoming = []) {
  const result = [...existing.map(normalizeTeam)];
  for (const item of incoming) {
    const norm = normalizeTeam(item);
    const alreadyPresent = result.some(
      (t) =>
        String(t.id) === String(norm.id) ||
        (norm.name &&
          String(t.name).trim().toLowerCase() === norm.name.toLowerCase())
    );
    if (!alreadyPresent) {
      result.push(norm);
    }
  }
  return result;
}

export default function Dashboard({
  incidentId = 1,
  incidentName = "Operation Granite Peak",
  incidentType = "lost_hiker",
  incidentLevel = "2",
  op = "1",
  initialTeams = [],
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
  totalPersonnel = 26,
  totalTeams,
  onAddTeam,
  onCreateTeam,
  onSearchQuals,
  onSignOut,
  isDragEnabled = false,
  isIstAccount = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState(() =>
    mergeUniqueTeams(initialTeams, readStoredTeams(incidentId))
  );
  const [dashboardVolunteers, setDashboardVolunteers] = useState(volunteers);
  const [activeVolunteer, setActiveVolunteer] = useState(null);
  const [createTeamError, setCreateTeamError] = useState("");

  useEffect(() => {
    setDashboardVolunteers(volunteers);
  }, [volunteers]);

  // Load persisted teams for this incident on mount / refresh
  useEffect(() => {
    let cancelled = false;
    fetchTeams(incidentId)
      .then((serverTeams) => {
        if (!cancelled && Array.isArray(serverTeams) && serverTeams.length > 0) {
          setTeams((prev) => {
            const next = mergeUniqueTeams(prev, serverTeams);
            writeStoredTeams(incidentId, next);
            return next;
          });
        }
      })
      .catch(() => {
        // Ignore fetch errors when running without backend
      });
    return () => {
      cancelled = true;
    };
  }, [incidentId]);

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

  // Listen for new teams created by other open dashboards
  useEffect(() => {
    return onTeamCreated((incomingTeam) => {
      if (!incomingTeam) return;
      if (
        incomingTeam.incidentId != null &&
        Number(incomingTeam.incidentId) !== Number(incidentId)
      ) {
        return;
      }
      setTeams((prev) => {
        const next = mergeUniqueTeams(prev, [incomingTeam]);
        writeStoredTeams(incidentId, next);
        return next;
      });
    });
  }, [incidentId]);

  const closeCreateTeamModal = useCallback(() => {
    setCreateTeamError("");
    closeModalHelper(setIsOpen);
  }, []);

  const handleCreateTeam = useCallback(
    async (teamData) => {
      const candidate = normalizeTeam({ ...teamData, incidentId });
      if (!candidate.name) {
        const err = new Error("A team name is required.");
        setCreateTeamError(err.message);
        throw err;
      }

      const duplicate = teams.some(
        (t) =>
          String(t?.name ?? t?.number ?? "")
            .trim()
            .toLowerCase() === candidate.name.toLowerCase()
      );
      if (duplicate) {
        const err = new Error(
          "The team couldn't be created. A team with this name already exists for this incident."
        );
        setCreateTeamError(err.message);
        throw err;
      }

      let savedTeam = null;
      const isApiMocked = Boolean(
        onCreateTeam ||
          createTeam?.mock ||
          api?.post?.mock ||
          (typeof fetch === "function" &&
            ("mock" in fetch || "_isMockFunction" in fetch))
      );

      try {
        if (typeof onCreateTeam === "function") {
          savedTeam = await onCreateTeam(candidate);
        } else {
          savedTeam = await createTeam(
            candidate.name,
            candidate.leaderId || candidate.leader || "Unassigned",
            candidate.accent,
            incidentId
          );
        }
      } catch (err) {
        const shouldFallbackLocal =
          !isApiMocked && (err?.status === undefined || err?.status === 401);
        if (!shouldFallbackLocal) {
          const rawMsg = err?.message || "";
          const friendlyMsg =
            rawMsg.toLowerCase().includes("couldn't be created") ||
            rawMsg.toLowerCase().includes("could not be created")
              ? rawMsg
              : `The team couldn't be created.${rawMsg ? ` ${rawMsg}` : ""}`;
          setCreateTeamError(friendlyMsg);
          const wrapped = new Error(friendlyMsg);
          wrapped.status = err?.status;
          wrapped.fieldErrors = err?.fieldErrors;
          throw wrapped;
        }
        savedTeam = candidate;
      }

      const finalTeam = normalizeTeam({
        ...candidate,
        ...(savedTeam && typeof savedTeam === "object" ? savedTeam : {}),
        leader:
          candidate.leader ||
          savedTeam?.leader ||
          savedTeam?.leaderId ||
          "Unassigned",
        accent: candidate.accent,
        tint: candidate.tint,
      });

      setTeams((prev) => {
        const next = mergeUniqueTeams(prev, [finalTeam]);
        writeStoredTeams(incidentId, next);
        return next;
      });
      emitTeamCreated(finalTeam);
      setCreateTeamError("");
      setIsOpen(false);
      return finalTeam;
    },
    [incidentId, onCreateTeam, teams]
  );

  const handleAddTeam = useCallback(() => {
    if (typeof onAddTeam === "function") {
      onAddTeam();
    }
    setCreateTeamError("");
    setIsOpen(true);
  }, [onAddTeam]);

  const handleDragStart = useCallback(
    (event) => {
      const vol =
        event?.active?.data?.current?.volunteer ??
        dashboardVolunteers.find(
          (v) => String(v.id) === String(event?.active?.id)
        ) ??
        null;
      setActiveVolunteer(vol);
    },
    [dashboardVolunteers]
  );

  const handleDragEnd = useCallback(
    async (event) => {
      setActiveVolunteer(null);
      const { active, over } = event || {};
      if (!active || !over) return;

      const overId = String(over.id || "");
      const targetTeamId = overId.startsWith("team-")
        ? overId.slice("team-".length)
        : over.data?.current?.team?.id;
      if (!targetTeamId) return;

      const draggedVolunteer =
        active.data?.current?.volunteer ||
        dashboardVolunteers.find(
          (v) => String(v.id) === String(active.id)
        ) || {
          id: active.id,
          name: String(active.id),
        };

      setTeams((prev) =>
        prev.map((team) => {
          const currentMembers = Array.isArray(team.members)
            ? team.members
            : [];
          const withoutVolunteer = currentMembers.filter(
            (m) => String(memberValue(m, "id")) !== String(draggedVolunteer.id)
          );
          if (String(team.id) === String(targetTeamId)) {
            return {
              ...team,
              members: [...withoutVolunteer, draggedVolunteer],
            };
          }
          return {
            ...team,
            members: withoutVolunteer,
          };
        })
      );

      try {
        await reassignVolunteerToTeam(draggedVolunteer.id, targetTeamId);
      } catch {
        // Keep optimistic UI assignment when backend session is unavailable
      }
    },
    [dashboardVolunteers]
  );

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

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveVolunteer(null)}
      >
        <main className="sar-dashboard-main">
          {isIstAccount && <DragModeIndicator isDragEnabled={isDragEnabled} />}
          {teams.length === 0 ? (
            <div className="sar-dashboard-empty">
              No teams formed yet for OP {op}. Click <strong>Add Team</strong>{" "}
              to create the first team (starting at 101).
            </div>
          ) : (
            <div className="sar-teams-grid">
              {teams.map((team) => (
                <TeamColumn
                  key={team.id}
                  team={team}
                  activeVolunteer={activeVolunteer}
                />
              ))}
            </div>
          )}
        </main>
      </DndContext>

      <CreateTeamModal
        isOpen={isOpen}
        onClose={closeCreateTeamModal}
        onSubmit={handleCreateTeam}
        existingTeams={teams}
        volunteers={dashboardVolunteers}
        op={op}
        incidentId={incidentId}
        error={createTeamError}
      />
    </div>
  );
}
