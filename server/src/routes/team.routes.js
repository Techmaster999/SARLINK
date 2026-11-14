import { Router } from 'express';
import { createTeam, listTeams, reassignVolunteer, saveVolunteerOrder } from '../controllers/teamController.js';
import { requireIst } from '../middleware/requireIst.js';
import { validateTeam } from '../middleware/validateTeam.js';
import { validateVolunteerReassignment } from '../middleware/validateVolunteerReassignment.js';
import { validateVolunteerOrder } from '../middleware/validateVolunteerOrder.js';

const router = Router();

router.get('/', listTeams);

router.post('/', requireIst, validateTeam, createTeam);

router.patch('/:teamId/volunteer-order', requireIst, validateVolunteerOrder, saveVolunteerOrder);

// Put a volunteer on this team (removes them from their current team, if any).
router.put('/:teamId/volunteers/:volunteerId', requireIst, validateVolunteerReassignment, reassignVolunteer);

export default router;
