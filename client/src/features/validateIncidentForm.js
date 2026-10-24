import { z } from "zod";
import { CA_COUNTIES } from "./incidentOptions"

export const COUNTY_VALUES = new Set(CA_COUNTIES.map((c) => c.value));

// Allow a little clock drift between the browser and "now".
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

// optional text field: empty is fine, but still capped in length.
const optionalText = (max, label) =>
    z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

/**
 * Builds the schema. Team IDs are passed in rather than imported, because the valid teams come from the database:
 * the client passes the list it loaded, and the server can pass the IDs it just queried. 
 * IF teamIds is omitted, team IDs are only checked to be strings.
 * 
 * @param {{ teamIds?: Iterable<string> }} [options] 
 */
export function createIncidentSchema({ teamIds } = {}) {
    const validTeamIds = teamIds ? new Set(teamIds) : null;

    return z.object({
    // ------- Required --------
    incidentName: requiredText("Incident name is required.", 120, "Incident name"),

    caseID: requiredText("Case ID is required.", 40, "Case ID"),

    dateTime: z
        .string()
        .min(1, "Date and time are required.")
        .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time.")
        .refine((v) => Date.parse(v) <= Date.now() + FUTURE_TOLERANCE_MS, "Date and time can't be in the future."),

        location: requiredText("Location is required.", 200, "Location"),

        coordinator: requiredText("Coordinator is required.", 100, "Coordinator"),

        // ------- Optional -------
        personnel: optionalText(200, "Personnel on duty"),

        mapUrl: z
            .string()
            .trim()
            .refine((v) => v === "" || isHttpUrl(v), "Enter a full URL starting with http:// or https://."),

        radioPrimary: optionalText(50, "Primary channel"),
        radioBackup: optionalText(50, "Backup channel"),

        calledTeamIds: z
            .array(z.string())
            .refine(
                (ids) => !validTeamIds || ids.every((id) => validTeamIds.has(id)),
                "One or more selected teams are no longer available. Remove them and try again.",
            ),

        mutualAid: z.boolean(),
        mutualAidCounty: z.string(), // required only when mutaualAid is checked; see crossFieldErrors
    });
}

/**
 * Rules that depend on more than one field. Kept outside the schema so they run even when other fields fail 
 * (Zod skips object level refinements if any field already has an error, which would these until a second click) 
 */
function crossFieldErrors(values) {
    const errors = {};
    if (values?.mutualAid) {
        if(!values?.mutualAidCounty) {
            errors.mutualAidCounty = { type: "required", message: "Select the requesting county." };
        } else if (!COUNTY_VALUES.has(values.mutualAidCounty)) {
            errors.mutualAidCounty = { type: "invalid", message: "Select a county from the list." };
        }
    }
    return errors;
}

/**
 * Validates the Create Incident form.
 * - checks every required field is filled out (whitespace-only counts as empty)
 * - checks formats and limits (date not in the future, valid URL, lengths, known teams/county)
 * 
 * @param {object} values the form values
 * @param {{ teams?: Array<{ id: string }> }} [options] the teams the user could pick from
 * 
 * @returns { success: true, data, errors: {} } if form values are valid
 * @returns { success: fasle, data: null, errors } if form values are not valid
 * where errors is shaped like react-hook-form's: { fieldName: { type, message } }.
 */
export function validateIncidentForm(values, { teams } = {}) {
    const schema = createIncidentSchema({ teamIds: teams?.map((t) => t.id) });
    const result = schema.safeParse(values);
    const errors = {};

    if (!result.success) {
        for (const issue of result.error.issues) {
            const field = String(issue.path[0] ?? "root");
            // Keep the first error per field (e.g. "required" before "too long")
            if (!errors[field]) errors[field] = { type: issue.code, message: issue.message };
        }
    }

    for (const [field, err] of Object.entries(crossFieldErrors(value))) {
        if (!errors[field]) errors[field] = err;
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, data: null, errors };
    }

    const data = { ...result.data };
    if (!data.mutualAid) data.mutualAidCounty = ""; // ignore a county left over from before unchecking
    return { success: true, data, errors: {} };
}

function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
