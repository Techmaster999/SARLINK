/* use check in form hook for DT-173 and DT-174  */

import { useForm } from "react-hook-form";

export function useCheckInForm(volunteer = null) {
  return useForm({
    defaultValues: {
      volunteerName: volunteer?.name ?? "",
      sarBadgeNumber: volunteer?.badgeNumber ?? volunteer?.sarBadgeNumber ?? "",
      arrivalTime: "", // DT-173: default value for arrival time field
      team: "",
      equipment: [],
      equipmentOther: "",
      hasVehicle: null,
      vehicleType: "",
      vehicleDescription: "",
      hasDog: null,
      dogNames: "",
      dogDisciplines: [],
    },
    mode: "onChange",
  });
}