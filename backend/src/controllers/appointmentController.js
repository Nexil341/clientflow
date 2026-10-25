import createAppointment, {
    getAllAppointments,
    getAppointmentById,
    deleteAppointment,
    updateAppointmentStatus,
    getAppointmentsByDate,
    checkAppointmentExists,
    getAvailableHours
} from "../models/appointmentModel.js";

import { getServiceById } from "../models/serviceModel.js";


export default async function postAppointment(req, res) {
    const {
        customer_name,
        customer_phone,
        customer_email,
        service_id,
        appointment_date,
        barber_id
    } = req.body;

    if (
        !customer_name ||
        !customer_phone ||
        !service_id ||
        !appointment_date ||
        !barber_id
    ) {
        return res.status(400).json({
            message: "Błędne dane"
        });
    }

    const service = await getServiceById(service_id);

    if (!service) {
        return res.status(404).json({
            message: "Usługa nie istnieje"
        });
    }

    const appointmentExists = await checkAppointmentExists(
        appointment_date,
        barber_id
    );

    if (appointmentExists) {
        return res.status(409).json({
            message: "Ten termin jest już zajęty"
        });
    }

    const appointment = await createAppointment(
        customer_name,
        customer_phone,
        customer_email,
        service_id,
        appointment_date,
        barber_id
    );

    res.status(201).json(appointment);
}


export async function getAppointment(req, res) {
    const barberId = req.barber.barber_id;

    const appointments = await getAllAppointments(barberId);

    res.json(appointments);
}


export async function getAppointmentByIdController(req, res) {
    const id = req.params.id;
    const barberId = req.barber.barber_id;

    const appointment = await getAppointmentById(id);

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment nie istnieje"
        });
    }

    if (appointment.barber_id !== barberId) {
        return res.status(403).json({
            message: "Brak dostępu do tej wizyty"
        });
    }

    res.json(appointment);
}


export async function deleteAppointmentController(req, res) {
    const id = req.params.id;
    const barberId = req.barber.barber_id;

    const appointment = await getAppointmentById(id);

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment nie istnieje"
        });
    }

    if (appointment.barber_id !== barberId) {
        return res.status(403).json({
            message: "Brak dostępu do tej wizyty"
        });
    }

    const deletedAppointment = await deleteAppointment(id);

    res.json(deletedAppointment);
}


export async function updateAppointmentStatusController(req, res) {
    const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled"
    ];

    const id = req.params.id;
    const { status } = req.body;
    const barberId = req.barber.barber_id;

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Nieprawidłowy status"
        });
    }

    const appointment = await getAppointmentById(id);

    if (!appointment) {
        return res.status(404).json({
            message: "Appointment nie istnieje"
        });
    }

    if (appointment.barber_id !== barberId) {
        return res.status(403).json({
            message: "Brak dostępu do tej wizyty"
        });
    }

    const updatedAppointment = await updateAppointmentStatus(
        id,
        status
    );

    res.json(updatedAppointment);
}


export async function getAppointmentsByDateController(req, res) {
    const { date } = req.params;
    const { barber_id } = req.query;

    if (!barber_id) {
        return res.status(400).json({
            message: "Brak barber_id"
        });
    }

    const appointments = await getAppointmentsByDate(
        date,
        barber_id
    );

    res.json(appointments);
}

export async function getAvailableHoursController(req, res) {
    const { date, barber_id } = req.query;

    if (!date || !barber_id) {
        return res.status(400).json({
            message: "Brak daty lub barber_id"
        });
    }

    const availableHours = await getAvailableHours(
        date,
        barber_id
    );

    res.json(availableHours);
}