import { Router } from 'express';
import { fetchActiveIncidents } from '../models/incident.model.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const incidents = await fetchActiveIncidents();
    res.json(incidents);
  } catch (error) {
    next(error);
  }
});

export default router;