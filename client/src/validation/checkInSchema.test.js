/* DT-185 & DT-186 — unit tests for the check-in team assignment validators.
Each case maps to an acceptance criterion on the tickets. */

import { describe, expect, it } from "vitest";
import {
  MULTIPLE_TEAMS_MESSAGE,
  TEAM_REQUIRED_MESSAGE,
  validateSingleTeamAssignment,
  validateTeamAssignment,
} from "./checkInSchema";

describe("validateTeamAssignment (DT-185)", () => {
  it("rejects a check-in submitted without a team assignment", () => {
    expect(validateTeamAssignment("")).toBe(TEAM_REQUIRED_MESSAGE);
    expect(validateTeamAssignment(null)).toBe(TEAM_REQUIRED_MESSAGE);
    expect(validateTeamAssignment(undefined)).toBe(TEAM_REQUIRED_MESSAGE);
  });

  it("shows an error message for a whitespace-only team assignment", () => {
    expect(validateTeamAssignment("   ")).toBe(TEAM_REQUIRED_MESSAGE);
  });

  it("passes validation for a valid team assignment", () => {
    expect(validateTeamAssignment("k9")).toBe(true);
    expect(validateTeamAssignment("usar")).toBe(true);
  });
});

describe("validateSingleTeamAssignment (DT-186)", () => {
  it("accepts a single team id, plain or in a one-item list", () => {
    expect(validateSingleTeamAssignment("k9")).toBe(true);
    expect(validateSingleTeamAssignment(["k9"])).toBe(true);
  });

  it("rejects multiple team IDs from being submitted", () => {
    expect(validateSingleTeamAssignment(["k9", "gs1"])).toBe(MULTIPLE_TEAMS_MESSAGE);
    expect(validateSingleTeamAssignment(["k9", "gs1", "trr"])).toBe(MULTIPLE_TEAMS_MESSAGE);
  });

  it("rejects an empty selection", () => {
    expect(validateSingleTeamAssignment([])).toBe(TEAM_REQUIRED_MESSAGE);
    expect(validateSingleTeamAssignment("")).toBe(TEAM_REQUIRED_MESSAGE);
  });

  it("rejects a one-item list holding an empty team id", () => {
    expect(validateSingleTeamAssignment([""])).toBe(TEAM_REQUIRED_MESSAGE);
  });
});
