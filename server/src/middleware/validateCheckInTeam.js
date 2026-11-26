import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// Checks PUT /api/check-ins/:checkInId/team before anything touches the database.
// Whether the team exists and belongs to the check-in's incident is checked by the
// database (foreign key), so it can't change between the check and the save.

const positiveId = (label) =>
  z.coerce
    .number({ error: `${label} is required.` })
    .int(`${label} must be a whole number.`)
    .positive(`${label} must be a positive number.`);

export const checkInTeamSchema = z.object({
  checkInId: positiveId("Check-in ID"),
  teamId: positiveId("Team ID"),
});

/** Express middleware: 400 with { message, errors: { field: message } } if an ID is invalid. */
export function validateCheckInTeam(req, res, next) {
  const result = checkInTeamSchema.safeParse({
    checkInId: req.params?.checkInId,
    teamId: req.body?.teamId,
  });

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "The volunteer couldn't be assigned to that team.", errors));
  }
  res.locals.checkInTeam = result.data; // cleaned: both IDs as numbers
  next();
}
