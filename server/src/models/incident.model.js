import { pool } from '../config/db.js';

export async function fetchActiveIncidents() {
    const { rows } = await pool.query(
        "SELECT * FROM incidents WHERE status = 'active' ORDER BY started_at DESC", 
    );
    return rows;
}