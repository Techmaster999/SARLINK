import { findIncomingVolunteers, insertCheckIn } from "../models/volunteer.model.js";
import { findIncidentTeamAssignments } from "../models/incident.model.js";
import { HttpError } from "../utils/httpError.js";

const FOREIGN_KEY_VIOLATION = "23503";
const CHECK_VIOLATION = "23514";

/**
 * Gets the volunteers heading to the incident, soonest ETA first, with each one's
 * name, role (team assignment, null if none), requested team (null if none), and ETA.
 *
 * @returns {Promise<Array<{ id: number, name: string, role: string | null,
 *   requestedTeam: { id: number, name: string } | null, eta: string | null }>>}
 */
export async function getIncomingVolunteers(incidentId, { db } = {}) {
    const volunteers = await findIncomingVolunteers(incidentId, db);
    if (volunteers === null) {
        throw new HttpError(404, "That incident doesn't exist.", {
            incidentId: "That incident doesn't exist.",
        });
    }
    return volunteers;
}

/**
 * Gets the team assignments (called team ids, e.g. 'k9-area') available for the incident.
 *
 * @returns {Promise<string[]>}
 */
export async function getTeamAssignments(incidentId, { db } = {}) {
    const assignments = await findIncidentTeamAssignments(incidentId, db);
    if (assignments === null) {
        throw new HttpError(404, "That incident doesn't exist.", {
            incidentId: "That incident doesn't exist.",
        });
    }
    return assignments;
}

/**
 * Saves a volunteer's check-in to the incident and returns a confirmation.
 * The role must be one of the incident's available team assignments.
 *
 * @returns {Promise<{ message: string, checkIn: { id: number, incidentId: number,
 *   incidentName: string, name: string, role: string, status: string,
 *   eta: string | null, createdAt: string } }>}
 */
export async function checkInVolunteer(incidentId, { name, role, eta }, { db } = {}) {
    const assignments = await getTeamAssignments(incidentId, { db });
    if (!assignments.includes(role)) {
        throw new HttpError(400, "That team assignment isn't available for this incident.", {
            role: "That team assignment isn't available for this incident.",
        });
    }

    try {
        const checkIn = await insertCheckIn({ incidentId, name, role, eta }, db);
        return {
            message: `You're checked in to ${checkIn.incidentName}.`,
            checkIn,
        };
    } catch (err) {
        if (err.code === FOREIGN_KEY_VIOLATION) {
            throw new HttpError(404, "That incident doesn't exist.", {
                incidentId: "That incident doesn't exist.",
            });
        }
        if (err.code === CHECK_VIOLATION) {
            throw new HttpError(400, "Some check-in details are invalid.");
        }
        throw err; // unexpected -> 500 via the error handler
    }
}
