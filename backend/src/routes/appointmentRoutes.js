import express from "express";

import postAppointment, {
    getAppointment,
    getAppointmentByIdController,
    deleteAppointmentController,
    updateAppointmentStatusController,
    getAppointmentsByDateController,
    getAvailableHoursController
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// PUBLIC — klient

router.post(
    "/appointments",
    postAppointment
);


// BARBER — wymagany JWT


router.get(
    "/appointments",
    authMiddleware,
    getAppointment
);

router.get(
    "/appointments/date/:date",
    getAppointmentsByDateController
);

router.get(
    "/appointments/available",
    authMiddleware,
    getAvailableHoursController
);

router.get(
    "/appointments/:id",
    authMiddleware,
    getAppointmentByIdController
);

router.delete(
    "/appointments/:id",
    authMiddleware,
    deleteAppointmentController
);

router.patch(
    "/appointments/:id/status",
    authMiddleware,
    updateAppointmentStatusController
);


export default router;