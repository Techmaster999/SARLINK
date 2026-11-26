import { api } from "./client";
import { DEMO_TEAMS } from "../../../src/features/incidentOptions";
import { formatEta, getEtaStatus } from "../pages/EtaDisplay";

const TEAM_BY_ID = new Map(DEMO_TEAMS.map((team) => [team.id, team]));

/** Called team id ('k9-area') → { id, label, category }. Unknown ids use the id as the label. */
export function toTeamAssignment(id) {
  const team = TEAM_BY_ID.get(id);
  return { id, label: team?.label ?? String(id), category: team?.category ?? null };
}

/**
 * Gets the team assignments (roles) a volunteer can check in with for the incident.
 *
 * @param {number|string} incidentId
 * @returns {Promise<Array<{ id: string, label: string, category: string|null }>>}
 * @throws {Error} With a readable `message`, plus `status` and `fieldErrors` when available.
 */
export async function fetchTeamAssignments(incidentId) {
  try {
    const { data } = await api.get(
      `/incidents/${encodeURIComponent(incidentId)}/team-assignments`,
    );
    return (Array.isArray(data) ? data : []).map(toTeamAssignment);
  } catch (err) {
    throw toFriendlyError(err, "Couldn't load the team assignments.");
  }
}

/**
 * Saves a volunteer's check-in to the incident.
 *
 * @param {number|string} incidentId
 * @param {{ name: string, role: string, eta?: string|null }} checkIn - `role` is a team assignment id.
 * @returns {Promise<{ message: string, checkIn: { id: number, incidentId: number,
 *   incidentName: string, name: string, role: string, roleLabel: string,
 *   status: string, eta: string|null, createdAt: string } }>}
 *   `message` is the confirmation to show after a successful check-in.
 * @throws {Error} With a readable `message` starting "Couldn't check in", plus `status`
 *   and `fieldErrors` ({ role: "That team assignment isn't available…" }) when available.
 */
export async function submitCheckIn(incidentId, { name, role, eta = null }) {
  try {
    const { data } = await api.post(
      `/incidents/${encodeURIComponent(incidentId)}/check-ins`,
      { name, role, eta },
    );
    return {
      ...data,
      checkIn: { ...data.checkIn, roleLabel: toTeamAssignment(data.checkIn?.role).label },
    };
  } catch (err) {
    throw toFriendlyError(err, "Couldn't check in.");
  }
}

/**
 * Gets the volunteers heading to the incident, in the shape the dashboard's
 * Incoming Volunteers panel expects (role = team assignment label).
 *
 * @param {number|string} incidentId
 * @returns {Promise<Array<{ id: number, name: string, organization: string, role: string,
 *   requestedTeam: object|null, status: 'en-route'|'delayed', eta: string, etaMinutes: number|null }>>}
 */
export async function fetchIncomingVolunteers(incidentId) {
  try {
    const { data } = await api.get(
      `/incidents/${encodeURIComponent(incidentId)}/incoming-volunteers`,
    );
    const now = new Date();
    return (Array.isArray(data) ? data : []).map((volunteer) => {
      const etaMs = volunteer.eta ? new Date(volunteer.eta).getTime() - now.getTime() : null;
      return {
        id: volunteer.id,
        name: volunteer.name,
        organization: "",
        role: volunteer.role ? toTeamAssignment(volunteer.role).label : "—",
        requestedTeam: volunteer.requestedTeam ?? null,
        status: volunteer.eta && getEtaStatus(volunteer.eta, now) === "overdue" ? "delayed" : "en-route",
        eta: volunteer.eta ? formatEta(volunteer.eta, now) : "",
        etaMinutes: etaMs == null || Number.isNaN(etaMs) ? null : Math.max(0, Math.round(etaMs / 60000)),
      };
    });
  } catch (err) {
    throw toFriendlyError(err, "Couldn't load the incoming volunteers.");
  }
}

function toFriendlyError(err, base) {
  // Server answered with an error status (400, 401, 404, 500…)
  if (err.response) {
    const { status, data } = err.response;
    // 5xx messages are generic server text, so just show the base message.
    const detail = status < 500 && data?.message && data.message !== base ? ` ${data.message}` : "";
    const friendly = new Error(`${base}${detail}`);
    friendly.status = status;
    friendly.fieldErrors = data?.errors;
    return friendly;
  }
  // No response: server down, wrong URL, offline, or timed out
  return new Error(`${base} Couldn't reach the server. Check your connection and try again.`);
}
