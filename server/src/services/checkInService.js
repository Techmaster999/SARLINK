import { saveCheckInTeam, markCheckInSubmitted, replaceCheckInResources } from "../models/checkIn.model.js";
import { findTeamById } from "../models/team.model.js";
import { pool } from "../config/db.js";
import { HttpError } from "../utils/httpError.js";

const FOREIGN_KEY_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";
const CHECK_IN_LOCKED = "SL409"; // raised by the trigger in migration 007

/**
 * Locks a check-in after the volunteer submits it. From then on the database rejects any
 * change to the volunteer's submitted values; only the IST team assignment can still
 * change. Calling it again on a locked check-in is a no-op.
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
 * update to submitted details with this, e.g. in a catch block.
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
