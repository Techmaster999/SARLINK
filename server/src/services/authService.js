import { HttpError } from "../utils/httpError.js";

/**
 * Retrieves the currently authenticated volunteer's identity (name and SAR badge number)
 * from the active Express session. Throws 401 if unauthenticated.
 */
export function getCurrentVolunteerIdentity(reqOrSession) {
  const user =
    reqOrSession?.session?.user ??
    reqOrSession?.user ??
    (reqOrSession &&
    (reqOrSession.name ||
      reqOrSession.volunteerName ||
      reqOrSession.badgeNumber ||
      reqOrSession.sarBadgeNumber)
      ? reqOrSession
      : null);

  if (!user) {
    throw new HttpError(401, "Please sign in to submit a check-in.");
  }

  const name = String(user.name ?? user.volunteerName ?? "").trim();
  const fallbackBadge = user.googleId
    ? `SAR-${String(user.googleId).slice(-4).toUpperCase()}`
    : "";
  const badgeNumber = String(
    user.badgeNumber ?? user.sarBadgeNumber ?? user.badge ?? fallbackBadge
  ).trim();

  if (!name || !badgeNumber) {
    throw new HttpError(401, "Please sign in with a valid volunteer account.");
  }

  return {
    volunteerId: user.volunteerId ?? user.id ?? null,
    name,
    volunteerName: name,
    badgeNumber,
    sarBadgeNumber: badgeNumber,
  };
}
