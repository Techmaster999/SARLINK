import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import ArrivalTimeField from "../../../src/components/checkin/ArrivalTimeField";
import AvailableResourcesField from "../../../src/components/checkin/AvailableResourcesField";
import CheckoutTimeField from "../../../src/components/checkin/CheckoutTimeField";
import TeamSelectionField from "../../../src/components/checkin/TeamSelectionField";
import { useCheckInForm } from "../../../src/hooks/useCheckInForm";
import "./CheckIn.css";


function TopoBackground() {
  const stroke = "rgba(10,10,10,0.07)";


  return (
    <div className="checkin-topography" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="checkin-topo-pattern"
            x="0"
            y="0"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <ellipse cx="120" cy="120" rx="108" ry="72" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="120" cy="120" rx="84" ry="54" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="120" cy="120" rx="60" ry="38" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="120" cy="120" rx="36" ry="22" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="120" cy="120" rx="14" ry="8" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="0" cy="0" rx="60" ry="90" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="240" cy="0" rx="60" ry="90" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="0" cy="240" rx="60" ry="90" fill="none" stroke={stroke} strokeWidth="1.2" />
            <ellipse cx="240" cy="240" rx="60" ry="90" fill="none" stroke={stroke} strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#checkin-topo-pattern)" />
      </svg>
    </div>
  );
}


export default function CheckIn() {
  const methods = useCheckInForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const arrivalTimeError = methods.formState.errors.arrivalTime;
  const presets = [
    { id: "15", label: "15 min" },
    { id: "30", label: "30 min" },
    { id: "60", label: "1 hour" },
    { id: "120", label: "2 hours" },
  ];

  const handleNext = () => {
    if (currentStep === 1 && methods.getValues("hasHardCheckoutTime") === null) {
      methods.setError("hasHardCheckoutTime", {
        type: "required",
        message: "Choose yes or no.",
      });
      return;
    }

    methods.clearErrors("hasHardCheckoutTime");
    setCurrentStep((step) => step + 1);
  };

  return (
    <FormProvider {...methods}>
      <main className="checkin-page">
        <TopoBackground />

        <header className="checkin-nav">
          <span className="checkin-home-icon" aria-hidden="true">◆</span>
          <strong>Incident check-in</strong>
        </header>

        <section className="checkin-review" aria-hidden="true">
          <h1>Incident check-in</h1>
          <p>Look over your details and make sure everything is up to date, then check in.</p>
        </section>

        <div className="checkin-overlay">
          <section
            className="checkin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkin-step-title"
          >
            <header className="checkin-dialog__header">
              <p className="checkin-eyebrow">STEP {currentStep} OF 3</p>
              <h2 id="checkin-step-title">
                {currentStep === 1
                  ? "Arrival time"
                  : currentStep === 2
                    ? "Team assignment"
                    : "Equipment, vehicles and dogs"}
              </h2>
              <p className="checkin-description">
                {currentStep === 1
                  ? "When do you expect to arrive?"
                  : currentStep === 2
                    ? "Which team do you want to be assigned to?"
                    : "What you're bringing to this incident."}
              </p>
            </header>

            <form
              onSubmit={methods.handleSubmit(({
                hasVehicle,
                vehicleType,
                vehicleDescription,
                hasDog,
                dogNames,
                dogDisciplines,
                hasHardCheckoutTime,
                checkoutTime,
                ...checkInData
              }) => console.info("Check-in details:", {
                ...checkInData,
                hasHardCheckoutTime,
                checkoutTime: checkoutTime || null,
                equipmentOther: checkInData.equipmentOther.trim() || null,
                vehicle: hasVehicle
                  ? { type: vehicleType || null, description: vehicleDescription.trim() || null }
                  : null,
                dogs: hasDog
                  ? { names: dogNames.trim(), disciplines: dogDisciplines }
                  : null,
              }))}
            >
              <div className={`checkin-dialog__body${currentStep === 1 ? "" : " is-hidden"}`}>
                <p className="checkin-question">When will you arrive?</p>

                <div className="checkin-presets">
                  {presets.map(({ id, label }) => (
                    <button
                      key={id}
                      className={`checkin-chip ${selectedArrival === id ? "is-selected" : ""}`}
                      type="button"
                      aria-pressed={selectedArrival === id}
                      onClick={() => {
                        setSelectedArrival(id);
                        setShowTimeInput(false);
                        methods.setValue("arrivalTime", "", {
                          shouldDirty: true,
                          shouldValidate: false,
                        });
                        methods.clearErrors("arrivalTime");
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                  {showTimeInput && (
                    <div className="checkin-time-field">
                      <label htmlFor="arrivalTime">
                        Arrival time (24-hour, e.g. 1430)
                      </label>
                      <ArrivalTimeField />
                    </div>
                  )}
                  <CheckoutTimeField />
                </div>
                {arrivalTimeError && (
                  <p id="arrival-time-error" className="checkin-validation-error" role="alert">
                    {arrivalTimeError.message}
                  </p>
                )}
              </div>

              {currentStep === 2 ? (
                <div className="checkin-dialog__body">
                  <TeamSelectionField />
                </div>
              ) : currentStep === 3 ? (
                <div className="checkin-dialog__body">
                  <AvailableResourcesField />
                </div>
              ) : null}

              <footer className="checkin-dialog__footer">
                {currentStep > 1 && (
                  <button
                    className="checkin-back"
                    type="button"
                    onClick={() => setCurrentStep((step) => step - 1)}
                  >
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    className="checkin-next"
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button className="checkin-next" type="submit">Review my details</button>
                )}
              </footer>
            </form>
          </section>
        </div>
      </main>
    </FormProvider>
  );
}
