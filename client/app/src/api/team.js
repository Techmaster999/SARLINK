import { api } from "./client";

/**
 * Moves a volunteer onto a new team (they're taken off their current team).
 * Only IST accounts are allowed; the server answers 401/403 otherwise.
 *
 * @param {string} volunteerId
 * @param {number|string} newTeamId
 * @returns {Promise<{ volunteerId: string, teamId: number, previousTeamId: number|null,
 *   incidentId: number, assignedAt: string }>}
 * @throws {Error} With a readable `message` starting "Couldn't reassign the volunteer",
 *   plus `status` and `fieldErrors` ({ teamId: "That team doesn't exist." }) when available.
 */
export async function reassignVolunteerToTeam(volunteerId, newTeamId) {
  try {
    const { data } = await api.put(
      `/teams/${encodeURIComponent(newTeamId)}/volunteers/${encodeURIComponent(volunteerId)}`,
    );
    return data;
  } catch (err) {
    throw toReassignError(err);
  }
}

export async function saveVolunteerOrder(teamId, orderedVolunteerIds) {
  try {
    const { data } = await api.patch(
      `/teams/${encodeURIComponent(teamId)}/volunteer-order`,
      { orderedVolunteerIds },
    );
    return data;
  } catch (err) {
    throw toVolunteerOrderError(err);
  }
}

function toReassignError(err) {
  const base = "Couldn't reassign the volunteer.";

  // Server answered with an error status (400, 401, 403, 404, 500…)
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

function toVolunteerOrderError(err) {
  const base = "Couldn't save the volunteer order.";

  if (err.response) {
    const { status, data } = err.response;
    const detail = status < 500 && data?.message && data.message !== base ? ` ${data.message}` : "";
    const friendly = new Error(`${base}${detail}`);
    friendly.status = status;
    friendly.fieldErrors = data?.errors;
    return friendly;
  }
  return new Error(`${base} Couldn't reach the server. Check your connection and try again.`);
}
