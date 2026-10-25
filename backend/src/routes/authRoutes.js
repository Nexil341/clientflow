import express from "express";
import {
    createBarberUser,
    login
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/create", createBarberUser);
router.post("/auth/login", login);


router.get(
    "/auth/test",
    authMiddleware,
    (req, res) => {
        res.json({
            message: "Middleware działa",
            barber: req.barber
        });
    }
);

export default router;