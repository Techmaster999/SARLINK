/* Incident creation page */
import { useForm } from "react-hook-form";
import "./IncidentCreation.css";

/**
 * Handles basic info input changes.
 * Accepts an event object or (name, value) pair and an optional callback/setter.
 */
export function handleBasicInfoChange(eventOrName, valueOrSetter) {
  if (eventOrName && eventOrName.target) {
    const { name, value } = eventOrName.target;
    if (typeof valueOrSetter === "function") {
      valueOrSetter(name, value);
    }
    return { name, value };
  }
  if (typeof eventOrName === "string") {
    const name = eventOrName;
    const value = valueOrSetter;
    return { name, value };
  }
  return undefined;
}

/**
 * BasicInfoFormSection
 * Acceptance criteria: textboxes with placeholder text for:
 * Name, ID, Date, Location, Coordinator, Personnel
 * Emulates the SARLINK Figma design layout and tokens.
 */
export function BasicInfoFormSection({
  register: externalRegister,
  handleBasicInfoChange: customHandleChange,
  errors = {},
  defaultValues = {},
}) {
  const localForm = useForm({
    defaultValues: {
      name: "",
      id: "",
      date: "",
      location: "",
      coordinator: "",
      personnel: "",
      ...defaultValues,
    },
  });

  const register = externalRegister || localForm.register;
  const onChangeHandler = customHandleChange || handleBasicInfoChange;

  return (
    <section className="ic-card" aria-labelledby="basic-info-title">
      <h2 className="ic-card__title" id="basic-info-title">
        Basic info
      </h2>
      <div className="ic-card__content">
        {/* Incident Name */}
        <div className="ic-field">
          <label className="ic-field__label" htmlFor="basic-info-name">
            Incident Name
          </label>
          <input
            id="basic-info-name"
            type="text"
            placeholder="e.g. Lost Hiker – Mt. Hood"
            className="ic-field__input"
            {...register("name", {
              onChange: (e) => onChangeHandler(e),
            })}
          />
          {errors?.name && (
            <p className="ic-field__error">{errors.name.message || errors.name}</p>
          )}
        </div>

        {/* Case ID Number & Date / Time */}
        <div className="ic-form-row">
          <div className="ic-field">
            <label className="ic-field__label" htmlFor="basic-info-id">
              Case ID Number
            </label>
            <input
              id="basic-info-id"
              type="text"
              placeholder="e.g. SAR-2026-0412"
              className="ic-field__input"
              {...register("id", {
                onChange: (e) => onChangeHandler(e),
              })}
            />
            {errors?.id && (
              <p className="ic-field__error">{errors.id.message || errors.id}</p>
            )}
          </div>

          <div className="ic-field">
            <label className="ic-field__label" htmlFor="basic-info-date">
              Date / Time
            </label>
            <input
              id="basic-info-date"
              type="text"
              placeholder="e.g. 2026-10-24 14:00"
              className="ic-field__input"
              {...register("date", {
                onChange: (e) => onChangeHandler(e),
              })}
            />
            {errors?.date && (
              <p className="ic-field__error">{errors.date.message || errors.date}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="ic-field">
          <label className="ic-field__label" htmlFor="basic-info-location">
            Location
          </label>
          <input
            id="basic-info-location"
            type="text"
            placeholder="Address or grid coordinates"
            className="ic-field__input"
            {...register("location", {
              onChange: (e) => onChangeHandler(e),
            })}
          />
          {errors?.location && (
            <p className="ic-field__error">{errors.location.message || errors.location}</p>
          )}
        </div>

        {/* Coordinator & Personnel */}
        <div className="ic-form-row">
          <div className="ic-field">
            <label className="ic-field__label" htmlFor="basic-info-coordinator">
              Coordinator
            </label>
            <input
              id="basic-info-coordinator"
              type="text"
              placeholder="Full name"
              className="ic-field__input"
              {...register("coordinator", {
                onChange: (e) => onChangeHandler(e),
              })}
            />
            {errors?.coordinator && (
              <p className="ic-field__error">{errors.coordinator.message || errors.coordinator}</p>
            )}
          </div>

          <div className="ic-field">
            <label className="ic-field__label" htmlFor="basic-info-personnel">
              Personnel on Duty
              <span className="ic-field__hint">(optional)</span>
            </label>
            <input
              id="basic-info-personnel"
              type="text"
              placeholder="Names or count"
              className="ic-field__input"
              {...register("personnel", {
                onChange: (e) => onChangeHandler(e),
              })}
            />
            {errors?.personnel && (
              <p className="ic-field__error">{errors.personnel.message || errors.personnel}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Handles mapping and radio channel input changes.
 * Accepts an event object or (name, value) pair and an optional callback/setter.
 */
export function handleRadioMappingChange(eventOrName, valueOrSetter) {
  if (eventOrName && eventOrName.target) {
    const { name, value } = eventOrName.target;
    if (typeof valueOrSetter === "function") {
      valueOrSetter(name, value);
    }
    return { name, value };
  }
  if (typeof eventOrName === "string") {
    const name = eventOrName;
    const value = valueOrSetter;
    return { name, value };
  }
  return undefined;
}

/**
 * MappingRadioFormSection
 * Acceptance criteria: textboxes with placeholder text for:
 * Map URL (Mapping), Primary and Secondary (Radio Channels)
 */
export function MappingRadioFormSection({
  register: externalRegister,
  handleRadioMappingChange: customHandleChange,
  errors = {},
  defaultValues = {},
}) {
  const localForm = useForm({
    defaultValues: {
      mapUrl: "",
      radioPrimary: "",
      radioSecondary: "",
      ...defaultValues,
    },
  });

  const register = externalRegister || localForm.register;
  const onChangeHandler = customHandleChange || handleRadioMappingChange;

  return (
    <>
      <section className="ic-card" aria-labelledby="mapping-title">
        <h2 className="ic-card__title" id="mapping-title">
          Mapping
        </h2>
        <div className="ic-card__content">
          {/* Map URL */}
          <div className="ic-field">
            <label className="ic-field__label" htmlFor="mapping-map-url">
              Map URL
              <span className="ic-field__hint">(optional)</span>
            </label>
            <input
              id="mapping-map-url"
              type="url"
              placeholder="https://…"
              className="ic-field__input"
              {...register("mapUrl", {
                onChange: (e) => onChangeHandler(e),
              })}
            />
            {errors?.mapUrl && (
              <p className="ic-field__error">{errors.mapUrl.message || errors.mapUrl}</p>
            )}
          </div>
        </div>
      </section>

      <section className="ic-card" aria-labelledby="radio-channels-title">
        <h2 className="ic-card__title" id="radio-channels-title">
          Radio channels
        </h2>
        <div className="ic-card__content">
          {/* Primary & Secondary */}
          <div className="ic-form-row">
            <div className="ic-field">
              <label className="ic-field__label" htmlFor="radio-primary">
                Primary
              </label>
              <input
                id="radio-primary"
                type="text"
                placeholder="e.g. CH 3 – Command"
                className="ic-field__input"
                {...register("radioPrimary", {
                  onChange: (e) => onChangeHandler(e),
                })}
              />
              {errors?.radioPrimary && (
                <p className="ic-field__error">{errors.radioPrimary.message || errors.radioPrimary}</p>
              )}
            </div>

            <div className="ic-field">
              <label className="ic-field__label" htmlFor="radio-secondary">
                Secondary
              </label>
              <input
                id="radio-secondary"
                type="text"
                placeholder="e.g. CH 7 – Tactical"
                className="ic-field__input"
                {...register("radioSecondary", {
                  onChange: (e) => onChangeHandler(e),
                })}
              />
              {errors?.radioSecondary && (
                <p className="ic-field__error">{errors.radioSecondary.message || errors.radioSecondary}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* header and section cards only, no form fields yet
acceptance critera: IncidentCreationLayout() */
export default function IncidentCreationLayout() {
  const {
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      id: "",
      date: "",
      location: "",
      coordinator: "",
      personnel: "",
      mapUrl: "",
      radioPrimary: "",
      radioSecondary: "",
    },
  });

  /* acceptance criteria: renderCreationFormSections() */
  function renderCreationFormSections() {
    const sections = [
      { id: "basic-info", title: "Basic info" },
      { id: "mapping", title: "Mapping" },
      { id: "radio-channels", title: "Radio channels" },
      { id: "teams-called", title: "Teams called" },
    ];

    return sections.map((section) => {
      if (section.id === "basic-info") {
        return (
          <BasicInfoFormSection
            key={section.id}
            register={register}
            handleBasicInfoChange={handleBasicInfoChange}
            errors={errors}
          />
        );
      }

      /* MappingRadioFormSection renders both the Mapping and Radio channels cards */
      if (section.id === "mapping") {
        return (
          <MappingRadioFormSection
            key={section.id}
            register={register}
            handleRadioMappingChange={handleRadioMappingChange}
            errors={errors}
          />
        );
      }
      if (section.id === "radio-channels") {
        return null;
      }

      return (
        <section className="ic-card" key={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 className="ic-card__title" id={`${section.id}-title`}>
            {section.title}
          </h2>
        </section>
      );
    });
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
