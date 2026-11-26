import { Router } from 'express';
import { fetchActiveIncidents } from '../models/incident.model.js';
import {
  createCheckIn,
  listIncomingVolunteers,
  listTeamAssignments,
} from '../controllers/volunteerController.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateIncidentId } from '../middleware/validateIncidentId.js';
import { validateCheckIn } from '../middleware/validateCheckIn.js';

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

// Team assignments (roles) a volunteer can check in with for this incident.
// Public: volunteers checking in aren't signed-in admins. Returns only the role list.
router.get('/:incidentId/team-assignments', validateIncidentId, listTeamAssignments);

// Save a volunteer's check-in to this incident. Public for the same reason;
// returns only the check-in that was just saved.
router.post('/:incidentId/check-ins', validateIncidentId, validateCheckIn, createCheckIn);

export default router;