import {
    assignVolunteerToTeam,
    getCheckInById,
    lockSubmittedCheckIn,
    saveVolunteerResources,
} from "../services/checkInService.js";
import { HttpError } from "../utils/httpError.js";

// GET /api/check-ins/:checkInId — retrieves a check-in with its volunteer, incident, and resources.
export async function getCheckIn(req, res, next) {
    try {
        const checkIn = await getCheckInById(req.params?.checkInId, { db: req.app?.locals?.db });
        res.status(200).json(checkIn);
    } catch (err) {
        next(err);
    }
}

// PUT /api/check-ins/:checkInId/resources — saves the volunteer's selected resources.
export async function saveCheckInResources(req, res, next) {
    try {
        const checkInId = res.locals?.checkInResources?.checkInId ?? req.params?.checkInId;
        const resources = res.locals?.checkInResources?.resources ?? req.body?.resources;
        const volunteerId =
            req.body?.volunteerId ??
            req.user?.volunteerId ??
            req.user?.id ??
            req.headers?.["x-volunteer-id"];
        const incidentId = req.body?.incidentId ?? req.headers?.["x-incident-id"];

        const saved = await saveVolunteerResources(checkInId, resources, {
            volunteerId,
            incidentId,
            db: req.app?.locals?.db,
        });
        res.status(200).json(saved);
    } catch (err) {
        next(err);
    }
}

export async function assignCheckInTeam(req, res, next) {
    try {
        const { checkInId, teamId } = res.locals.checkInTeam; // set by validateCheckInTeam
        const checkIn = await assignVolunteerToTeam(checkInId, teamId, { db: req.app.locals.db });
        res.status(200).json(checkIn);
    } catch (err) {
        next(err);
    }
}

// POST /api/check-ins/:checkInId/submit — locks the check-in so the volunteer can't edit it.
export async function submitCheckIn(req, res, next) {
    try {
        const checkInId = Number(req.params.checkInId);
        if (!Number.isInteger(checkInId) || checkInId <= 0) {
            throw new HttpError(400, "Check-in ID must be a positive whole number.", {
                checkInId: "Check-in ID must be a positive whole number.",
            });
        }
        const checkIn = await lockSubmittedCheckIn(checkInId, { db: req.app.locals.db });
        res.status(200).json(checkIn);
    } catch (err) {
        next(err);
    }
}
