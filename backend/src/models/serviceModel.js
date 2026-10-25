import pool from '../config/db.js';

export default async function getAllServices() {
    const result = await pool.query("SELECT * FROM services");

    return result.rows;
}

export async function getServiceById(id) {
    const result = await pool.query(
        `SELECT *
         FROM services
         WHERE id = $1`,
        [id]
    );

    return result.rows[0];
}