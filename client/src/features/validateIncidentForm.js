import { z } from "zod";
import { CA_COUNTIES } from "./incidentOptions"

export const COUNTY_VALUES = new Set(CA_COUNTIES.map((c) => c.value));

const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

const optionalText = (max, label) =>
    z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

export function createIncidentSchema({ teamIDs } = {}) {
    const validTeamIds = teamIds ? new Set(teamIds) : null;

    return z.object({
    incidentName: requiredText("Incident name is required.", 120, "Incident name"),

    caseID: requiredText("Case ID is required.", 40, "Case ID"),

    dateTime: z
        .string()
        .min(1, "Date and time are required.")
        .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date and time.")
        .refine((v) => Date.parse(v) <= Date.now() + FUTURE_TOLERANCE_MS, "Date and time can't be in the future."),

        location: requiredText("Location is required.", 200, "Location"),

        coordinator: requiredText("Coordinator is required.", 100, "Coordinator"),

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
        mutualAidCounty: z.string(),
    });
}


