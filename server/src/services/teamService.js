import { insertTeam } from "../models/team.model.js";
import { upsertTeamMembership } from "../models/teamMember.model.js";
import { broadcast, EVENTS } from "../realtime/socket.js";
import { HttpError } from "../utils/httpError.js";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const CHECK_VIOLATION = "23514";

/** Saves a new team linked to the given incident and returns it (with its new ID). */
export async function createTeam(name, leaderId, color, incidentId, { db } = {}) {
    try {
        return await insertTeam({ name, leaderId, color, incidentId }, db);
    } catch (err) {
        if (err.code === UNIQUE_VIOLATION && err.constraint === "teams_incident_name_key") {
            throw new HttpError(409, "A team with this name already exists for this incident.", {
                name: "A team with this name already exists for this incident.",
            });
        }
        if (err.code === FOREIGN_KEY_VIOLATION) {
            throw new HttpError(404, "That incident doesn't exist.", {
                incidentId: "That incident doesn't exist.",
            });
        }
        if (err.code === CHECK_VIOLATION) {
            throw new HttpError(400, "Some team details are invalid.");
        }
        throw err; // unexpected -> 500 via the error handler
    }
}

/**
 * Moves a volunteer onto a new team, taking them off whatever team they were on.
 * A volunteer is only ever on one team (enforced by the team_members primary key).
 * After saving, tells every open dashboard so it can update without a refresh.
 *
 * @returns {Promise<{ volunteerId: string, teamId: number, previousTeamId: number|null,
 *   incidentId: number, assignedAt: string }>}
 */
export async function reassignVolunteerToTeam(volunteerId, newTeamId, { db, notify = broadcast } = {}) {
    let membership;
    try {
        membership = await upsertTeamMembership(volunteerId, newTeamId, db);
    } catch (err) {
        if (err.code === FOREIGN_KEY_VIOLATION) {
            throw new HttpError(404, "That team doesn't exist.", {
                teamId: "That team doesn't exist.",
            });
        }
        if (err.code === CHECK_VIOLATION) {
            throw new HttpError(400, "Some volunteer details are invalid.");
        }
        throw err; // unexpected -> 500 via the error handler
    }

    // Only announce real moves; re-saving the same team changes nothing on screen.
    if (membership.previousTeamId !== membership.teamId) {
        notify(EVENTS.VOLUNTEER_REASSIGNED, membership);
    }
    return membership;
}
