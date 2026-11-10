import { useCallback, useState } from "react";
import {
  CreateTeamModal,
  closeCreateTeamModal as closeModalHelper,
  getNextTeamNumber,
  calculateLocalNextTeamNumber,
  TEAM_PALETTE,
  DEFAULT_INCIDENT_VOLUNTEERS,
} from "./CreateTeamModal";
import "./Dashboard.css";

export {
  CreateTeamModal,
  closeModalHelper as closeCreateTeamModal,
  getNextTeamNumber,
  calculateLocalNextTeamNumber,
  TEAM_PALETTE,
  DEFAULT_INCIDENT_VOLUNTEERS,
};

/**
 * Incident Dashboard page shell with "Add Team" button and CreateTeamModal (DT-48).
 * Kept minimal so other dashboard subtasks can plug in cleanly.
 */
export default function Dashboard({
  incidentName = "Operation Granite Peak",
  op = "1",
  initialTeams = [],
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
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

  return (
    <div className="sar-dashboard">
      {/* Header bar with Add Team button */}
      <header className="sar-dashboard-header">
        <div className="sar-dashboard-header__top">
          <div className="sar-dashboard-brand">
            <span className="sar-dashboard-logo" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
              </svg>
            </span>
            <span className="sar-dashboard-brand__name">SARLINK</span>
            <span className="sar-dashboard-brand__agency">EDSAR</span>
          </div>

          <nav className="sar-dashboard-nav" aria-label="Primary">
            <a href="/incident-hub" className="sar-dashboard-nav__link">
              Incidents
            </a>
          </nav>
        </div>

        <div className="sar-dashboard-header__sub">
          <div className="sar-dashboard-incident-info">
            <div className="sar-dashboard-incident-title-row">
              <span className="sar-dashboard-incident-name">{incidentName}</span>
              <span className="sar-dashboard-badge sar-dashboard-badge--active">
                ACTIVE
              </span>
              <span className="sar-dashboard-badge sar-dashboard-badge--op">
                OP {op}
              </span>
            </div>
            <p className="sar-dashboard-incident-meta">
              ICS · Lost Hiker / SAR · Operational Period {op}
            </p>
          </div>

          <div className="sar-dashboard-actions">
            <button
              type="button"
              className="sar-add-team-btn"
              onClick={() => setIsOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 2v10M2 7h10"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              Add Team
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="sar-dashboard-main">
        {teams.length === 0 ? (
          <div className="sar-dashboard-empty">
            No teams formed yet for OP {op}. Click <strong>Add Team</strong> to create the first team (starting at 101).
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
                  <p className="sar-team-card__empty">
                    No members assigned yet.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Team Modal */}
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

