import { io } from "socket.io-client";

// Event names shared with the server (server/src/realtime/socket.js).
export const EVENTS = Object.freeze({
  VOLUNTEER_REASSIGNED: "volunteer:reassigned",
});

let socket = null;

// One shared connection for the whole app, opened the first time someone subscribes.
// Same origin by default (proxied to the API in dev); set VITE_SOCKET_URL to override.
function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? undefined, { withCredentials: true });
  }
  return socket;
}

/**
 * Calls `handler` whenever any user moves a volunteer to a different team.
 * Payload: { volunteerId, teamId, previousTeamId, incidentId, assignedAt }.
 * Dashboards should remove the volunteer from `previousTeamId` and add them to `teamId`.
 *
 * @returns {() => void} Call it to stop listening (e.g. in a React effect cleanup).
 */
export function onVolunteerReassigned(handler) {
  const s = getSocket();
  s.on(EVENTS.VOLUNTEER_REASSIGNED, handler);
  return () => s.off(EVENTS.VOLUNTEER_REASSIGNED, handler);
}
