/* Placeholder board data until the Dashboard is connected to the API.
 * Shapes follow the Figma (ics-data):
 *   Member            { id, name, role, status: "assigned" | "standby", quals?: ["emt" | "fa-aed" | "wfa"] }
 *   Team              { id, number, leader, accent, tint, members: Member[] }
 *   Command post      { roster: Member[], ist: Member[], standby: Member[] }
 *   IncomingVolunteer { id, name, organization, role, status: "en-route" | "staging" | "delayed", eta, etaMinutes }
 */
import { TEAM_PALETTE } from "./CreateTeamModal";

const member = (id, name, role, status, quals = []) => ({ id, name, role, status, quals });

const color = (i) => TEAM_PALETTE[i % TEAM_PALETTE.length];

export const SAMPLE_INCIDENT_COMMANDER = "Chief D. Martinez";

export const SAMPLE_TEAMS = [
  {
    id: "team-101",
    number: "101",
    leader: "Handler Dana Chen",
    ...color(0),
    members: [
      member("a1-1", "Handler Dana Chen", "K9 Handler", "assigned", ["wfa"]),
      member("a2-1", "SAR. Jorge Santos", "Ground Searcher 1", "assigned"),
      member("a3-1", "SAR. Owen Park", "Ground Searcher 1", "assigned", ["fa-aed"]),
    ],
  },
  {
    id: "team-102",
    number: "102",
    leader: "Pilot H. Nakamura",
    ...color(1),
    members: [
      member("b1-1", "Pilot H. Nakamura", "Helicopter Pilot", "assigned"),
      member("b2-1", "Tech. Fatima Al-Rashid", "USAR — Drone Lead", "assigned"),
      member("b3-1", "Spec. Sophie Laurent", "Technical Rope Rescue", "assigned", ["emt"]),
    ],
  },
].map(({ name, ...team }) => team); // drop the palette's colour name

export const SAMPLE_COMMAND_POST = {
  roster: [member("c1-1", "Coord. Diana Ford", "IST — Base Camp Coord.", "standby")],
  ist: [],
  standby: [
    member("cp-sb-1", "Log. Ian McAllister", "Logistics Coordinator", "standby"),
    member("cp-sb-2", "SAR. Kyle Brandt", "Hasty Team Lead", "standby", ["wfa"]),
  ],
};

export const SAMPLE_INCOMING_VOLUNTEERS = [
  { id: "vol-1", name: "Handler Lisa Grant", organization: "Mountain K9 Unit", role: "K9 Handler", status: "en-route", eta: "15 min", etaMinutes: 15 },
  { id: "vol-2", name: "SAR. Marcus Greene", organization: "County SAR", role: "Ground Searcher 1", status: "en-route", eta: "25 min", etaMinutes: 25 },
  { id: "vol-3", name: "PM. Diane Okafor", organization: "Valley EMS", role: "Paramedic / Field Medic", status: "delayed", eta: "45 min", etaMinutes: 45 },
  { id: "vol-4", name: "Spec. Joel Whitmore", organization: "Alpine Rescue Team", role: "Technical Rope Rescue", status: "staging", eta: "", etaMinutes: 0 },
  { id: "vol-5", name: "Tech. Amy Chen", organization: "State USAR", role: "USAR — Drone Operator", status: "en-route", eta: "35 min", etaMinutes: 35 },
];
