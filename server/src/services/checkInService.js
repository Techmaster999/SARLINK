import {
    findActiveCheckInByVolunteerId,
    insertVolunteerCheckIn,
    markCheckInClosed,
    saveCheckInTeam,
    markCheckInSubmitted,
    replaceCheckInResources,
} from "../models/checkIn.model.js";
import { findTeamById } from "../models/team.model.js";
import { pool } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";

const FOREIGN_KEY_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";
const CHECK_IN_LOCKED = "SL409"; // raised by the trigger in migration 007

/**
 * Locks a check-in after the volunteer submits it. From then on the database rejects any
 * change to the volunteer's values (arrival/checkout time, incident, etc.); only the IST
 * team assignment can still change. Calling it again on a locked check-in is a no-op.
 *
 * @returns {Promise<object>} the check-in, with submittedAt set and isLocked: true
 */
export async function lockSubmittedCheckIn(checkInId, { db = pool } = {}) {
    const result = await markCheckInSubmitted(checkInId, db);
    if (!result) {
        throw new HttpError(404, "That check-in doesn't exist.", {
            checkInId: "That check-in doesn't exist.",
        });
    }
    return result.checkIn;
}

/**
 * Turns the database's "already submitted" error into a 409. Wrap any future volunteer
 * update (arrival/checkout time, incident, ...) with this, e.g. in a catch block.
 */
export function rethrowIfCheckInLocked(err) {
    if (err?.code === CHECK_IN_LOCKED) {
        throw new HttpError(409, "This check-in was already submitted and can't be edited.");
    }
    throw err;
}

/**
 * Saves the selected resources with the volunteer's check-in, replacing any saved before.
 * The resources are stored with the check-in's volunteer and incident. Duplicate or unknown
 * resource types are rejected (400), as are changes to a missing (404) or submitted (409) check-in.
 *
 * @param {number} checkInId
 * @param {string[]} resources resource types, e.g. ["vehicle", "radio"]; [] clears them
 * @returns {Promise<{ checkInId: number, volunteerId: number, incidentId: number,
 *   resources: string[] }>}
 */
export async function saveVolunteerResources(checkInId, resources, { db = pool } = {}) {
    let saved;
    try {
        saved = await replaceCheckInResources(checkInId, resources, db);
    } catch (err) {
        // Backstops for callers that skip validateCheckInResources; the database enforces both.
        if (err.code === UNIQUE_VIOLATION && err.constraint === "volunteer_check_in_resources_pkey") {
            throw new HttpError(400, "Each resource can only be listed once.", {
                resources: "Each resource can only be listed once.",
            });
        }
        if (err.code === CHECK_VIOLATION || err.code === "22P02") { // 22P02: not a list of text
            throw new HttpError(400, "That isn't a valid resource type.", {
                resources: "That isn't a valid resource type.",
            });
        }
        throw err; // unexpected -> 500 via the error handler
    }

    if (!saved) {
        throw new HttpError(404, "That check-in doesn't exist.", {
            checkInId: "That check-in doesn't exist.",
        });
    }
    if (saved.locked) {
        throw new HttpError(409, "This check-in was already submitted and can't be edited.");
    }
    return saved;
}

/**
 * Saves the selected team with the volunteer's check-in record. The check-in already
 * carries the volunteer and incident, so the assignment is tied to both. The team must
 * exist and belong to the same incident; a check-in holds at most one team.
 *
 * @returns {Promise<{ id: number, volunteerId: number, incidentId: number, teamId: number,
 *   checkedInAt: string, teamAssignedAt: string }>}
 */
export async function assignVolunteerToTeam(checkInId, teamId, { db = pool } = {}) {
    let checkIn;
    try {
        checkIn = await saveCheckInTeam(checkInId, teamId, db);
    } catch (err) {
        if (err.code === FOREIGN_KEY_VIOLATION && err.constraint === "volunteer_check_ins_team_fkey") {
            // Same constraint covers both cases; look up the team to give the right message.
            const team = await findTeamById(teamId, db);
            if (!team) {
                throw new HttpError(404, "That team doesn't exist.", {
                    teamId: "That team doesn't exist.",
                });
            }
            throw new HttpError(409, "That team belongs to a different incident.", {
                teamId: "That team belongs to a different incident.",
            });
        }
        throw err; // unexpected -> 500 via the error handler
    }

    if (!checkIn) {
        throw new HttpError(404, "That check-in doesn't exist.", {
            checkInId: "That check-in doesn't exist.",
        });
    }
    return checkIn;
}

/**
 * Checks whether the given volunteer currently has an active (unclosed) incident check-in.
 *
 * @param {number|string} volunteerId
 * @returns {Promise<boolean>}
 */
export async function hasActiveIncidentCheckIn(volunteerId, { db = pool } = {}) {
    const parsedId = Number(volunteerId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new HttpError(400, "Volunteer ID must be a positive whole number.", {
            volunteerId: "Volunteer ID must be a positive whole number.",
        });
    }
    const existing = await findActiveCheckInByVolunteerId(parsedId, db);
    return Boolean(existing);
}

/**
 * Creates a new incident check-in for a volunteer, enforcing that the volunteer
 * cannot be checked into more than one active incident at a time.
 */
export async function createVolunteerCheckIn(
    { volunteerId, incidentId, teamId = null },
    { db = pool } = {},
) {
    const parsedVolunteerId = Number(volunteerId);
    const parsedIncidentId = Number(incidentId);

    if (!Number.isInteger(parsedVolunteerId) || parsedVolunteerId <= 0) {
        throw new HttpError(400, "Volunteer ID must be a positive whole number.", {
            volunteerId: "Volunteer ID must be a positive whole number.",
        });
    }
    if (!Number.isInteger(parsedIncidentId) || parsedIncidentId <= 0) {
        throw new HttpError(400, "Incident ID must be a positive whole number.", {
            incidentId: "Incident ID must be a positive whole number.",
        });
    }

    const alreadyCheckedIn = await hasActiveIncidentCheckIn(parsedVolunteerId, { db });
    if (alreadyCheckedIn) {
        throw new HttpError(
            409,
            "You are already checked into an active incident and cannot check into more than one incident at a time.",
            {
                volunteerId:
                    "You are already checked into an active incident and cannot check into more than one incident at a time.",
            },
        );
    }

    try {
        return await insertVolunteerCheckIn(
            {
                volunteerId: parsedVolunteerId,
                incidentId: parsedIncidentId,
                teamId,
            },
            db,
        );
    } catch (err) {
        if (
            err.code === UNIQUE_VIOLATION &&
            (err.constraint === "volunteer_check_ins_volunteer_key" ||
                err.constraint === "volunteer_check_ins_active_volunteer_key")
        ) {
            throw new HttpError(
                409,
                "You are already checked into an active incident and cannot check into more than one incident at a time.",
                {
                    volunteerId:
                        "You are already checked into an active incident and cannot check into more than one incident at a time.",
                },
            );
        }
        if (err.code === FOREIGN_KEY_VIOLATION) {
            throw new HttpError(404, "That volunteer or incident doesn't exist.");
        }
        throw err;
    }
}

/**
 * Closes an existing check-in so the volunteer can check into another incident later.
 */
export async function closeVolunteerCheckIn(checkInId, { db = pool } = {}) {
    const parsedId = Number(checkInId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        throw new HttpError(400, "Check-in ID must be a positive whole number.", {
            checkInId: "Check-in ID must be a positive whole number.",
        });
    }
    const closed = await markCheckInClosed(parsedId, db);
    if (!closed) {
        throw new HttpError(404, "That check-in doesn't exist.", {
            checkInId: "That check-in doesn't exist.",
        });
    }
    return closed;
}
