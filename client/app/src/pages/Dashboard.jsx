import { useCallback, useState } from "react";
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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState(initialTeams);

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
        volunteers={volunteers}
        op={op}
      />
    </div>
  );
}
