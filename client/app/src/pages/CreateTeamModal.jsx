import { useEffect, useRef, useState } from "react";
import "./Dashboard.css";

// ── Team color palette (from Dashboard Figma design) ──────────────────────────
export const TEAM_PALETTE = [
  { accent: "#3558A8", tint: "#EEF3FF", name: "Navy" },
  { accent: "#2D7A50", tint: "#EFFAF4", name: "Forest" },
  { accent: "#C97A1A", tint: "#FFF8EE", name: "Amber" },
  { accent: "#6B3FA0", tint: "#F5F0FF", name: "Purple" },
  { accent: "#0E7490", tint: "#ECFEFF", name: "Teal" },
  { accent: "#9A3412", tint: "#FFF1EE", name: "Rust" },
  { accent: "#5F6B1E", tint: "#F6F8E8", name: "Olive" },
];

// ── Default incident volunteers (from Dashboard Figma ics-data) ───────────────
export const DEFAULT_INCIDENT_VOLUNTEERS = [
  { id: "vol-1", name: "Handler Lisa Grant", role: "K9 Handler" },
  { id: "vol-2", name: "SAR. Marcus Greene", role: "Ground Searcher 1" },
  { id: "vol-3", name: "PM. Diane Okafor", role: "Paramedic / Field Medic" },
  { id: "vol-4", name: "Spec. Joel Whitmore", role: "Technical Rope Rescue" },
  { id: "vol-5", name: "Tech. Amy Chen", role: "USAR — Drone Operator" },
  { id: "cp-sb-1", name: "Log. Ian McAllister", role: "Logistics Coordinator" },
  { id: "cp-sb-2", name: "SAR. Kyle Brandt", role: "Hasty Team Lead" },
  { id: "a1-1", name: "Handler Dana Chen", role: "K9 Handler" },
  { id: "a2-1", name: "SAR. Jorge Santos", role: "Ground Searcher 1" },
  { id: "a3-1", name: "SAR. Owen Park", role: "Ground Searcher 1" },
  { id: "b1-1", name: "Pilot H. Nakamura", role: "Helicopter Pilot" },
  { id: "b2-1", name: "Tech. Fatima Al-Rashid", role: "USAR — Drone Lead" },
  { id: "b3-1", name: "Spec. Sophie Laurent", role: "Technical Rope Rescue" },
  { id: "c1-1", name: "Coord. Diana Ford", role: "IST — Base Camp Coord." },
];

/**
 * Computes the next sequential team number locally starting at 101 (101, 102, 103...).
 */
export function calculateLocalNextTeamNumber(existingTeams = [], op = "1") {
  const prefix = String(parseInt(op, 10) > 0 ? parseInt(op, 10) : 1);
  const used = new Set(
    (Array.isArray(existingTeams) ? existingTeams : []).flatMap((t) => [
      String(t?.number ?? "").trim(),
      String(t?.name ?? "").trim(),
      String(t?.slotNumber ?? "").trim(),
    ])
  );

  for (let seq = 1; seq <= 99; seq++) {
    const candidate = `${prefix}${String(seq).padStart(2, "0")}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  return `${prefix}${String((existingTeams?.length || 0) + 1).padStart(2, "0")}`;
}

/**
 * Gets the next available team number to pre-fill the team name.
 * Attempts GET /api/teams/next-number first and falls back to local increment starting at 101.
 */
export async function getNextTeamNumber(existingTeams = [], op = "1") {
  const localFallback = calculateLocalNextTeamNumber(existingTeams, op);

  if (typeof fetch !== "function") {
    return localFallback;
  }

  try {
    const response = await fetch("/api/teams/next-number", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });

    if (response.ok) {
      const data = await response.json();
      const raw =
        data?.nextNumber ??
        data?.nextTeamNumber ??
        data?.teamNumber ??
        data?.number ??
        (typeof data === "string" || typeof data === "number" ? data : null);

      if (raw !== null && raw !== undefined && String(raw).trim() !== "") {
        const candidate = String(raw).trim();
        const alreadyUsed = (Array.isArray(existingTeams) ? existingTeams : []).some(
          (t) =>
            String(t?.number ?? "") === candidate ||
            String(t?.name ?? "") === candidate ||
            String(t?.slotNumber ?? "") === candidate
        );
        if (!alreadyUsed) {
          return candidate;
        }
      }
    }
  } catch {
    // Fallback to local calculation when backend endpoint is unavailable
  }

  return localFallback;
}

/**
 * Closes the Create Team modal without saving.
 */
export function closeCreateTeamModal(callbackOrSetter) {
  if (typeof callbackOrSetter === "function") {
    callbackOrSetter(false);
  }
  return false;
}

/**
 * CreateTeamModal
 * Subtask DT-48: Render pop up displaying options for creating a new team:
 * - Team name text box, pre-filled with the next team number (starting at 101) and editable
 * - Team leader dropdown listing the volunteers available for the incident
 * - Color options to pick the team's color
 * - "Create Team" and "Cancel" buttons at the bottom
 */
export function CreateTeamModal({
  isOpen = true,
  onClose,
  onSubmit,
  onConfirm,
  existingTeams = [],
  volunteers = DEFAULT_INCIDENT_VOLUNTEERS,
  op = "1",
}) {
  const initialSlotNumber = calculateLocalNextTeamNumber(existingTeams, op);
  const [teamName, setTeamName] = useState(initialSlotNumber);
  const [slotNumber, setSlotNumber] = useState(initialSlotNumber);
  const [leader, setLeader] = useState("");
  const [colorIdx, setColorIdx] = useState(
    (Array.isArray(existingTeams) ? existingTeams.length : 0) % TEAM_PALETTE.length
  );
  const [error, setError] = useState("");
  const hasUserEditedRef = useRef(false);
  const nameInputRef = useRef(null);

  // Reset and pre-fill with next team number whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    hasUserEditedRef.current = false;
    const fallbackNum = calculateLocalNextTeamNumber(existingTeams, op);
    setTeamName(fallbackNum);
    setSlotNumber(fallbackNum);
    setLeader("");
    setColorIdx(
      (Array.isArray(existingTeams) ? existingTeams.length : 0) % TEAM_PALETTE.length
    );
    setError("");

    getNextTeamNumber(existingTeams, op).then((nextNum) => {
      if (!cancelled && !hasUserEditedRef.current && nextNum) {
        setTeamName(String(nextNum));
        setSlotNumber(String(nextNum));
      }
    });

    const timer = setTimeout(() => {
      nameInputRef.current?.focus?.({ preventScroll: true });
      nameInputRef.current?.select?.();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, existingTeams, op]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeCreateTeamModal(onClose);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const palette = TEAM_PALETTE[colorIdx] || TEAM_PALETTE[0];
  const isNameEmpty = teamName.trim() === "";

  const handleNameChange = (e) => {
    const val = e.target.value;
    hasUserEditedRef.current = true;
    setTeamName(val);
    if (val.trim() === "") {
      setError("A team name is required.");
    } else {
      setError("");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const trimmedName = teamName.trim();
    if (!trimmedName) {
      setError("A team name is required.");
      nameInputRef.current?.focus?.({ preventScroll: true });
      return;
    }

    const submitHandler = onSubmit || onConfirm;
    if (typeof submitHandler === "function") {
      submitHandler({
        id: `team-${trimmedName}-${Date.now()}`,
        name: trimmedName,
        number: trimmedName,
        slotNumber,
        leader: leader.trim() || "Unassigned",
        color: palette.name,
        accent: palette.accent,
        tint: palette.tint,
        members: [],
      });
    }
  };

  return (
    <div className="ctm-overlay-root">
      {/* Dimmed backdrop */}
      <div
        className="ctm-backdrop"
        data-testid="create-team-backdrop"
        onClick={() => closeCreateTeamModal(onClose)}
      />

      {/* Modal dialog */}
      <div
        className="ctm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ctm-title"
      >
        {/* Modal Header */}
        <div className="ctm-header">
          <div
            className="ctm-badge-preview"
            style={{ backgroundColor: palette.accent }}
          >
            <span>{teamName.trim() || "–"}</span>
          </div>
          <div className="ctm-header-text">
            <h2 id="ctm-title" className="ctm-title">
              Form New Team
            </h2>
            <p className="ctm-subtitle">Operational Period {op}</p>
          </div>
          <button
            type="button"
            className="ctm-close-btn"
            aria-label="Close"
            onClick={() => closeCreateTeamModal(onClose)}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M3 3l9 9M12 3l-9 9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleFormSubmit} noValidate>
          <div className="ctm-body">
            {/* Team Name */}
            <div className="ctm-field">
              <label htmlFor="sar-team-name" className="ctm-label">
                Team Name <span className="ctm-required">*</span>
              </label>
              <input
                id="sar-team-name"
                ref={nameInputRef}
                type="text"
                className={`ctm-input ctm-input--name ${
                  error ? "ctm-input--error" : ""
                }`}
                value={teamName}
                onChange={handleNameChange}
                onBlur={() => {
                  if (teamName.trim() === "") {
                    setError("A team name is required.");
                  }
                }}
                placeholder="e.g. 101"
              />
              {error ? (
                <p role="alert" className="ctm-error">
                  {error}
                </p>
              ) : (
                <p className="ctm-hint">
                  Pre-filled with the next team number starting at 101. You can edit this name if needed.
                </p>
              )}
            </div>

            {/* Team Leader Dropdown */}
            <div className="ctm-field">
              <label htmlFor="sar-team-leader" className="ctm-label">
                Team Leader{" "}
                <span className="ctm-optional">(optional)</span>
              </label>
              <select
                id="sar-team-leader"
                className="ctm-select"
                value={leader}
                onChange={(e) => setLeader(e.target.value)}
              >
                <option value="">Select a volunteer (Unassigned)</option>
                {volunteers.map((vol) => {
                  const volName = typeof vol === "string" ? vol : vol.name;
                  const volRole = typeof vol === "string" ? "" : vol.role;
                  const volId = typeof vol === "string" ? vol : vol.id || vol.name;
                  return (
                    <option key={volId} value={volName}>
                      {volRole ? `${volName} — ${volRole}` : volName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Team Color Options */}
            <div className="ctm-field">
              <span className="ctm-label">Team Color</span>
              <div className="ctm-color-list" role="radiogroup" aria-label="Team Color">
                {TEAM_PALETTE.map((p, i) => {
                  const selected = i === colorIdx;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      title={p.name}
                      aria-label={p.name}
                      aria-pressed={selected}
                      className={`ctm-color-swatch ${
                        selected ? "ctm-color-swatch--selected" : ""
                      }`}
                      onClick={() => setColorIdx(i)}
                      style={{
                        backgroundColor: p.accent,
                        boxShadow: selected
                          ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${p.accent}`
                          : "none",
                      }}
                    />
                  );
                })}
              </div>

              {/* Tint preview strip */}
              <div
                className="ctm-color-preview"
                style={{
                  backgroundColor: palette.tint,
                  borderColor: `${palette.accent}30`,
                }}
              >
                <span
                  className="ctm-color-preview__dot"
                  style={{ backgroundColor: palette.accent }}
                />
                <span
                  className="ctm-color-preview__label"
                  style={{ color: palette.accent }}
                >
                  Team {teamName.trim() || "…"} ({palette.name})
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="ctm-footer">
            <button
              type="button"
              className="ctm-btn ctm-btn--cancel"
              onClick={() => closeCreateTeamModal(onClose)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ctm-btn ctm-btn--submit"
              disabled={isNameEmpty}
              style={{
                backgroundColor: palette.accent,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 2v10M2 7h10"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTeamModal;

