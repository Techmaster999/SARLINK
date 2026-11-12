import 'dotenv/config';
import express from 'express';
import incidentRouter from './routes/incident.routes.js';
import teamRouter from './routes/team.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = Number(process.env.PORT || 8888);

app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/incidents', incidentRouter);
app.use('/api/teams', teamRouter);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});
