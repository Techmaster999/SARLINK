/* 
DT-173 Implement the arrival-time input from the Figma mockup
function name: handleArrivalTimeChange(arrivalTime) plus any
helper functions needed to implement the arrival-time field. 

React: manages the input state
React Hook Form: manages form values
*/ 

import { useFormContext } from "react-hook-form";

export function handleArrivalTimeChange(arrivalTime, setValue) {
  setValue("arrivalTime", arrivalTime, {
    shouldDirty: true,
    shouldValidate: true,
  });
}

export default function ArrivalTimeField() {
  const { register, setValue, watch } = useFormContext();
  const arrivalTime = watch("arrivalTime", "");

  const onArrivalTimeChange = (event) => {
    handleArrivalTimeChange(event.target.value, setValue);
  };

  return (
    <input
      id="arrivalTime"
      type="time"
      step={300}
      value={arrivalTime}
      aria-label="Arrival time"
      {...register("arrivalTime")}
      onChange={onArrivalTimeChange}
    />
  );
}