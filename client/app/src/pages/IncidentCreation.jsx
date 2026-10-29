/* Incident creation page */
import { useState } from "react";
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

// ── Master team list ──────────────────────────────────────────────────────────
export const ALL_TEAMS = [
  // Ground
  { id: "gnd-1", label: "Ground Team 1", category: "Ground", teamType: "Type 1" },
  { id: "gnd-2", label: "Ground Team 2", category: "Ground", teamType: "Type 2" },
  { id: "gnd-3", label: "Ground Team 3", category: "Ground", teamType: "Type 3" },
  { id: "gnd-4", label: "Ground Team 4", category: "Ground", teamType: "Type 3 Trainee" },
  { id: "gnd-5", label: "Hasty Team", category: "Ground", teamType: "Type 1" },
  // K9
  { id: "k9-area", label: "K9 Unit – Area", category: "K9", k9Specialty: "Area" },
  { id: "k9-trailing", label: "K9 Unit – Trailing", category: "K9", k9Specialty: "Trailing" },
  { id: "k9-hrd", label: "K9 Unit – HRD", category: "K9", k9Specialty: "HRD" },
  { id: "k9-water", label: "K9 Unit – Water", category: "K9", k9Specialty: "Water" },
  // ATR – Animal Technical Rescue
  { id: "atr-1", label: "ATR Team 1", category: "ATR" },
  { id: "atr-2", label: "ATR Team 2", category: "ATR" },
  { id: "atr-3", label: "ATR Team 3", category: "ATR" },
  // TRR – Technical Rope Rescue
  { id: "trr-1", label: "TRR Team 1", category: "TRR" },
  { id: "trr-2", label: "TRR Team 2", category: "TRR" },
  { id: "trr-3", label: "TRR Team 3", category: "TRR" },
  // OHV – Off Highway Vehicle
  { id: "ohv-1", label: "OHV Unit 1", category: "OHV" },
  { id: "ohv-2", label: "OHV Unit 2", category: "OHV" },
  { id: "ohv-3", label: "OHV Unit 3", category: "OHV" },
  // Swift Water
  { id: "sw-1", label: "Swift Water Team 1", category: "Swift Water" },
  { id: "sw-2", label: "Swift Water Team 2", category: "Swift Water" },
  { id: "sw-3", label: "Swift Water Team 3", category: "Swift Water" },
  // UAS – Drone / Unmanned Aircraft System
  { id: "uas-1", label: "UAS Operator 1", category: "UAS" },
  { id: "uas-2", label: "UAS Operator 2", category: "UAS" },
  { id: "uas-3", label: "UAS Operator 3", category: "UAS" },
  // IST – Incident Support Team
  { id: "ist-1", label: "IST 1", category: "IST" },
  { id: "ist-2", label: "IST 2", category: "IST" },
  { id: "ist-3", label: "IST 3", category: "IST" },
];

// ── Filter dropdown options ───────────────────────────────────────────────────
export const FILTER_OPTIONS = [
  { value: "All", label: "All Types" },
  { value: "Ground", label: "Ground" },
  { value: "K9", label: "K9" },
  { value: "ATR", label: "Animal Technical Rescue (ATR)" },
  { value: "TRR", label: "Technical Rope Rescue (TRR)" },
  { value: "OHV", label: "Off Highway Vehicle (OHV)" },
  { value: "Swift Water", label: "Swift Water" },
  { value: "UAS", label: "Drone / UAS" },
  { value: "IST", label: "Incident Support Team (IST)" },
];

/**
 * Filter Specialty Teams by type or category.
 * Supports (teams, type) or (type, teams) or (type).
 */
export function filterSpecialtyTeamsByType(teamsOrType, typeOrTeams) {
  let teams = ALL_TEAMS;
  let type = "All";

  if (Array.isArray(teamsOrType)) {
    teams = teamsOrType;
    if (typeof typeOrTeams === "string") {
      type = typeOrTeams;
    }
  } else if (typeof teamsOrType === "string") {
    type = teamsOrType;
    if (Array.isArray(typeOrTeams)) {
      teams = typeOrTeams;
    }
  }

  if (!type || type === "All" || type.toLowerCase() === "all") {
    return teams;
  }

  return teams.filter(
    (team) =>
      team.category?.toLowerCase() === type.toLowerCase() ||
      team.teamType?.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Handles dropping a team into the selected teams list.
 * Supports native HTML5 drop events, @hello-pangea/dnd results, or direct IDs/objects.
 */
export function handleTeamDrop(dropEventOrItem, currentSelected = [], setSelected) {
  let teamId = null;

  if (dropEventOrItem && typeof dropEventOrItem === "object") {
    if (dropEventOrItem.dataTransfer) {
      if (typeof dropEventOrItem.preventDefault === "function") {
        dropEventOrItem.preventDefault();
      }
      teamId =
        dropEventOrItem.dataTransfer.getData("text/plain") ||
        dropEventOrItem.dataTransfer.getData("teamId");
    } else if (dropEventOrItem.draggableId) {
      teamId = dropEventOrItem.draggableId;
    } else if (dropEventOrItem.id) {
      teamId = dropEventOrItem.id;
    }
  } else if (typeof dropEventOrItem === "string") {
    teamId = dropEventOrItem;
  }

  if (!teamId) return currentSelected;

  const alreadySelected = currentSelected.some(
    (item) => (typeof item === "string" ? item : item.id) === teamId
  );

  let updatedSelected = currentSelected;
  if (!alreadySelected) {
    if (currentSelected.length > 0 && typeof currentSelected[0] === "object") {
      const teamObj = ALL_TEAMS.find((t) => t.id === teamId);
      updatedSelected = [...currentSelected, teamObj || { id: teamId, label: teamId }];
    } else {
      updatedSelected = [...currentSelected, teamId];
    }
  }

  if (typeof setSelected === "function") {
    setSelected(updatedSelected);
  }

  return updatedSelected;
}

// Category styling tokens matching Figma
const CATEGORY_STYLES = {
  Ground: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
  K9: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" },
  ATR: { bg: "#F5F3FF", border: "#DDD6FE", text: "#7C3AED" },
  TRR: { bg: "#FFF1F2", border: "#FECDD3", text: "#BE123C" },
  OHV: { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C" },
  "Swift Water": { bg: "#ECFEFF", border: "#A5F3FC", text: "#0E7490" },
  UAS: { bg: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" },
  IST: { bg: "#F1F5F9", border: "#CBD5E1", text: "#475569" },
};

const TYPE_SHORT = {
  "Type 1": "T1",
  "Type 2": "T2",
  "Type 3": "T3",
  "Type 3 Trainee": "T3 Trn",
  "Type 4": "T4",
};

/**
 * SpecialtyTeamsSection
 * Acceptance criteria:
 * - Drop-down menu for team type filtering
 * - Specialty Teams displayed in pre-displayed menu filtered by selected type
 * - Drag and drop teams into a selected teams menu
 */
export function SpecialtyTeamsSection({
  selectedTeamIds: externalSelected,
  onChange: externalOnChange,
  defaultSelected = [],
}) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const selectedTeamIds = externalSelected !== undefined ? externalSelected : internalSelected;
  const setSelectedTeamIds = externalOnChange || setInternalSelected;

  const [selectedType, setSelectedType] = useState("All");
  const [isDragOver, setIsDragOver] = useState(false);

  const addTeam = (id) => {
    handleTeamDrop(id, selectedTeamIds, setSelectedTeamIds);
  };

  const removeTeam = (id) => {
    const updated = selectedTeamIds.filter(
      (item) => (typeof item === "string" ? item : item.id) !== id
    );
    setSelectedTeamIds(updated);
  };

  const filteredTeams = filterSpecialtyTeamsByType(ALL_TEAMS, selectedType);
  const availableTeams = filteredTeams.filter((team) => {
    return !selectedTeamIds.some(
      (item) => (typeof item === "string" ? item : item.id) === team.id
    );
  });

  const calledTeams = selectedTeamIds
    .map((item) => {
      const id = typeof item === "string" ? item : item.id;
      return ALL_TEAMS.find((t) => t.id === id) || (typeof item === "object" ? item : null);
    })
    .filter(Boolean);

  return (
    <section className="ic-card ic-teams-card" aria-labelledby="teams-called-title">
      <h2 className="ic-card__title" id="teams-called-title">
        Specialty Teams Support
      </h2>

      <div className="ic-teams-container">
        {/* Dropdown filter */}
        <div className="ic-field ic-teams-filter">
          <label className="ic-field__label" htmlFor="team-type-filter">
            Filter by team type
          </label>
          <select
            id="team-type-filter"
            className="ic-field__input ic-teams-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2-Column layout: Available Teams & Selected Teams */}
        <div className="ic-teams-grid">
          {/* Available Teams Column */}
          <div className="ic-teams-col">
            <div className="ic-teams-col__header">
              <span className="ic-teams-col__title">Available Teams</span>
              <span className="ic-teams-badge">{availableTeams.length}</span>
            </div>

            <div className="ic-teams-list" role="region" aria-label="Available specialty teams">
              {availableTeams.length === 0 ? (
                <p className="ic-teams-empty">
                  {selectedType !== "All"
                    ? "No teams available in this category."
                    : "All teams have been selected."}
                </p>
              ) : (
                availableTeams.map((team) => {
                  const catStyle = CATEGORY_STYLES[team.category] || CATEGORY_STYLES.IST;
                  const typeLabel =
                    team.category === "Ground" && team.teamType
                      ? TYPE_SHORT[team.teamType] || team.teamType
                      : team.category === "K9"
                      ? team.k9Specialty
                      : null;

                  return (
                    <div
                      key={team.id}
                      className="ic-team-item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", team.id);
                        e.dataTransfer.setData("teamId", team.id);
                      }}
                    >
                      <span className="ic-team-grip" aria-hidden="true">
                        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                          <circle cx="3" cy="3.5" r="1.2" fill="currentColor" />
                          <circle cx="3" cy="7" r="1.2" fill="currentColor" />
                          <circle cx="3" cy="10.5" r="1.2" fill="currentColor" />
                          <circle cx="9" cy="3.5" r="1.2" fill="currentColor" />
                          <circle cx="9" cy="7" r="1.2" fill="currentColor" />
                          <circle cx="9" cy="10.5" r="1.2" fill="currentColor" />
                        </svg>
                      </span>

                      <span className="ic-team-label" title={team.label}>
                        {team.label}
                      </span>

                      {typeLabel && (
                        <span
                          className={`ic-tag ${
                            team.category === "K9" ? "ic-tag--k9" : "ic-tag--type"
                          }`}
                        >
                          {typeLabel}
                        </span>
                      )}

                      <span
                        className="ic-tag ic-tag--category"
                        style={{
                          backgroundColor: catStyle.bg,
                          color: catStyle.text,
                          borderColor: catStyle.border,
                        }}
                      >
                        {team.category}
                      </span>

                      <button
                        type="button"
                        className="ic-team-action-btn"
                        title="Add team"
                        aria-label={`Add ${team.label}`}
                        onClick={() => addTeam(team.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M7 2v10M2 7h10"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Teams Column (Drop Zone) */}
          <div className="ic-teams-col">
            <div className="ic-teams-col__header">
              <span className="ic-teams-col__title">Selected Teams</span>
              <span className="ic-teams-badge ic-teams-badge--active">
                {calledTeams.length}
              </span>
            </div>

            <div
              className={`ic-teams-dropzone ${
                isDragOver ? "ic-teams-dropzone--active" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                setIsDragOver(false);
                handleTeamDrop(e, selectedTeamIds, setSelectedTeamIds);
              }}
              role="region"
              aria-label="Selected teams drop zone"
            >
              {calledTeams.length === 0 ? (
                <div className="ic-teams-dropzone-placeholder">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="ic-dropzone-icon"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="28"
                      height="28"
                      rx="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <path
                      d="M16 10v12M10 16l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p>
                    {isDragOver
                      ? "Release to add team"
                      : "Drag teams here, or click ＋"}
                  </p>
                </div>
              ) : (
                calledTeams.map((team) => {
                  const catStyle = CATEGORY_STYLES[team.category] || CATEGORY_STYLES.IST;
                  const typeLabel =
                    team.category === "Ground" && team.teamType
                      ? TYPE_SHORT[team.teamType] || team.teamType
                      : team.category === "K9"
                      ? team.k9Specialty
                      : null;

                  return (
                    <div
                      key={team.id}
                      className="ic-team-chip"
                      style={{
                        backgroundColor: catStyle.bg,
                        borderColor: catStyle.border,
                      }}
                    >
                      <span className="ic-team-label" title={team.label}>
                        {team.label}
                      </span>

                      {typeLabel && (
                        <span
                          className={`ic-tag ${
                            team.category === "K9" ? "ic-tag--k9" : "ic-tag--type"
                          }`}
                        >
                          {typeLabel}
                        </span>
                      )}

                      <span
                        className="ic-tag ic-tag--category"
                        style={{
                          backgroundColor: "#FFFFFF",
                          color: catStyle.text,
                          borderColor: catStyle.border,
                        }}
                      >
                        {team.category}
                      </span>

                      <button
                        type="button"
                        className="ic-team-action-btn ic-team-action-btn--remove"
                        title="Remove team"
                        aria-label={`Remove ${team.label}`}
                        onClick={() => removeTeam(team.id)}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 2l8 8M10 2L2 10"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Alias for flexibility
export const TeamsCalledSection = SpecialtyTeamsSection;

/* header and section cards only, no form fields yet
acceptance critera: IncidentCreationLayout() */
export default function IncidentCreationLayout() {
  const [calledTeamIds, setCalledTeamIds] = useState([]);
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
      if (section.id === "teams-called") {
        return (
          <SpecialtyTeamsSection
            key={section.id}
            selectedTeamIds={calledTeamIds}
            onChange={setCalledTeamIds}
          />
        );
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