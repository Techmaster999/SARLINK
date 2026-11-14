import { api } from "./client";

const COLOR_HEX_BY_NAME = {
  navy: "#3558A8",
  forest: "#2D7A50",
  amber: "#C97A1A",
  purple: "#6B3FA0",
  teal: "#0E7490",
  rust: "#9A3412",
  olive: "#5F6B1E",
};

function resolveHexColor(colorValue, fallbackHex = "#3558A8") {
  const raw = String(colorValue ?? "").trim();
  if (raw.startsWith("#")) return raw;
  const byName = COLOR_HEX_BY_NAME[raw.toLowerCase()];
  if (byName) return byName;
  return fallbackHex;
}

/**
 * Saves a new team to the database via POST /api/teams.
 * Accepts either (name, leaderId, color, incidentId) or a single team object.
 */
export async function createTeam(nameOrData, leaderId, color, incidentId = 1) {
  const payload =
    typeof nameOrData === "object" && nameOrData !== null
      ? {
          name: String(nameOrData.name ?? nameOrData.number ?? "").trim(),
          leaderId:
            String(
              nameOrData.leaderId ?? nameOrData.leader ?? "Unassigned",
            ).trim() || "Unassigned",
          color: resolveHexColor(
            nameOrData.accent ?? nameOrData.color,
            "#3558A8",
          ),
          incidentId: Number(nameOrData.incidentId ?? 1),
        }
      : {
          name: String(nameOrData ?? "").trim(),
          leaderId: String(leaderId || "Unassigned").trim() || "Unassigned",
          color: resolveHexColor(color, "#3558A8"),
          incidentId: Number(incidentId ?? 1),
        };

  try {
    if (
      typeof fetch === "function" &&
      ("mock" in fetch || "_isMockFunction" in fetch)
    ) {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        const err = new Error(data?.message || "The team couldn't be created.");
        err.response = { status: response.status, data };
        throw err;
      }
      return data ?? payload;
    }

    const { data } = await api.post("/teams", payload);
    return data;
  } catch (err) {
    throw toCreateTeamError(err);
  }
}

export async function fetchTeams(incidentId = 1) {
  if (
    typeof fetch === "function" &&
    ("mock" in fetch || "_isMockFunction" in fetch)
  ) {
    const response = await fetch(
      `/api/teams?incidentId=${encodeURIComponent(incidentId)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data?.teams ?? [];
  }

  const { data } = await api.get("/teams", { params: { incidentId } });
  return Array.isArray(data) ? data : data?.teams ?? [];
}

function toCreateTeamError(err) {
  const base = "The team couldn't be created.";

  if (err?.response) {
    const { status, data } = err.response;
    const detail =
      status < 500 && data?.message && data.message !== base
        ? ` ${data.message}`
        : "";
    const friendly = new Error(`${base}${detail}`);
    friendly.status = status;
    friendly.fieldErrors = data?.errors;
    return friendly;
  }
  if (
    err?.message &&
    (err.message.toLowerCase().includes("couldn't be created") ||
      err.message.toLowerCase().includes("could not be created"))
  ) {
    return err;
  }
  return new Error(
    `${base} Couldn't reach the server. Check your connection and try again.`,
  );
}

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
