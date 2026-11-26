import { checkInVolunteer, getIncomingVolunteers, getTeamAssignments } from "../services/volunteerService.js";

export async function listIncomingVolunteers(req, res, next) {
    try {
        const { incidentId } = res.locals.incidentParams; // set by validateIncidentId
        const volunteers = await getIncomingVolunteers(incidentId, { db: req.app.locals.db });
        res.status(200).json(volunteers);
    } catch (err) {
        next(err);
    }
}

export async function listTeamAssignments(req, res, next) {
    try {
        const { incidentId } = res.locals.incidentParams; // set by validateIncidentId
        const assignments = await getTeamAssignments(incidentId, { db: req.app.locals.db });
        res.status(200).json(assignments);
    } catch (err) {
        next(err);
    }
}

export async function createCheckIn(req, res, next) {
    try {
        const { incidentId } = res.locals.incidentParams; // set by validateIncidentId
        const confirmation = await checkInVolunteer(incidentId, res.locals.checkIn, {
            db: req.app.locals.db,
        });
        res.status(201).json(confirmation);
    } catch (err) {
        next(err);
    }
}
