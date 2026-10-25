import { createIncident as createIncidentService } from "../services/incidentService.js";

export async function createIncident(req, res, next) {
    try {
        const incident = await createIncidentService(req.body, { db: req.app.locals.db });
        res.status(201).location(`/api/incidents/${incident.id}`).json(incident);
    } catch (err) {
        next(err);
    }
}