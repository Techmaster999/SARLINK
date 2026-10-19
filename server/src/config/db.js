import 'dotenv/config';
import pg from 'pg';

export const pool = new pg.pool({ connectionString: process.env.DATABASE_URL });
