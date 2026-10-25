import pool from "../config/db.js";

export async function getBarberByUsername(username) {
    const result = await pool.query(
        `
        SELECT *
        FROM barber_users
        WHERE username = $1
        `,
        [username]
    );

    return result.rows[0];
}