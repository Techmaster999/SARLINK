/* Incident creation page */
//import { Header } from "../../../src/components/header/index.js";
import { useEffect, useState } from "react";
import axios from "axios";
import "./IncidentCreation.css";
import { BrowserRouter } from "react-router-dom";

/* header and section cards only, no form fields yet
acceptance critera: IncidentCreationLayout() */
export default function IncidentCreationLayout() {
  /* acceptance criteria: renderCreationFormSections() */
  function renderCreationFormSections() {
    const sections = [
    { id: "basic-info", title: "Basic info" },
    { id: "mapping", title: "Mapping" },
    { id: "radio-channels", title: "Radio channels" },
    { id: "teams-called", title: "Teams called" },
    ];

    return sections.map((section) => (
      <section className="ic-card" key={section.id} aria-labelledby={`${section.id}-title`}>
        <h2 className="ic-card__title" id={`${section.id}-title`}>
          {section.title}
        </h2>
      </section>
    ));
  }

  return (
        <div className="ic-page">
      <header className="sarlink-header">
        <div className="sarlink-header-brand" aria-label="SARLINK EDSAR">
          <span className="sarlink-header-logo">
            <svg className="sarlink-header-logo-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </span>
          <span className="sarlink-header-name">SARLINK</span>
          <span className="sarlink-header-agency">EDSAR</span>
        </div>

        <div className="sarlink-header-actions">
          <button
            type="button"
            className="sarlink-header-button sarlink-header-button-secondary"
            onClick={() => window.location.assign("/incident-hub")}
            aria-label="Return"
          >
            <span className="sarlink-header-button-icon">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M13 3h2.5A1.5 1.5 0 0 1 17 4.5v11a1.5 1.5 0 0 1-1.5 1.5H13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="m7 6-4 4 4 4M3 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sarlink-header-button-label">Return</span>
          </button>

          {/* Sign-out behavior is left for the authentication work */}
          <button
            type="button"
            className="sarlink-header-button sarlink-header-button-secondary"
            aria-label="Sign out"
          >
            <span className="sarlink-header-button-icon">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="m13 6 4 4-4 4M17 10H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="sarlink-header-button-label">Sign Out</span>
          </button>
        </div>
      </header>
      
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

