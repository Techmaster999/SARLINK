import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// Checks the body of POST /api/incidents/:incidentId/check-ins before anything
// touches the database. Whether the role is available for the incident is checked
// by the service, against the incident's called teams.

const requiredText = (requiredMsg, max, label) =>
  z.string({ error: requiredMsg }).trim().min(1, requiredMsg).max(max, `${label} must be ${max} characters or fewer.`);

export const checkInPayloadSchema = z.object({
  name: requiredText("Name is required.", 100, "Name"),
  role: requiredText("Team assignment is required.", 100, "Team assignment"),
  eta: z
    .iso.datetime({ offset: true, error: "ETA must be a valid date and time." })
    .nullish()
    .transform((value) => value ?? null),
});

/** Express middleware: 400 with { message, errors: { field: message } } if the body is invalid. */
export function validateCheckIn(req, res, next) {
  const result = checkInPayloadSchema.safeParse(req.body ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "Please fix the highlighted fields.", errors));
  }
  res.locals.checkIn = result.data; // cleaned: trimmed, eta as ISO string or null
  next();
}
