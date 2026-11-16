/* Board state for the Dashboard's drag and drop (Figma: Board / moveMember / deployVolunteer).
 * Everything a drag can change lives in one object:
 *   { teams: Team[], commandPost: { roster, ist, standby }, incoming: IncomingVolunteer[] }
 * A "container" is a team id or one of the CP_IDS. Status follows where a person is:
 * on a team = "assigned", anywhere at the command post = "standby". */

export const CP_IDS = Object.freeze({
  roster: "cp:roster",
  ist: "cp:ist",
  standby: "cp:standby",
});

const cpGroupOf = (containerId, board) => {
  const fixedGroup = Object.keys(CP_IDS).find((group) => CP_IDS[group] === containerId);
  if (fixedGroup) return fixedGroup;
  const commandPostId = board?.commandPost?.teamId ?? board?.commandPost?.id;
  return commandPostId != null && String(commandPostId) === String(containerId)
    ? "standby"
    : null;
};

export const statusFor = (containerId, board) =>
  cpGroupOf(containerId, board) ? "standby" : "assigned";

const withStatus = (member, status) => (member.status === status ? member : { ...member, status });

export function createBoard({ teams = [], commandPost, incoming = [] } = {}) {
  const asArray = (value) => (Array.isArray(value) ? value : []);

  return {
    teams: asArray(teams).filter((team) => team && typeof team === "object"),
    commandPost: {
      id: commandPost?.id,
      teamId: commandPost?.teamId,
      roster: asArray(commandPost?.roster),
      ist: asArray(commandPost?.ist),
      standby: asArray(commandPost?.standby),
    },
    incoming: asArray(incoming),
  };
}

function hasContainer(board, containerId) {
  return cpGroupOf(containerId, board) !== null || board.teams.some((t) => t.id === containerId);
}

function membersOf(board, containerId) {
  const group = cpGroupOf(containerId, board);
  if (group) return board.commandPost[group];
  return board.teams.find((t) => t.id === containerId)?.members ?? [];
}

function mapMembers(board, containerId, fn) {
  const group = cpGroupOf(containerId, board);
  if (group) {
    return { ...board, commandPost: { ...board.commandPost, [group]: fn(board.commandPost[group]) } };
  }
  return {
    ...board,
    teams: board.teams.map((team) =>
      team.id === containerId ? { ...team, members: fn(team.members ?? []) } : team,
    ),
  };
}

/** Moves a member between any two containers (teams, CP roster, IST, CP standby). */
export function moveMember(board, memberId, fromId, toId) {
  if (fromId === toId || !hasContainer(board, toId)) return board;
  const member = membersOf(board, fromId).find((m) => m.id === memberId);
  if (!member) return board;
  const removed = mapMembers(board, fromId, (ms) => ms.filter((m) => m.id !== memberId));
  return mapMembers(removed, toId, (ms) => [...ms, withStatus(member, statusFor(toId, removed))]);
}

/** Takes an incoming volunteer off the inbound list and puts them in a container. */
export function deployVolunteer(board, volunteerId, toId) {
  const vol = board.incoming.find((v) => v.id === volunteerId);
  if (!vol || !hasContainer(board, toId)) return board;
  const member = {
    id: `deployed-${vol.id}`,
    name: vol.name,
    role: vol.role,
    status: statusFor(toId, board),
    quals: [],
  };
  const remaining = { ...board, incoming: board.incoming.filter((v) => v.id !== volunteerId) };
  return mapMembers(remaining, toId, (ms) => [...ms, member]);
}

/** Applies a finished drag. `item` is the draggable's data: { kind: "member" | "volunteer", … }. */
export function applyDrop(board, item, toId) {
  if (!item || toId == null) return board;
  if (item.kind === "member") return moveMember(board, item.memberId, item.fromId, toId);
  if (item.kind === "volunteer") return deployVolunteer(board, item.volunteerId, toId);
  return board;
}
