import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

// Checks PUT /api/check-ins/:checkInId/resources before anything touches the database.
// The database also enforces the allowed types and no duplicates (migration 008).

// Keep in sync with the CHECK constraint in db/migrations/008_create_check_in_resources.sql.
export const RESOURCE_TYPES = [
  "vehicle",
  "four_wheel_drive",
  "atv",
  "boat",
  "drone",
  "k9",
  "radio",
  "gps",
  "first_aid_kit",
  "medical_training",
  "rope_rescue_gear",
  "night_vision",
];

export const checkInResourcesSchema = z.object({
  checkInId: z.coerce
    .number({ error: "Check-in ID is required." })
    .int("Check-in ID must be a whole number.")
    .positive("Check-in ID must be a positive number."),
  // An empty list is allowed: it means the volunteer has no resources to offer.
  resources: z
    .array(z.enum(RESOURCE_TYPES, { error: "That isn't a valid resource type." }), {
      error: "Resources must be a list of resource types.",
    })
    .refine((list) => new Set(list).size === list.length, "Each resource can only be listed once."),
});

/** Express middleware: 400 with { message, errors: { field: message } } if the input is invalid. */
export function validateCheckInResources(req, res, next) {
  const result = checkInResourcesSchema.safeParse({
    checkInId: req.params?.checkInId,
    resources: req.body?.resources,
  });

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "The resources couldn't be saved.", errors));
  }
  res.locals.checkInResources = result.data; // cleaned: checkInId as a number
  next();
}
