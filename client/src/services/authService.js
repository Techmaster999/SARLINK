/* DT-175: Automatically attach the volunteer's name and SAR badge number */

/**
 * Extracts and validates the current authenticated volunteer's identity
 * (name and SAR badge number) from a session or user object, or fetches
 * the active session from /api/auth/session when called in the browser.
 */
export function extractVolunteerIdentity(source) {
  const user =
    source?.session?.user ??
    source?.user ??
    (source && (source.name || source.volunteerName || source.badgeNumber || source.sarBadgeNumber || source.googleId)
      ? source
      : null);

  if (!user) {
    return null;
  }

  const name = String(user.name ?? user.volunteerName ?? "").trim();
  const fallbackBadge = user.googleId
    ? `SAR-${String(user.googleId).slice(-4).toUpperCase()}`
    : "";
  const badgeNumber = String(
    user.badgeNumber ?? user.sarBadgeNumber ?? user.badge ?? fallbackBadge
  ).trim();

  if (!name || !badgeNumber) {
    return null;
  }

  return {
    volunteerId: user.volunteerId ?? user.id ?? user.googleId ?? null,
    name,
    volunteerName: name,
    badgeNumber,
    sarBadgeNumber: badgeNumber,
  };
}

export async function getCurrentVolunteerIdentity(source) {
  if (source !== undefined) {
    return extractVolunteerIdentity(source);
  }

  if (typeof fetch !== "function") {
    return null;
  }

  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return extractVolunteerIdentity(session);
  } catch {
    return null;
  }
}

/**
 * Attaches the authenticated volunteer's name and SAR badge number to a check-in payload.
 * Rejects unauthenticated submissions and prevents submitting on behalf of another volunteer.
 */
export function attachVolunteerIdentityToCheckIn(checkInData = {}, identity) {
  const resolvedIdentity = extractVolunteerIdentity(identity);
  if (!resolvedIdentity) {
    const error = new Error("You must be signed in to submit a check-in.");
    error.status = 401;
    throw error;
  }

  const attemptedName =
    checkInData.volunteerName ?? checkInData.name ?? "";
  const attemptedBadge =
    checkInData.sarBadgeNumber ?? checkInData.badgeNumber ?? "";
  const attemptedId = checkInData.volunteerId;

  if (
    (attemptedName &&
      String(attemptedName).trim() !== "" &&
      String(attemptedName).trim() !== resolvedIdentity.name) ||
    (attemptedBadge &&
      String(attemptedBadge).trim() !== "" &&
      String(attemptedBadge).trim() !== resolvedIdentity.badgeNumber) ||
    (attemptedId != null &&
      resolvedIdentity.volunteerId != null &&
      String(attemptedId) !== String(resolvedIdentity.volunteerId))
  ) {
    const error = new Error(
      "Volunteers cannot submit a check-in for another volunteer."
    );
    error.status = 403;
    throw error;
  }

  return {
    ...checkInData,
    volunteerId: resolvedIdentity.volunteerId,
    name: resolvedIdentity.name,
    volunteerName: resolvedIdentity.name,
    badgeNumber: resolvedIdentity.badgeNumber,
    sarBadgeNumber: resolvedIdentity.badgeNumber,
  };
}
