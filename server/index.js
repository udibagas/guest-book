const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const guestRoutes = require("./routes/guests");
const visitRoutes = require("./routes/visits");
const purposeRoutes = require("./routes/purposes");
const hostRoutes = require("./routes/hosts");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/guests", guestRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/purposes", purposeRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
