import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// Checks the IDs in PUT /api/teams/:teamId/volunteers/:volunteerId before anything
// touches the database. Whether the team actually exists is checked by the database
// (foreign key), so it can't change between the check and the save.

export const volunteerReassignmentSchema = z.object({
  teamId: z.coerce
    .number({ error: "Team ID is required." })
    .int("Team ID must be a whole number.")
    .positive("Team ID must be a positive number."),
  volunteerId: z
    .string({ error: "Volunteer ID is required." })
    .trim()
    .min(1, "Volunteer ID is required.")
    .max(100, "Volunteer ID must be 100 characters or fewer."),
});

/** Express middleware: 400 with { message, errors: { field: message } } if an ID is invalid. */
export function validateVolunteerReassignment(req, res, next) {
  const result = volunteerReassignmentSchema.safeParse(req.params ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "params");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "The volunteer couldn't be reassigned.", errors));
  }
  res.locals.reassignment = result.data; // cleaned: trimmed, teamId as a number
  next();
}
