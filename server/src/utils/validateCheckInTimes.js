import { z } from "zod";
import { HttpError } from "./httpError.js";

// Times are ISO 8601 date-times with a time zone, e.g. "2026-11-26T14:30:00Z" or
// "2026-11-26T06:30:00-08:00". A time zone is required so the comparison is unambiguous.
const isoTime = (label) =>
  z.iso.datetime({
    offset: true,
    error: (issue) =>
      issue.input === undefined
        ? `${label} is required.`
        : `${label} must be a date and time like 2026-11-26T14:30:00Z.`,
  });

// Treat a missing, null, or blank checkout time as "not checked out yet".
const blankToUndefined = (value) =>
  value == null || (typeof value === "string" && value.trim() === "") ? undefined : value;

const checkInTimesSchema = z.object({
  arrivalTime: isoTime("Arrival time"),
  checkoutTime: z.preprocess(blankToUndefined, isoTime("Checkout time").optional()),
});

/**
 * Checks a check-in's arrival and checkout times. The checkout time is optional; when given,
 * it may equal the arrival time but can't be earlier. Throws a 400 HttpError with
 * { field: message } errors if a time is missing, badly formatted, or out of order.
 *
 * @param {string} arrivalTime ISO 8601 date-time with time zone
 * @param {string | null | undefined} checkoutTime ISO 8601 date-time with time zone, or blank
 * @returns {{ arrivalTime: Date, checkoutTime: Date | null }}
 */
export function validateCheckInTimes(arrivalTime, checkoutTime) {
  const result = checkInTimesSchema.safeParse({ arrivalTime, checkoutTime });

  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "body");
      if (!errors[field]) errors[field] = issue.message;
    }
    throw new HttpError(400, "The check-in times aren't valid.", errors);
  }

  const arrival = new Date(result.data.arrivalTime);
  const checkout = result.data.checkoutTime ? new Date(result.data.checkoutTime) : null;

  if (checkout && checkout.getTime() < arrival.getTime()) {
    throw new HttpError(400, "The check-in times aren't valid.", {
      checkoutTime: "Checkout time can't be earlier than the arrival time.",
    });
  }

  return { arrivalTime: arrival, checkoutTime: checkout };
}
