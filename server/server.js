
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const bugRoutes = require("./routes/bugRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityRoutes = require("./routes/activityRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BugHunter API is running",
  });
});

// Bug routes
app.use("/api/bugs", bugRoutes);

// User routes
app.use("/api/users", userRoutes);

// Project routes
app.use("/api/projects", projectRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);

// Comment routes
app.use("/api", commentRoutes);

// Activity routes
app.use("/api", activityRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`BugHunter backend running on port ${PORT}`);
  });
};

startServer();

