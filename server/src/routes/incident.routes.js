import { Router } from 'express';
import { fetchActiveIncidents } from '../models/incident.model.js';
import { listIncomingVolunteers } from '../controllers/volunteerController.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateIncidentId } from '../middleware/validateIncidentId.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const incidents = await fetchActiveIncidents({ search: q || undefined });
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

// Volunteers heading to this incident, soonest ETA first.
router.get(
  '/:incidentId/incoming-volunteers',
  requireRole('IST', 'Sheriff'),
  validateIncidentId,
  listIncomingVolunteers,
);

export default router;