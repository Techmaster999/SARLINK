import { Router } from 'express';
import {
    assignCheckInTeam,
    getCheckIn,
    saveCheckInResources,
    submitCheckIn,
} from '../controllers/checkInController.js';
import { requireIst } from '../middleware/requireIst.js';
import { validateCheckInTeam } from '../middleware/validateCheckInTeam.js';
import { validateCheckInResources } from '../middleware/validateCheckInResources.js';

const router = Router();

// Retrieve a check-in record by ID (includes volunteerId, incidentId, and associated resources).
router.get('/:checkInId', getCheckIn);

// Save the volunteer's selected resources (replaces any saved before). Body: { "resources": ["vehicle", "radio"] }
router.put('/:checkInId/resources', validateCheckInResources, saveCheckInResources);

// Save the selected team on this check-in. Body: { "teamId": 3 }
router.put('/:checkInId/team', requireIst, validateCheckInTeam, assignCheckInTeam);

// Volunteer submits their check-in; it is read-only afterwards.
// TODO (auth ticket): only the volunteer who owns this check-in should be able to call this.
router.post('/:checkInId/submit', submitCheckIn);

export default router;
