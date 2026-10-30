import { useNavigate } from "react-router-dom";
import { C, FONT, Card, Badge } from "../components/ds";
import { CreateIncidentForm } from "../features/incidents/CreateIncidentForm";
import { useTeams } from "../features/incidents/useTeams";
import { createIncidentRecord } from "../api/incidents";
import { showSubmissionConfirmation, redirectToIncidentHub } from "../features/incidents/submissionFeedback";

// ---- Icons ------------

// ---- Page -------------

const handleCreateIncident = async (incident) => {
  const saved = await createIncidentRecord(incident);   // from the last subtask: save to DB
  showSubmissionConfirmation(saved);                    // ← NEW: criterion 1, confirmation
  redirectToIncidentHub(navigate, saved);               // ← NEW: criterion 2, redirect
};

