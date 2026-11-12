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
  initialTeams = [],
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
  totalPersonnel = 26,
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
                  <p className="sar-team-card__empty">No members assigned yet.</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
