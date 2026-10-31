import { Router } from 'express';
import { fetchActiveIncidents } from '../models/incident.model.js';

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

export default router;