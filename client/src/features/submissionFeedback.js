import { toast } from "react-toastify";

// Where the incident hub lives. Change this if your route is different.
export const INCIDENT_HUB_PATH = "/incidents";

/**
 * Shows a success toast after an incident is saved.
 * Needs <ToastContainer /> rendered once near the root of the app (see App.jsx),
 * which is why the toast stays visible after we navigate away from the form.
 *
 * @param {{ id: number, caseId: string, incidentName: string }} incident - The saved incident from the server.
 */
export function showSubmissionConfirmation(incident) {
  toast.success(`Incident created: ${incident.incidentName} (${incident.caseId})`, {
    toastId: `incident-created-${incident.id}`, // never show the same confirmation twice
  });
}

/**
 * Sends the user back to the incident hub.
 * `replace: true` swaps the form out of the browser history, so pressing Back
 * doesn't land on a form that was already submitted.
 * `state.createdIncidentId` lets the hub highlight the new incident if it wants to.
 *
 * @param {import("react-router-dom").NavigateFunction} navigate - From useNavigate().
 * @param {{ id: number }} [incident] - The saved incident.
 */
export function redirectToIncidentHub(navigate, incident) {
  navigate(INCIDENT_HUB_PATH, {
    replace: true,
    state: incident ? { createdIncidentId: incident.id } : undefined,
  });
}