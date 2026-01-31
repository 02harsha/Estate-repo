import "dotenv/config";
import express from "express";
import cors from "cors";

import userRoutes from "./routes/UserRoutes.js";
import pointsRoutes from "./routes/PointsRoutes.js";
import adminRoutes from "./routes/AdminRoutes.js";
import "./config/connection.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/admin", adminRoutes);

// Server Start
app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
