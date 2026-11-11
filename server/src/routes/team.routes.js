import { Router } from 'express';
import { createTeam } from '../controllers/teamController.js';
import { requireIst } from '../middleware/requireIst.js';
import { validateTeam } from '../middleware/validateTeam.js';

const router = Router();

router.post('/', requireIst, validateTeam, createTeam);

export default router;
