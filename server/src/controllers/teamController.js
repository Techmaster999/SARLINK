import {
    createTeam as createTeamService,
    listTeamsByIncident,
    reassignVolunteerToTeam,
    saveTeamVolunteerOrder,
} from "../services/teamService.js";

export async function listTeams(req, res, next) {
    try {
        const incidentId = Number(req.query.incidentId || req.params.incidentId || 1);
        const teams = await listTeamsByIncident(incidentId, { db: req.app.locals.db });
        res.status(200).json(teams);
    } catch (err) {
        next(err);
    }
}

export async function createTeam(req, res, next) {
    try {
        const { name, leaderId, color, incidentId } = req.body;
        const team = await createTeamService(name, leaderId, color, incidentId, { db: req.app.locals.db });
        res.status(201).location(`/api/teams/${team.id}`).json(team);
    } catch (err) {
        next(err);
    }
}

export async function reassignVolunteer(req, res, next) {
    try {
        const { volunteerId, teamId } = res.locals.reassignment; // set by validateVolunteerReassignment
        const membership = await reassignVolunteerToTeam(volunteerId, teamId, { db: req.app.locals.db });
        res.status(200).json(membership);
    } catch (err) {
        next(err);
    }
}

export async function saveVolunteerOrder(req, res, next) {
    try {
        const { teamId, orderedVolunteerIds } = res.locals.volunteerOrder;
        const result = await saveTeamVolunteerOrder(teamId, orderedVolunteerIds, {
            db: req.app.locals.db,
        });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
