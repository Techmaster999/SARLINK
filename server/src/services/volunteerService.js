import { findIncomingVolunteers } from "../models/volunteer.model.js";
import { HttpError } from "../utils/httpError.js";

/**
 * Gets the volunteers heading to the incident, soonest ETA first, with each one's
 * name, requested team (null if none), and ETA.
 *
 * @returns {Promise<Array<{ id: number, name: string,
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
