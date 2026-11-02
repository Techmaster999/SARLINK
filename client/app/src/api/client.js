// Shared axios instance for talking to the Express server.
// If you already have one in api/, keep yours and import it in incidents.js instead.
import axios from "axios";

export const api = axios.create({
  // "/api" works with the Vite dev proxy (see vite.config.js); set VITE_API_URL in
  // client/.env to point somewhere else, e.g. VITE_API_URL=http://localhost:5000/api
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});