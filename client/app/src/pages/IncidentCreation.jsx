/* Incident creation page */
import { Header } from "../../../src/components/header/index.js";
import { useEffect, useState } from "react";
import axios from "axios";
import "./IncidentCreation.css";
import { BrowserRouter } from "react-router-dom";

/* header and section cards only, no form fields yet
acceptance critera: IncidentCreationLayout() */
export default function IncidentCreationLayout() {
  /* acceptance criteria: renderCreationFormSections() */
  function renderCreationFormSections() {
    // Each row holds one field (full width) or two fields (half width each).
    // type: "text" (default), "datetime-local", "select" or "checkbox".
    const sections = [
      {
        id: "basic-info",
        title: "Basic info",
        rows: [
          [{ id: "incident-name", label: "Incident Name" }],
          [
            { id: "case-id", label: "Case ID Number" },
            { id: "date-time", label: "Date / Time" },
          ],
          [{ id: "location", label: "Location" }],
          [
            { id: "coordinator", label: "Coordinator" },
            { id: "personnel-on-duty", label: "Personnel on Duty", optional: true },
          ],
          [{ id: "mutual-aid", label: "Mutual Aid", type: "checkbox" }],
        ],
      },
      {
        id: "mapping",
        title: "Mapping",
        rows: [[{ id: "map-url", label: "Map URL", optional: true }]],
      },
      {
        id: "radio-channels",
        title: "Radio channels",
        rows: [
          [
            { id: "radio-primary", label: "Primary" },
            { id: "radio-backup", label: "Backup" },
          ],
        ],
      },
      {
        id: "teams-called",
        title: "Teams called",
        rows: [[{ id: "team-filter", label: "Filter by type", type: "select" }]],
        hasTeamLists: true,
      },
    ];

    return sections.map((section) => (
      <section className="ic-card" key={section.id} aria-labelledby={`${section.id}-title`}>
        <h2 className="ic-card__title" id={`${section.id}-title`}>
          {section.title}
        </h2>

        {section.rows.map((row, rowIndex) => (
          <div className="ic-row" key={rowIndex}>
            {row.map((field) =>
              field.type === "checkbox" ? (
                <label className="ic-checkbox" key={field.id} htmlFor={field.id}>
                  <input type="checkbox" id={field.id} name={field.id} />
                  {field.label}
                </label>
              ) : (
                <div className="ic-field" key={field.id}>
                  <label className="ic-label" htmlFor={field.id}>
                    {field.label}
                    {field.optional && <span className="ic-optional">(optional)</span>}
                  </label>
                  {field.type === "select" ? (
                    <select className="ic-select" id={field.id} name={field.id} />
                  ) : (
                    <input
                      className="ic-input"
                      id={field.id}
                      name={field.id}
                      type={field.type || "text"}
                    />
                  )}
                </div>
              )
            )}
          </div>
        ))}

        {section.hasTeamLists && (
          <div className="ic-teams">
            <div className="ic-team-column">
              <h3 className="ic-team-heading">Available</h3>
              <div className="ic-team-list" role="list" aria-label="Available teams" />
            </div>
            <div className="ic-team-column">
              <h3 className="ic-team-heading">Called</h3>
              <div className="ic-dropzone" role="list" aria-label="Called teams" />
            </div>
          </div>
        )}
      </section>
    ));
  }

  return (
    <div className="ic-page">
      {/* Header component */ }
      <BrowserRouter>
        <Header /> 
      </BrowserRouter>
      
      <main className="ic-main">
        <div className="incident-creation">
          <header className="ic-header">
            <nav className="ic-breadcrumb" aria-label="Breadcrumb">
              <span>Incidents</span>
              <span aria-hidden="true">›</span>
              <span aria-current="page">New Incident</span>
            </nav>

            <div className="ic-title-row">
              <h1 className="ic-title">New Incident</h1>
              <span className="ic-badge">Draft</span>
            </div>

            <p className="ic-subtitle">Fill in the details below to open a new incident.</p>
          </header>

          <form className="ic-form" noValidate>
            {renderCreationFormSections()}
          </form>
        </div>
      </main>
    </div>
  );
}

