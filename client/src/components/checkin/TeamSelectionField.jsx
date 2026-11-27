/* DT-184 Team Selection Field
function name: handleTeamChange(team) plus any helper functions 
needed to implement the team selection field. */

import { useFormContext } from "react-hook-form";
import "./TeamSelectionField.css";

const TEAMS = [
  { id: "k9", label: "K9" },
  { id: "usar", label: "USAR (Drone Team)" },
  { id: "gs1", label: "Ground Searcher 1" },
  { id: "gs2", label: "Ground Searcher 2" },
  { id: "gs3", label: "Ground Searcher 3" },
  { id: "trr", label: "Technical Rope Rescue" },
  { id: "heli", label: "Helicopter" },
  { id: "ist", label: "IST (Incident Support Team)" },
];

export default function TeamSelectionField() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const team = watch("team", "");
  const teamRegistration = register("team", { required: "Choose a team." });

  const handleTeamAssignmentChange = (teamId) => {
    setValue("team", teamId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onTeamAssignmentChange = (event) => {
    handleTeamAssignmentChange(event.target.value);
  };

  return (
    <fieldset
      className="team-selection-field"
      aria-describedby={errors.team ? "team-selection-error" : undefined}
      aria-invalid={Boolean(errors.team)}
    >
      <legend className="team-selection-field__legend">Team assignment</legend>
      {TEAMS.map(({ id, label }) => (
        <label
          key={id}
          className={`team-selection-option${team === id ? " is-selected" : ""}`}
          htmlFor={`team-${id}`}
        >
          <input
            {...teamRegistration}
            id={`team-${id}`}
            className="team-selection-option__radio"
            type="radio"
            value={id}
            checked={team === id}
            onChange={onTeamAssignmentChange}
          />
          <span>{label}</span>
        </label>
      ))}
      {errors.team && (
        <p id="team-selection-error" className="team-selection-field__error" role="alert">
          {errors.team.message}
        </p>
      )}
    </fieldset>
  );
}
