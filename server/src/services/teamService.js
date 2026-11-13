import { findTeamById, insertTeam } from "../models/team.model.js";
import {
    saveTeamMemberOrder,
    upsertTeamMembership,
} from "../models/teamMember.model.js";
import { saveVolunteerStatus } from "../models/volunteer.model.js";
import { pool } from "../config/db.js";
import { broadcast, EVENTS } from "../realtime/socket.js";
import { HttpError } from "../utils/httpError.js";

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
const CHECK_VIOLATION = "23514";

export function getStatusForTeam(team) {
    return team?.name?.trim().toLowerCase() === "command post" ? "Standby" : "Assigned";
}

export async function updateVolunteerStatus(volunteerId, teamId, { db = pool } = {}) {
    const team = await findTeamById(teamId, db);
    if (!team) {
        throw new HttpError(404, "That team doesn't exist.", {
            teamId: "That team doesn't exist.",
        });
    }

    const status = getStatusForTeam(team);
    const volunteer = await saveVolunteerStatus(volunteerId, status, db);
    if (!volunteer) {
        throw new HttpError(404, "That volunteer doesn't exist.", {
            volunteerId: "That volunteer doesn't exist.",
        });
    }
    return volunteer;
}

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
 *   incidentId: number, assignedAt: string, status: 'Assigned'|'Standby' }>}
 */
export async function reassignVolunteerToTeam(volunteerId, newTeamId, { db, notify = broadcast } = {}) {
    const connection = db ?? pool;
    const client = await connection.connect();
    let membership;
    try {
        await client.query("BEGIN");
        membership = await upsertTeamMembership(volunteerId, newTeamId, client);
        const volunteerStatus = await updateVolunteerStatus(volunteerId, newTeamId, { db: client });
        await client.query("COMMIT");
        membership = { ...membership, status: volunteerStatus.status };
    } catch (err) {
        await client.query("ROLLBACK");
        if (err.code === FOREIGN_KEY_VIOLATION) {
            throw new HttpError(404, "That team doesn't exist.", {
                teamId: "That team doesn't exist.",
            });
        }
        if (err.code === CHECK_VIOLATION) {
            throw new HttpError(400, "Some volunteer details are invalid.");
        }
        throw err; // unexpected -> 500 via the error handler
    } finally {
        client.release();
    }

    // Only announce real moves; re-saving the same team changes nothing on screen.
    if (membership.previousTeamId !== membership.teamId) {
        notify(EVENTS.VOLUNTEER_REASSIGNED, membership);
    }
    return membership;
}

export async function saveTeamVolunteerOrder(teamId, orderedVolunteerIds, { db } = {}) {
    const result = await saveTeamMemberOrder(teamId, orderedVolunteerIds, db);

    if (!result.teamExists) {
        throw new HttpError(404, "That team doesn't exist.", {
            teamId: "That team doesn't exist.",
        });
    }
    if (!result.orderValid || result.updatedCount !== orderedVolunteerIds.length) {
        throw new HttpError(400, "The order must include every volunteer on this team.", {
            orderedVolunteerIds: "The order must include every volunteer on this team.",
        });
    }

    return {
        teamId: Number(teamId),
        orderedVolunteerIds,
    };
}
