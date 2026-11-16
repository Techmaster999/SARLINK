import { io } from "socket.io-client";

// Event names shared with the server (server/src/realtime/socket.js).
export const EVENTS = Object.freeze({
  TEAM_CREATED: "team:created",
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
 * Calls `handler` whenever a new team is created on the incident board.
 * Payload: { id, incidentId, name, leaderId, color, createdAt }.
 *
 * @returns {() => void} Call it to stop listening (e.g. in a React effect cleanup).
 */
export function onTeamCreated(handler) {
  const s = getSocket();
  s.on(EVENTS.TEAM_CREATED, handler);

  let channel = null;
  const onChannelMessage = (event) => {
    if (event?.data?.type === EVENTS.TEAM_CREATED && event.data.payload) {
      handler(event.data.payload);
    }
  };
  if (typeof BroadcastChannel !== "undefined") {
    try {
      channel = new BroadcastChannel("sarlink:teams");
      channel.addEventListener("message", onChannelMessage);
    } catch {
      channel = null;
    }
  }

  return () => {
    s.off(EVENTS.TEAM_CREATED, handler);
    if (channel) {
      channel.removeEventListener("message", onChannelMessage);
      channel.close();
    }
  };
}

export function emitTeamCreated(team) {
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel("sarlink:teams");
      channel.postMessage({ type: EVENTS.TEAM_CREATED, payload: team });
      channel.close();
    } catch {
      // Ignore BroadcastChannel errors in unsupported environments
    }
  }
}

/**
 * Calls `handler` whenever any user moves a volunteer to a different team.
 * Payload: { volunteerId, teamId, previousTeamId, incidentId, assignedAt, status }.
 * Dashboards should remove the volunteer from `previousTeamId` and add them to `teamId`.
 *
 * @returns {() => void} Call it to stop listening (e.g. in a React effect cleanup).
 */
export function onVolunteerReassigned(handler) {
  const s = getSocket();
  s.on(EVENTS.VOLUNTEER_REASSIGNED, handler);
  return () => s.off(EVENTS.VOLUNTEER_REASSIGNED, handler);
}
