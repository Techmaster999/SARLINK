import { Server } from 'socket.io';

// Event names shared with the client (client/app/src/api/realtime.js).
export const EVENTS = Object.freeze({
  TEAM_CREATED: 'team:created',
  VOLUNTEER_REASSIGNED: 'volunteer:reassigned',
});

let io = null;

/** Attaches Socket.IO to the HTTP server. Call once at startup (see src/index.js). */
export function initRealtime(httpServer) {
  io = new Server(httpServer);
  // TODO (auth ticket): once express-session is mounted on the API, share it with
  // Socket.IO (io.engine.use(sessionMiddleware)) and reject sockets with no signed-in user.
  // TODO (dashboard): have clients join an `incident:<id>` room and emit only to that room.
  return io;
}

/** Sends an event to every open dashboard. Does nothing if Socket.IO isn't started (e.g. in tests). */
export function broadcast(event, payload) {
  io?.emit(event, payload);
}
