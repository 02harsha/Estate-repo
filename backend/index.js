const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/UserRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Server Start
app.listen(3000, () => {
  console.log("✅ API running on http://localhost:3000");
});
