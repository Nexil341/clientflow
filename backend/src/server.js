import express from "express";
import cors from "cors";
import pool from "./config/db.js";

import serviceRoutes from "./routes/serviceRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', serviceRoutes);

app.use('/api', appointmentRoutes)

app.use("/api", authRoutes);




app.get("/", (req, res) => {
  res.json({
    message: "API działa!"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Połączenie z bazą działa!",
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Błąd połączenia z bazą"
    });
  }
});

app.listen(5000, () => {
  console.log("Server działa na http://localhost:5000");
});