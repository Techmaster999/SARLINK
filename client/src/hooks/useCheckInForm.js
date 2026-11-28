import { useForm } from "react-hook-form";

export function validateArrivalTime(arrivalTime) {
  if (arrivalTime === "custom") return "Pick an arrival time.";
  if (!arrivalTime) return "Tell us when you expect to arrive.";
  return true;
}

export function useCheckInForm() {
  return useForm({
    defaultValues: {
      arrivalTime: "", // DT-173: default value for arrival time field
      hasHardCheckoutTime: null,
      checkoutTime: "",
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