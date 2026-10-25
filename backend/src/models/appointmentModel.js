import pool from '../config/db.js';

export default async function createAppointment(
    customer_name,
    customer_phone,
    customer_email,
    service_id,
    appointment_date,
    barber_id
) {
    const result = await pool.query(
        `INSERT INTO appointments (
            customer_name,
            customer_phone,
            customer_email,
            service_id,
            appointment_date,
            barber_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            customer_name,
            customer_phone,
            customer_email,
            service_id,
            appointment_date,
            barber_id
        ]
    );

    return result.rows[0];
}


export async function getAllAppointments(barberId) {
    const result = await pool.query(
        `
        SELECT
            appointments.id,
            appointments.customer_name,
            appointments.customer_phone,
            appointments.customer_email,
            services.name AS service_name,
            appointments.appointment_date,
            appointments.status,
            appointments.created_at
        FROM appointments
        JOIN services
            ON appointments.service_id = services.id
        WHERE appointments.barber_id = $1
        ORDER BY appointments.appointment_date ASC
        `,
        [barberId]
    );

    return result.rows;
}


export async function getAppointmentById(id) {
    const result = await pool.query(
        `SELECT *
         FROM appointments
         WHERE appointments.id = $1`,
        [id]
    );

    return result.rows[0];
}


export async function deleteAppointment(id) {
    const result = await pool.query(
        `DELETE FROM appointments
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
}


export async function updateAppointmentStatus(id, status) {
    const result = await pool.query(
        `
        UPDATE appointments
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
    );

    return result.rows[0];
}


export async function getAppointmentsByDate(date, barberId) {
    const result = await pool.query(
        `
        SELECT
            appointments.id,
            appointments.customer_name,
            appointments.customer_phone,
            appointments.customer_email,
            services.name AS service_name,
            appointments.appointment_date,
            appointments.status
        FROM appointments
        JOIN services
            ON appointments.service_id = services.id
        WHERE DATE(appointments.appointment_date) = $1
        AND appointments.barber_id = $2
        ORDER BY appointments.appointment_date ASC
        `,
        [date, barberId]
    );

    return result.rows;
}


export async function checkAppointmentExists(
    appointment_date,
    barberId
) {
    const result = await pool.query(
        `
        SELECT id
        FROM appointments
        WHERE appointment_date = $1
        AND barber_id = $2
        AND status != 'cancelled'
        LIMIT 1
        `,
        [appointment_date, barberId]
    );

    return result.rows.length > 0;
}


export async function getAvailableHours(date, barberId) {
    const result = await pool.query(
        `
        SELECT appointment_date
        FROM appointments
        WHERE DATE(appointment_date) = $1
        AND barber_id = $2
        AND status != 'cancelled'
        ORDER BY appointment_date ASC
        `,
        [date, barberId]
    );

    const bookedHours = result.rows.map(row => {
        const appointmentDate = new Date(row.appointment_date);

        return appointmentDate.toISOString().slice(11, 16);
    });

    const hours = [];

    for (let hour = 10; hour < 18; hour++) {
        for (let minutes of [0, 30]) {

            const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            hours.push({
                time: time,
                available: !bookedHours.includes(time)
            });
        }
    }

    return hours;
}