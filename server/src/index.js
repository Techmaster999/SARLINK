import 'dotenv/config';
import express from 'express';
import incidentRouter from './routes/incident.routes.js';

const app = express();
const port = Number(process.env.PORT || 8888);

app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/incidents', incidentRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});
