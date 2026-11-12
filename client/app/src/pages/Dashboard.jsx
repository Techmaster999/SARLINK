/* Incident Dashboard page shell rendering DashboardHeader (DT-240) */
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
import "./Dashboard.css";

export {
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
  totalPersonnel = 26,
  totalTeams = 7,
  onAddTeam,
  onSearchQuals,
  onSignOut,
}) {
  return (
    <div className="sar-dashboard">
      <DashboardHeader
        incidentName={incidentName}
        incidentType={incidentType}
        incidentLevel={incidentLevel}
        op={op}
        totalPersonnel={totalPersonnel}
        totalTeams={totalTeams}
        onAddTeam={onAddTeam}
        onSearchQuals={onSearchQuals}
        onSignOut={onSignOut}
      />

      <main className="sar-dashboard-main">
        {/* Dashboard body content is populated by the respective dashboard subtasks */}
      </main>
    </div>
  );
}

