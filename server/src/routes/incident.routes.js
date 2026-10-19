import { Router } from 'express';
import { fetchActiveIncidents } from '../models/incident.model.js';

const router = Router();

router.get('/active', async (_req, res) => {
    const incidents = await fetchActiveIncidents();
    res.json(incidents);
});

export default router;