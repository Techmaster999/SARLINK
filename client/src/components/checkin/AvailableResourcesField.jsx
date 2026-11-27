/* DT-190 Available Resources Field 
Implement equipment, vehicle, and dog selection controls */

import { useFormContext } from "react-hook-form";
import "./AvailableResourcesField.css";

const EQUIPMENT = [
  { id: "radio", label: "Radio" },
  { id: "gps", label: "GPS unit" },
  { id: "pack", label: "24-hour pack" },
  { id: "medical-kit", label: "Medical kit" },
  { id: "rope", label: "Rope / technical gear" },
  { id: "drone", label: "Drone" },
];

const VEHICLES = [
  { id: "4x4", label: "4×4 truck / SUV" },
  { id: "car", label: "Car" },
  { id: "atv", label: "ATV / UTV" },
  { id: "snowmobile", label: "Snowmobile" },
  { id: "other", label: "Other" },
];

const DOG_DISCIPLINES = [
  { id: "area", label: "Area / air scent" },
  { id: "trailing", label: "Trailing" },
  { id: "human-remains", label: "Human remains detection" },
  { id: "avalanche", label: "Avalanche" },
  { id: "training", label: "In training" },
];

function ResourceChip({ label, selected, onClick }) {
  return (
    <button
      className="available-resources__chip"
      type="button"
      aria-pressed={selected}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ResourceGroup({ label, children }) {
  return (
    <section className="available-resources__group" aria-label={label}>
      {children}
    </section>
  );
}

function OptionalTextField({ id, label, ...inputProps }) {
  return (
    <div className="available-resources__text-field">
      <label htmlFor={id}>{label}</label>
      <span className="available-resources__optional">Optional</span>
      <input id={id} type="text" {...inputProps} />
    </div>
  );
}

export default function AvailableResourcesField() {
  const { register, setValue, watch } = useFormContext();
  const equipment = watch("equipment", []);
  const hasVehicle = watch("hasVehicle");
  const vehicleType = watch("vehicleType", "");
  const hasDog = watch("hasDog");
  const dogDisciplines = watch("dogDisciplines", []);

  const handleResourceSelection = (resourceType, selected) => {
    setValue(resourceType, selected, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const toggleSelection = (resourceType, selectedItems, item) => {
    const nextSelection = selectedItems.includes(item)
      ? selectedItems.filter((selectedItem) => selectedItem !== item)
      : [...selectedItems, item];
    handleResourceSelection(resourceType, nextSelection);
  };

  return (
    <div className="available-resources">
      <ResourceGroup label="Equipment you're bringing">
        <p className="available-resources__label">Equipment you're bringing</p>
        <div className="available-resources__chips">
          {EQUIPMENT.map(({ id, label }) => (
            <ResourceChip
              key={id}
              label={label}
              selected={equipment.includes(id)}
              onClick={() => toggleSelection("equipment", equipment, id)}
            />
          ))}
        </div>
        <OptionalTextField
          id="checkin-equipment-other"
          label="Other equipment"
          {...register("equipmentOther")}
        />
      </ResourceGroup>

      <ResourceGroup label="Vehicle">
        <p className="available-resources__label">Are you bringing a vehicle?</p>
        <div className="available-resources__chips">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(
            ({ value, label }) => (
              <ResourceChip
                key={label}
                label={label}
                selected={hasVehicle === value}
                onClick={() => handleResourceSelection("hasVehicle", value)}
              />
            ),
          )}
        </div>
        {hasVehicle && (
          <>
            <div className="available-resources__chips">
              {VEHICLES.map(({ id, label }) => (
                <ResourceChip
                  key={id}
                  label={label}
                  selected={vehicleType === id}
                  onClick={() => handleResourceSelection("vehicleType", id)}
                />
              ))}
            </div>
            <OptionalTextField
              id="checkin-vehicle-description"
              label="Make, colour or plate"
              {...register("vehicleDescription")}
            />
          </>
        )}
      </ResourceGroup>

      <ResourceGroup label="Dog">
        <p className="available-resources__label">Are you bringing a dog?</p>
        <div className="available-resources__chips">
          {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(
            ({ value, label }) => (
              <ResourceChip
                key={label}
                label={label}
                selected={hasDog === value}
                onClick={() => handleResourceSelection("hasDog", value)}
              />
            ),
          )}
        </div>
        {hasDog && (
          <>
            <div className="available-resources__text-field">
              <label htmlFor="checkin-dog-names">Dog name(s)</label>
              <input id="checkin-dog-names" type="text" {...register("dogNames")} />
            </div>
            <div className="available-resources__chips">
              {DOG_DISCIPLINES.map(({ id, label }) => (
                <ResourceChip
                  key={id}
                  label={label}
                  selected={dogDisciplines.includes(id)}
                  onClick={() =>
                    toggleSelection("dogDisciplines", dogDisciplines, id)
                  }
                />
              ))}
            </div>
          </>
        )}
      </ResourceGroup>
    </div>
  );
}
