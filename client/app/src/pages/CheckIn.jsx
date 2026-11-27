import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ArrivalTimeField from "../../../src/components/checkin/ArrivalTimeField";
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
  const methods = useForm({ defaultValues: { arrivalTime: "" } });
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const presets = [
    { id: "15", label: "15 min" },
    { id: "30", label: "30 min" },
    { id: "60", label: "1 hour" },
    { id: "120", label: "2 hours" },
  ];

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
            aria-labelledby="arrival-title"
          >
            <header className="checkin-dialog__header">
              <p className="checkin-eyebrow">STEP 1 OF 3</p>
              <h2 id="arrival-title">Arrival and check-out</h2>
              <p className="checkin-description">
                When you expect to arrive and whether you have to leave by a set time.
              </p>
            </header>

            <form
              onSubmit={methods.handleSubmit(({ arrivalTime }) =>
                console.info("Check-in arrival time:", arrivalTime)
              )}
            >
              <div className="checkin-dialog__body">
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
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  className={`checkin-chip ${selectedArrival === "custom" ? "is-selected" : ""}`}
                  type="button"
                  aria-pressed={selectedArrival === "custom"}
                  onClick={() => {
                    setSelectedArrival("custom");
                    setShowTimeInput(true);
                  }}
                >
                  Pick a time
                </button>

                {showTimeInput && (
                  <div className="checkin-time-field">
                    <label htmlFor="arrivalTime">
                      Arrival time (24-hour, e.g. 1430)
                    </label>
                    <ArrivalTimeField />
                  </div>
                )}
              </div>

              <footer className="checkin-dialog__footer">
                <button className="checkin-next" type="submit">Next</button>
              </footer>
            </form>
          </section>
        </div>
      </main>
    </FormProvider>
  );
}
