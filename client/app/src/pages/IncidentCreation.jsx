/* Incident creation page */
import { useState } from "react";
import Sidebar from "../../../src/components/Sidebar/Sidebar.jsx";
import { INCIDENT_NAV_ITEMS } from "../../../src/components/Sidebar/sidebarNavData.js";
import "./IncidentCreation.css";

const INCIDENT_TYPES = ["Hiking", "Climbing", "Water", "Skiing", "Other"];
const INCIDENT_STATUSES = ["Active", "Standby"];
const CHANNEL_ROLES = ["Command", "Tactical", "Air-to-ground", "Medical", "Logistics"];

const SPECIALTY_TEAMS = [
  { id: "k9", label: "K-9 search" },
  { id: "rope", label: "Technical rope rescue" },
  { id: "swiftwater", label: "Swiftwater rescue" },
  { id: "air", label: "Air support" },
  { id: "medical", label: "Medical / EMS" },
  { id: "drone", label: "Drone (UAS)" },
];

let channelSeq = 1;
const newChannel = () => ({ id: channelSeq++, name: "", frequency: "", role: "Command" });

const initialForm = () => ({
  // Basic info
  name: "",
  type: "",
  status: "Active",
  reportedAt: "",
  coordinator: "",
  personsMissing: "",
  description: "",
  // Mapping
  locationName: "",
  latitude: "",
  longitude: "",
  // Radio channels
  channels: [newChannel()],
  // Specialty teams
  specialtyTeams: [],
  specialtyNotes: "",
});

// Small form controls
function Field({ id, label, hint, error, children }) {
  return (
    <div className="ic-field">
      <label className="ic-label" htmlFor={id}>
        {label}
        {hint && <span className="ic-hint">{hint}</span>}
      </label>
      {children}
      {error && (
        <p className="ic-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TextField({ id, label, hint, error, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        className="ic-input"
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

function SelectField({ id, label, hint, error, options, placeholder, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <select
        className="ic-select"
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TextAreaField({ id, label, hint, error, ...rest }) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <textarea
        className="ic-textarea"
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </Field>
  );
}

// Page layout 
export default function IncidentCreation({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  const handleChange = (event) => updateField(event.target.name, event.target.value);

  // Radio channels
  function updateChannel(id, field, value) {
    updateField(
      "channels",
      form.channels.map((channel) => (channel.id === id ? { ...channel, [field]: value } : channel))
    );
  }
  const addChannel = () => updateField("channels", [...form.channels, newChannel()]);
  const removeChannel = (id) =>
    updateField("channels", form.channels.filter((channel) => channel.id !== id));

  // Specialty teams
  function toggleTeam(id) {
    updateField(
      "specialtyTeams",
      form.specialtyTeams.includes(id)
        ? form.specialtyTeams.filter((teamId) => teamId !== id)
        : [...form.specialtyTeams, id]
    );
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Incident name is required.";
    if (!form.type) next.type = "Select an incident type.";
    const lat = form.latitude.trim();
    const lng = form.longitude.trim();
    if (lat && !(Number(lat) >= -90 && Number(lat) <= 90)) next.latitude = "Enter a value from -90 to 90.";
    if (lng && !(Number(lng) >= -180 && Number(lng) <= 180)) next.longitude = "Enter a value from -180 to 180.";
    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Drop empty channel rows and the local-only ids
    const payload = {
      ...form,
      channels: form.channels
        .filter((channel) => channel.name.trim() || channel.frequency.trim())
        .map(({ id, ...channel }) => channel),
    };

    // TODO: send the payload to API
    if (onSubmit) onSubmit(payload);
    else console.log("New incident", payload);

    window.location.assign("/incident-hub");
  }

  // Section content 

  // Basic information
  function renderBasicInfo() {
    return (
      <>
        <TextField
          id="incident-name"
          name="name"
          label="Incident name"
          placeholder="e.g. Lost Hikers – Desolation Wilderness"
          value={form.name}
          error={errors.name}
          onChange={handleChange}
        />
        <div className="ic-row">
          <SelectField
            id="incident-type"
            name="type"
            label="Type"
            placeholder="Select type"
            options={INCIDENT_TYPES}
            value={form.type}
            error={errors.type}
            onChange={handleChange}
          />
          <SelectField
            id="incident-status"
            name="status"
            label="Status"
            options={INCIDENT_STATUSES}
            value={form.status}
            onChange={handleChange}
          />
        </div>
        <div className="ic-row">
          <TextField
            id="incident-reported"
            name="reportedAt"
            label="Reported"
            type="datetime-local"
            value={form.reportedAt}
            onChange={handleChange}
          />
          <TextField
            id="incident-missing"
            name="personsMissing"
            label="Persons missing"
            type="number"
            min="0"
            placeholder="0"
            value={form.personsMissing}
            onChange={handleChange}
          />
        </div>
        <TextField
          id="incident-coordinator"
          name="coordinator"
          label="Coordinator"
          placeholder="e.g. Cpt. D. Reeves"
          value={form.coordinator}
          onChange={handleChange}
        />
        <TextAreaField
          id="incident-description"
          name="description"
          label="Description"
          hint="(optional)"
          placeholder="Last known position, subjects, conditions…"
          value={form.description}
          onChange={handleChange}
        />
      </>
    );
  }

  // Mapping
  function renderMapping() {
    return (
      <>
        <TextField
          id="incident-location"
          name="locationName"
          label="Location"
          placeholder="e.g. Desolation Wilderness, El Dorado Co."
          value={form.locationName}
          onChange={handleChange}
        />
        <div className="ic-row">
          <TextField
            id="incident-latitude"
            name="latitude"
            label="Latitude"
            inputMode="decimal"
            placeholder="38.8900"
            value={form.latitude}
            error={errors.latitude}
            onChange={handleChange}
          />
          <TextField
            id="incident-longitude"
            name="longitude"
            label="Longitude"
            inputMode="decimal"
            placeholder="-120.1000"
            value={form.longitude}
            error={errors.longitude}
            onChange={handleChange}
          />
        </div>
        {/* Replace placeholder with map component */}
        <div className="ic-map" role="img" aria-label="Map placeholder">
          <p className="ic-map__title">Map preview</p>
          <p className="ic-map__text">Connect a map here to pick the incident location.</p>
        </div>
      </>
    );
  }

// Radio channels
  function renderRadioChannels() {
    return (
      <div className="ic-channels">
        <div className="ic-channel-row ic-channel-head" aria-hidden="true">
          <span>Channel</span>
          <span>Frequency</span>
          <span>Use</span>
          <span />
        </div>

        {form.channels.map((channel, index) => (
          <div className="ic-channel-row" key={channel.id}>
            <input
              className="ic-input"
              aria-label={`Channel ${index + 1} name`}
              placeholder="Name"
              value={channel.name}
              onChange={(event) => updateChannel(channel.id, "name", event.target.value)}
            />
            <input
              className="ic-input"
              aria-label={`Channel ${index + 1} frequency`}
              placeholder="155.160 MHz"
              inputMode="decimal"
              value={channel.frequency}
              onChange={(event) => updateChannel(channel.id, "frequency", event.target.value)}
            />
            <select
              className="ic-select"
              aria-label={`Channel ${index + 1} use`}
              value={channel.role}
              onChange={(event) => updateChannel(channel.id, "role", event.target.value)}
            >
              {CHANNEL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ic-btn ic-btn--ghost ic-btn--sm"
              aria-label={`Remove channel ${index + 1}`}
              onClick={() => removeChannel(channel.id)}
              disabled={form.channels.length === 1}
            >
              Remove
            </button>
          </div>
        ))}

        <button type="button" className="ic-btn ic-btn--secondary ic-btn--sm" onClick={addChannel}>
          + Add channel
        </button>
      </div>
    );
  }

  function renderSpecialtyTeams() {
    return (
      <>
        <div className="ic-options" role="group" aria-label="Specialty teams">
          {SPECIALTY_TEAMS.map((team) => (
            <label className="ic-option" key={team.id}>
              <input
                type="checkbox"
                checked={form.specialtyTeams.includes(team.id)}
                onChange={() => toggleTeam(team.id)}
              />
              {team.label}
            </label>
          ))}
        </div>
        <TextAreaField
          id="incident-specialty-notes"
          name="specialtyNotes"
          label="Support notes"
          hint="(optional)"
          placeholder="Staging area, requested arrival time, special equipment…"
          value={form.specialtyNotes}
          onChange={handleChange}
        />
      </>
    );
  }

  // Render form sections
  function renderCreationFormSections() {
    const sections = [
      {
        id: "basic-info",
        title: "Basic information",
        description: "Core details about the callout.",
        content: renderBasicInfo(),
      },
      {
        id: "mapping",
        title: "Mapping",
        description: "Where the incident is taking place.",
        content: renderMapping(),
      },
      {
        id: "radio-channels",
        title: "Radio channels",
        description: "Frequencies assigned for this incident.",
        content: renderRadioChannels(),
      },
      {
        id: "specialty-teams",
        title: "Specialty team support",
        description: "Request additional capabilities.",
        badge: form.specialtyTeams.length > 0 ? `${form.specialtyTeams.length} selected` : null,
        content: renderSpecialtyTeams(),
      },
    ];

    return sections.map((section) => (
      <section className="ic-card" key={section.id} aria-labelledby={`${section.id}-title`}>
        <div className="ic-card__header">
          <div>
            <h2 className="ic-card__title" id={`${section.id}-title`}>
              {section.title}
            </h2>
            <p className="ic-card__description">{section.description}</p>
          </div>
          {section.badge && <span className="ic-badge ic-badge--primary">{section.badge}</span>}
        </div>
        <div className="ic-card__body">{section.content}</div>
      </section>
    ));
  }

  return (
    <div className="incident-creation-layout">
      <Sidebar currentPath={window.location.pathname} navItems={INCIDENT_NAV_ITEMS} />
      <main className="incident-creation-content">
        <div className="incident-creation">
          <header className="ic-page-header">
            <a className="ic-back-link" href="/incident-hub">
              ← Back to incidents
            </a>
            <h1 className="ic-title">New incident</h1>
            <p className="ic-subtitle">Create a callout and assign mapping, radio and specialty support.</p>
          </header>

          <form className="ic-form" onSubmit={handleSubmit} noValidate>
            <div className="ic-sections">{renderCreationFormSections()}</div>

            <div className="ic-actions">
              <a className="ic-btn ic-btn--secondary" href="/incident-hub">
                Cancel
              </a>
              <button type="submit" className="ic-btn ic-btn--primary">
                Create incident
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}