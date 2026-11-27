/* DT-175: Hook to provide the authenticated volunteer's name and SAR badge number */

import { useEffect, useState } from "react";
import {
  extractVolunteerIdentity,
  getCurrentVolunteerIdentity,
} from "../services/authService";

export const DEFAULT_DEV_VOLUNTEER = Object.freeze({
  volunteerId: "vol-104",
  name: "Handler Lisa Grant",
  volunteerName: "Handler Lisa Grant",
  badgeNumber: "SAR-104",
  sarBadgeNumber: "SAR-104",
});

function isTestEnvironment() {
  return (
    (typeof process !== "undefined" &&
      Boolean(process.env?.VITEST || process.env?.NODE_ENV === "test")) ||
    import.meta.env?.MODE === "test"
  );
}

export function useCurrentVolunteer(initialVolunteer) {
  const hasExplicitVolunteer = initialVolunteer !== undefined;
  const [volunteer, setVolunteer] = useState(() => {
    if (hasExplicitVolunteer) {
      return extractVolunteerIdentity(initialVolunteer);
    }
    return isTestEnvironment() ? null : DEFAULT_DEV_VOLUNTEER;
  });
  const [isLoading, setIsLoading] = useState(!hasExplicitVolunteer);

  useEffect(() => {
    if (hasExplicitVolunteer) {
      setVolunteer(extractVolunteerIdentity(initialVolunteer));
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    getCurrentVolunteerIdentity()
      .then((identity) => {
        if (cancelled) return;
        if (identity) {
          setVolunteer(identity);
        } else if (isTestEnvironment()) {
          setVolunteer(null);
        } else {
          setVolunteer(DEFAULT_DEV_VOLUNTEER);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasExplicitVolunteer, initialVolunteer]);

  return {
    volunteer,
    isAuthenticated: Boolean(volunteer?.name && volunteer?.badgeNumber),
    isLoading,
  };
}

export default useCurrentVolunteer;
