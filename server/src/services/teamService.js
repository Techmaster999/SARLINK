import { insertTeam } from "../models/team.model.js";
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
