import {
    assignVolunteerToTeam,
    closeVolunteerCheckIn,
    createVolunteerCheckIn,
    hasActiveIncidentCheckIn,
    lockSubmittedCheckIn,
    saveVolunteerResources,
} from "../services/checkInService.js";
import { HttpError } from "../utils/httpError.js";

export { hasActiveIncidentCheckIn };

// POST /api/check-ins — checks a volunteer into an incident if they don't already have an active check-in.
export async function createCheckIn(req, res, next) {
    try {
        const volunteerId = req.body?.volunteerId ?? req.session?.user?.volunteerId ?? req.session?.user?.id;
        const incidentId = req.body?.incidentId;
        const teamId = req.body?.teamId ?? null;
        const checkIn = await createVolunteerCheckIn(
            { volunteerId, incidentId, teamId },
            { db: req.app?.locals?.db },
        );
        res.status(201).location(`/api/check-ins/${checkIn.id}`).json(checkIn);
    } catch (err) {
        next(err);
    }
}

// POST /api/check-ins/:checkInId/close — closes an active check-in so the volunteer can check in again.
export async function closeCheckIn(req, res, next) {
    try {
        const checkIn = await closeVolunteerCheckIn(req.params.checkInId, {
            db: req.app?.locals?.db,
        });
        res.status(200).json(checkIn);
    } catch (err) {
        next(err);
    }
}

// PUT /api/check-ins/:checkInId/resources — saves the volunteer's selected resources.
export async function saveCheckInResources(req, res, next) {
    try {
        const { checkInId, resources } = res.locals.checkInResources; // set by validateCheckInResources
        const saved = await saveVolunteerResources(checkInId, resources, { db: req.app.locals.db });
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
