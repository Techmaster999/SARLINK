import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

const volunteerOrderSchema = z.object({
  teamId: z.coerce
    .number({ error: "Team ID is required." })
    .int("Team ID must be a whole number.")
    .positive("Team ID must be a positive number."),
  orderedVolunteerIds: z
    .array(
      z
        .string({ error: "Volunteer IDs must be strings." })
        .trim()
        .min(1, "Volunteer IDs cannot be empty.")
        .max(100, "Volunteer IDs must be 100 characters or fewer."),
    )
    .refine(
      (volunteerIds) => new Set(volunteerIds).size === volunteerIds.length,
      { error: "Volunteer IDs must be unique." },
    ),
});

export function validateVolunteerOrder(req, res, next) {
  const result = volunteerOrderSchema.safeParse({
    teamId: req.params?.teamId,
    orderedVolunteerIds: req.body?.orderedVolunteerIds,
  });

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    return next(new HttpError(400, "The volunteer order is invalid.", errors));
  }

  res.locals.volunteerOrder = result.data;
  next();
}
