// Static option lists. No React imports, so the server can reuse this file too.

// ── Demo teams (placeholder from the Figma prototype) ─────────────────────────
// Only read by useTeams(). Once teams live in Postgres, use this list as the
// seed data in server/db/seeds/ and delete it here.
export const DEMO_TEAMS = [
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
  { id: "atr-1", label: "ATR Team 1", category: "ATR", teamType: "Type 1" },
  { id: "atr-2", label: "ATR Team 2", category: "ATR", teamType: "Type 2" },
  { id: "atr-3", label: "ATR Team 3", category: "ATR", teamType: "Type 3" },
  // TRR – Technical Rope Rescue
  { id: "trr-1", label: "TRR Team 1", category: "TRR", teamType: "Type 1" },
  { id: "trr-2", label: "TRR Team 2", category: "TRR", teamType: "Type 2" },
  { id: "trr-3", label: "TRR Team 3", category: "TRR", teamType: "Type 3" },
  // OHV – Off Highway Vehicle
  { id: "ohv-1", label: "OHV Unit 1", category: "OHV", teamType: "Type 1" },
  { id: "ohv-2", label: "OHV Unit 2", category: "OHV", teamType: "Type 2" },
  { id: "ohv-3", label: "OHV Unit 3", category: "OHV", teamType: "Type 3" },
  // Swift Water
  { id: "sw-1", label: "Swift Water Team 1", category: "Swift Water", teamType: "Type 1" },
  { id: "sw-2", label: "Swift Water Team 2", category: "Swift Water", teamType: "Type 2" },
  { id: "sw-3", label: "Swift Water Team 3", category: "Swift Water", teamType: "Type 3" },
  // UAS – Drone / Unmanned Aircraft System
  { id: "uas-1", label: "UAS Operator 1", category: "UAS", teamType: "Type 1" },
  { id: "uas-2", label: "UAS Operator 2", category: "UAS", teamType: "Type 2" },
  { id: "uas-3", label: "UAS Operator 3", category: "UAS", teamType: "Type 3" },
  // IST – Incident Support Team
  { id: "ist-1", label: "IST 1", category: "IST", teamType: "Type 1" },
  { id: "ist-2", label: "IST 2", category: "IST", teamType: "Type 2" },
  { id: "ist-3", label: "IST 3", category: "IST", teamType: "Type 3" },
];

// ── California counties (Mutual Aid) ─────────────────────────────────────────
export const CA_COUNTIES = [
  "Alameda","Alpine","Amador","Butte","Calaveras","Colusa","Contra Costa",
  "Del Norte","El Dorado","Fresno","Glenn","Humboldt","Imperial","Inyo",
  "Kern","Kings","Lake","Lassen","Los Angeles","Madera","Marin","Mariposa",
  "Mendocino","Merced","Modoc","Mono","Monterey","Napa","Nevada","Orange",
  "Placer","Plumas","Riverside","Sacramento","San Benito","San Bernardino",
  "San Diego","San Francisco","San Joaquin","San Luis Obispo","San Mateo",
  "Santa Barbara","Santa Clara","Santa Cruz","Shasta","Sierra","Siskiyou",
  "Solano","Sonoma","Stanislaus","Sutter","Tehama","Trinity","Tulare",
  "Tuolumne","Ventura","Yolo","Yuba",
].map((c) => ({ value: c, label: `${c} County` }));