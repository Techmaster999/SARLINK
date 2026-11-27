import {
    assignVolunteerToTeam,
    createVolunteerCheckIn,
    lockSubmittedCheckIn,
    saveVolunteerResources,
} from "../services/checkInService.js";
import { getCurrentVolunteerIdentity } from "../services/authService.js";
import { HttpError } from "../utils/httpError.js";

// POST /api/check-ins — creates a check-in with the authenticated volunteer's name and SAR badge number.
export async function createCheckIn(req, res, next) {
    try {
        const identity = getCurrentVolunteerIdentity(req);
        const body = req.body ?? {};

        const attemptedName = body.volunteerName ?? body.name;
        const attemptedBadge = body.sarBadgeNumber ?? body.badgeNumber;
        const attemptedVolunteerId = body.volunteerId;

        if (
            (attemptedName != null &&
                String(attemptedName).trim() !== "" &&
                String(attemptedName).trim() !== identity.name) ||
            (attemptedBadge != null &&
                String(attemptedBadge).trim() !== "" &&
                String(attemptedBadge).trim() !== identity.badgeNumber) ||
            (attemptedVolunteerId != null &&
                identity.volunteerId != null &&
                String(attemptedVolunteerId) !== String(identity.volunteerId))
        ) {
            throw new HttpError(
                403,
                "Volunteers cannot submit a check-in for another volunteer.",
            );
        }

        const saved = await createVolunteerCheckIn(
            {
                volunteerId: identity.volunteerId,
                incidentId: Number(body.incidentId ?? 1),
                name: identity.name,
                badgeNumber: identity.badgeNumber,
                arrivalTime: body.arrivalTime ?? null,
                checkoutTime: body.checkoutTime ?? null,
                teamId: body.teamId ?? null,
            },
            { db: req.app?.locals?.db },
        );

        res.status(201).json(saved);
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
