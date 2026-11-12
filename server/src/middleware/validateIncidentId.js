import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// Checks :incidentId in the URL before anything touches the database.
// Whether the incident actually exists is checked by the query itself.

export const incidentIdParamsSchema = z.object({
  incidentId: z.coerce
    .number({ error: "Incident ID is required." })
    .int("Incident ID must be a whole number.")
    .positive("Incident ID must be a positive number."),
});

/** Express middleware: 400 with { message, errors: { field: message } } if the ID is invalid. */
export function validateIncidentId(req, res, next) {
  const result = incidentIdParamsSchema.safeParse(req.params ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "params");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "That incident ID isn't valid.", errors));
  }
  res.locals.incidentParams = result.data; // cleaned: incidentId as a number
  next();
}
