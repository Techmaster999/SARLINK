/* use check in form hook for DT-173 and DT-174  */

import { useForm } from "react-hook-form";

export function useCheckInForm() {
  return useForm({
    defaultValues: {
      arrivalTime: "", // DT-173: default value for arrival time field
    },
    mode: "onChange",
  });
}