import { api } from "./client";

/**
 * Sends a validated incident to the backend, which saves it to the database.
 *
 * @param {object} incident - Values from CreateIncidentForm (already validated in the browser).
 * @returns {Promise<object>} The saved incident as returned by the server (includes id, createdAt).
 * @throws {Error} With a readable `message`, plus `fieldErrors` ({ field: message })
 *   when the server rejected specific fields (e.g. duplicate Case ID).
 */
export async function createIncidentRecord(incident) {
  try {
    const { data } = await api.post("/incidents", incident);
    return data;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

function toFriendlyError(err) {
  // Server answered with an error status (400, 409, 500…)
  if (err.response) {
    const { message, errors } = err.response.data ?? {};
    const friendly = new Error(message || `Couldn't create the incident (error ${err.response.status}).`);
    friendly.status = err.response.status;
    friendly.fieldErrors = errors; // { caseId: "An incident with this Case ID already exists." }
    return friendly;
  }
  // No response: server down, wrong URL, offline, or timed out
  return new Error("Couldn't reach the server. Check your connection and try again.");
}