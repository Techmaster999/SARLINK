/* 
DT-173 Implement the arrival-time input from the Figma mockup
function name: handleArrivalTimeChange(arrivalTime) plus any
helper functions needed to implement the arrival-time field. 

React: manages the input state
React Hook Form: manages form values
*/ 

import { useFormContext } from "react-hook-form";
import { validateArrivalTime } from "../../hooks/useCheckInForm";
import "./ArrivalTimeField.css";

export function handleArrivalTimeChange(arrivalTime, setValue) {
  setValue("arrivalTime", arrivalTime, {
    shouldDirty: true,
    shouldValidate: true,
  });
}

export default function ArrivalTimeField({ selectedArrival = "custom" }) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const arrivalTime = watch("arrivalTime", "");
  const arrivalTimeRegistration = register("arrivalTime", {
    validate: (value) => validateArrivalTime(
      selectedArrival === "custom" ? value || "custom" : selectedArrival,
    ),
  });

  const onArrivalTimeChange = (event) => {
    handleArrivalTimeChange(event.target.value, setValue);
  };

  return (
    <input
      id="arrivalTime"
      className="arrival-time-input"
      type="time"
      step={300}
      value={arrivalTime}
      aria-label="Arrival time"
      aria-invalid={Boolean(errors.arrivalTime)}
      aria-describedby={errors.arrivalTime ? "arrival-time-error" : undefined}
      {...arrivalTimeRegistration}
      onChange={onArrivalTimeChange}
    />
  );
}