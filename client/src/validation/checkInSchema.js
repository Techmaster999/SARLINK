/* DT-185 & DT-186 — check-in team assignment validation
validateTeamAssignment(teamId): a check-in cannot be submitted without a team.
validateSingleTeamAssignment(teamIds): a check-in holds exactly one team.
Messages returned here are the ones react-hook-form displays on the check-in form. */

export const TEAM_REQUIRED_MESSAGE = "Choose a team.";
export const MULTIPLE_TEAMS_MESSAGE = "Only one team can be assigned to a check-in.";

// true | error message — shaped for react-hook-form's `validate` rule.
export function validateTeamAssignment(teamId) {
  return typeof teamId === "string" && teamId.trim() !== ""
    ? true
    : TEAM_REQUIRED_MESSAGE;
}

export function validateSingleTeamAssignment(teamIds) {
  const candidateIds = Array.isArray(teamIds) ? teamIds : [teamIds];
  if (candidateIds.length === 0) return TEAM_REQUIRED_MESSAGE;
  if (candidateIds.length > 1) return MULTIPLE_TEAMS_MESSAGE;
  return validateTeamAssignment(candidateIds[0]);
}
