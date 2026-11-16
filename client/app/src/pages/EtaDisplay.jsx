import { useEffect, useState } from "react";

const MINUTE_MS = 60000;

/**
 * Shared timer hook that returns the current time and updates it every `intervalMs`
 * (defaults to 60,000 ms = 60 seconds). Cleans up the interval on unmount.
 */
export function useCurrentTime(intervalMs = MINUTE_MS) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (intervalMs == null || intervalMs <= 0) {
      return undefined;
    }
    const timerId = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => {
      clearInterval(timerId);
    };
  }, [intervalMs]);

  return now;
}

function toValidDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

function resolveArrivalDate(arrivalTime, nowMs) {
  const direct = toValidDate(arrivalTime);
  if (direct) return direct;

  if (typeof arrivalTime === "string") {
    const match = arrivalTime.trim().match(/^~?\s*(\d+)\s*min/i);
    if (match) {
      const mins = parseInt(match[1], 10);
      return new Date(nowMs + mins * MINUTE_MS);
    }
  }
  return null;
}

/**
 * Formats an arrival time relative to `now`:
 * - "~15 min (2:45 PM)" when 1 minute or more remains
 * - "Arriving now" when less than 1 minute remains
 * - "Overdue by 5 min" once the arrival time has passed
 */
export function formatEta(arrivalTime, now = new Date()) {
  if (arrivalTime == null || arrivalTime === "") {
    return "No ETA";
  }

  const nowDate = toValidDate(now) || new Date();
  const nowMs = nowDate.getTime();
  const arrivalDate = resolveArrivalDate(arrivalTime, nowMs);

  if (!arrivalDate) {
    return String(arrivalTime);
  }

  const diffMs = arrivalDate.getTime() - nowMs;

  if (diffMs < 0) {
    const overdueMinutes = Math.max(1, Math.round(Math.abs(diffMs) / MINUTE_MS));
    return `Overdue by ${overdueMinutes} min`;
  }

  // Less than 1 minute remaining (500ms tolerance avoids 1-2ms real-clock drift on exact 60s boundaries)
  if (diffMs < MINUTE_MS - 500) {
    return "Arriving now";
  }

  const minutesRemaining = Math.max(1, Math.round(diffMs / MINUTE_MS));
  const localArrivalTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(arrivalDate);

  return `~${minutesRemaining} min (${localArrivalTime})`;
}

export function getEtaStatus(arrivalTime, now = new Date()) {
  const formatted = formatEta(arrivalTime, now);
  if (formatted.startsWith("Overdue")) return "overdue";
  if (formatted === "Arriving now") return "arriving";
  return "normal";
}

const ETA_STYLES = {
  normal: {
    className:
      "sar-eta-display sar-eta-display--normal text-blue-800 bg-blue-50 border-blue-200",
    style: {
      backgroundColor: "#EEF3FF",
      color: "#3558A8",
      borderColor: "#BFDBFE",
    },
  },
  arriving: {
    className:
      "sar-eta-display sar-eta-display--arriving text-emerald-700 bg-emerald-50 border-emerald-200",
    style: {
      backgroundColor: "#EFFAF4",
      color: "#2D7A50",
      borderColor: "#A7F3D0",
    },
  },
  overdue: {
    className:
      "sar-eta-display sar-eta-display--overdue sar-eta-display--warning warning text-amber-800 bg-amber-100 border-amber-400 text-red-700 bg-red-50",
    style: {
      backgroundColor: "#FEF3C7",
      color: "#B45309",
      borderColor: "#F59E0B",
    },
  },
};

/**
 * Displays a volunteer's ETA and updates as time passes using the shared `now` value.
 */
export function EtaDisplay({ arrivalTime, eta, now }) {
  const fallbackNow = useCurrentTime(now === undefined ? MINUTE_MS : null);
  const effectiveNow = now !== undefined ? now : fallbackNow;
  const targetArrivalTime = arrivalTime !== undefined ? arrivalTime : eta;

  const text = formatEta(targetArrivalTime, effectiveNow);
  const status = getEtaStatus(targetArrivalTime, effectiveNow);
  const visual = ETA_STYLES[status] || ETA_STYLES.normal;

  return (
    <span
      className={visual.className}
      style={visual.style}
      data-testid="eta-display"
      data-status={status}
      role={status === "overdue" ? "status" : undefined}
    >
      {text}
    </span>
  );
}

export default EtaDisplay;

