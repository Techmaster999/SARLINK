/* Incident callout/creation page */
import "./IncidentCreation.css";

export default function IncidentCreationLayout() {
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
  );
}