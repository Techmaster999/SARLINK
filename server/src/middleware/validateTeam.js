import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// The dashboard should validate too, but anyone can call the API directly,
// so the server checks again before anything touches the database.

const requiredText = (requiredMsg, max, label) =>
  z.string({ error: requiredMsg }).trim().min(1, requiredMsg).max(max, `${label} must be ${max} characters or fewer.`);

export const teamPayloadSchema = z.object({
  name: requiredText("Team name is required.", 60, "Team name"),
  leaderId: requiredText("Team leader is required.", 100, "Team leader"),
  color: z
    .string({ error: "Team color is required." })
    .trim()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Color must be a hex value like #1e90ff."),
  incidentId: z.coerce
    .number({ error: "Incident ID is required." })
    .int("Incident ID must be a whole number.")
    .positive("Incident ID is required."),
});

/** Express middleware: 400 with { message, errors: { field: message } } if the body is invalid. */
export function validateTeam(req, res, next) {
  const result = teamPayloadSchema.safeParse(req.body ?? {});

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "Please fix the highlighted fields.", errors));
  }
  req.body = result.data; // cleaned: trimmed, incidentId as a number
  next();
}
