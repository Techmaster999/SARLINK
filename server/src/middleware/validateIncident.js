import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// The browser already validates the form, but anyone can call the API directly,
// so the server checks again before anything touches the database.
// Field names match what the form sends.

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

const requiredText = (requiredMsg, max, label) =>
  z.string({ error: requiredMsg }).trim().min(1, requiredMsg).max(max, `${label} must be ${max} characters or fewer.`);

const optionalText = (max, label) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`).optional().default("");

export const incidentPayloadSchema = z
  .object({
    incidentName: requiredText("Incident name is required.", 120, "Incident name"),
    caseId: requiredText("Case ID is required.", 40, "Case ID"),
    dateTime: z
      .string({ error: "Date and time are required." })
      .min(1, "Date and time are required.")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time.")
      .refine((v) => Date.parse(v) <= Date.now() + FUTURE_TOLERANCE_MS, "Date and time can't be in the future."),
    location: requiredText("Location is required.", 200, "Location"),
    coordinator: requiredText("Coordinator is required.", 100, "Coordinator"),

    personnel: optionalText(200, "Personnel on duty"),
    mapUrl: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v), "Enter a full URL starting with http:// or https://.")
      .optional()
      .default(""),
    radioPrimary: optionalText(50, "Primary channel"),
    radioBackup: optionalText(50, "Backup channel"),

    calledTeamIds: z
      .array(z.string().trim().min(1).max(50))
      .max(200)
      .refine((ids) => new Set(ids).size === ids.length, "The same team was added twice.")
      .optional()
      .default([]),
    // TODO (teams ticket): also check each ID exists in the teams table.

    mutualAid: z.boolean().optional().default(false),
    mutualAidCounty: z.string().trim().max(50).nullable().optional(),
  })
  .transform((v) => ({ ...v, mutualAidCounty: v.mutualAid ? v.mutualAidCounty || null : null }));

/** Express middleware: 400 with { message, errors: { field: message } } if the body is invalid. */
export function validateIncident(req, res, next) {
  const result = incidentPayloadSchema.safeParse(req.body ?? {});
  const errors = {};

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
  }
  // Cross-field rule, checked separately so it shows alongside the other errors.
  if (req.body?.mutualAid === true && !String(req.body?.mutualAidCounty ?? "").trim()) {
    errors.mutualAidCounty ??= "Select the requesting county.";
  }

  if (Object.keys(errors).length > 0) {
    return next(new HttpError(400, "Please fix the highlighted fields.", errors));
  }
  req.body = result.data; // cleaned: trimmed, defaults filled in
  next();
}