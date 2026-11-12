import { getIncomingVolunteers } from "../services/volunteerService.js";

export async function listIncomingVolunteers(req, res, next) {
    try {
        const { incidentId } = res.locals.incidentParams; // set by validateIncidentId
        const volunteers = await getIncomingVolunteers(incidentId, { db: req.app.locals.db });
        res.status(200).json(volunteers);
    } catch (err) {
        next(err);
    }
}
