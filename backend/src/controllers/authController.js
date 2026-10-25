import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

import { getBarberByUsername } from "../models/barberUserModel.js";

export async function login(req, res) {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Podaj login i hasło"
        });
    }

    const barber = await getBarberByUsername(username);

    if (!barber) {
        return res.status(401).json({
            message: "Nieprawidłowy login lub hasło"
        });
    }

    const passwordCorrect = await bcrypt.compare(
        password,
        barber.password_hash
    );

    if (!passwordCorrect) {
        return res.status(401).json({
            message: "Nieprawidłowy login lub hasło"
        });
    }

const token = jwt.sign(
    {
        id: barber.id,
        username: barber.username,
        barber_id: barber.barber_id
    },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );

    res.json({
        message: "Zalogowano",
        token
    });
}


export async function createBarberUser(req, res) {
    const { username, password, barber_id } = req.body;

    if (!username || !password || !barber_id) {
        return res.status(400).json({
            message: "Podaj username, password i barber_id"
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `
        INSERT INTO barber_users (username, password_hash, barber_id)
        VALUES ($1, $2, $3)
        RETURNING id, username, barber_id
        `,
        [username, passwordHash, barber_id]
    );

    res.status(201).json(result.rows[0]);
}