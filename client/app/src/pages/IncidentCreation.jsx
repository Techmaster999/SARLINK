/* Incident creation page */
import { Header } from "../../../src/components/header/index.js";
import "./IncidentCreation.css";

/* header and section cards only, no form fields yet
acceptance critera: IncidentCreationLayout() */
export default function IncidentCreationLayout() {
  /* acceptance criteria: renderCreationFormSections() */
  function renderCreationFormSections() {
    const sections = [
      {
        id: "basic-info",
        title: "Basic info",
        rows: [
          [{ label: "Incident Name" }],
          [{ label: "Case ID Number" }, { label: "Date / Time" }],
          [{ label: "Location" }],
          [{ label: "Coordinator" }, { label: "Personnel on Duty", optional: true }],
        ],
      },
      { id: "mapping", title: "Mapping", rows: [[{ label: "Map URL", optional: true }]] },
      { id: "radio-channels", title: "Radio channels", rows: [[{ label: "Primary" }, { label: "Backup" }]] },
      { id: "teams-called", title: "Teams called", rows: [] },
    ];

    return sections.map((section) => (
      <section className="ic-card" key={section.id} aria-labelledby={`${section.id}-title`}>
        <h2 className="ic-card__title" id={`${section.id}-title`}>{section.title}</h2>

        {section.rows.map((row, i) => (
          <div className="ic-row" key={i}>
            {row.map((field) => (
              <p className="ic-field-heading" key={field.label}>
                {field.label}
                {field.optional && <span className="ic-field-optional">(optional)</span>}
              </p>
            ))}
          </div>
        ))}
      </section>
    ));
  }

  return (
    <div className="ic-page">
      {/* Header component */ }
      <Header /> 

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