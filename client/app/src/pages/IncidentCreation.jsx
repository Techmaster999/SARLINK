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

