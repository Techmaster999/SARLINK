import { insertIncident } from "../models/incidentModel.js";
import { HttpError } from "../utils/httpError.js"

const UNIQUE_VIOLATION = "23505";
const CHECK_VIOLATION = "23514";

export async function createIncident(incident, { db } = {}) {
    try {
        return await insertIncident(incident, db);
    } catch (err) {
        if (err.code === UNIQUE_VIOLATION && err.constraint === "incidents_case_id_key") {
            throw new HttpError(409, "An incident with CASE ID already exists.", {
                caseId: "An incident with this case ID already exists.",
            });
        }
        if (err.code === CHECK_VIOLATION) {
            throw new HttpError(400, "Some incident details are invalid.");
        }
        throw err; // unexpected -> 500 via the error handler
    }
}