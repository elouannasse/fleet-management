const express = require("express");
const cors = require("cors");
const { frontendUrl } = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");

require("./models");

const app = express();

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Fleet Management ",
    version: "1.0.0",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/camions", require("./routes/camionRoutes"));
app.use("/api/remorques", require("./routes/remorqueRoutes"));
app.use("/api/pneus", require("./routes/pneuRoutes"));
app.use("/api/trajets", require("./routes/trajetRoutes"));
app.use("/api/maintenances", require("./routes/maintenanceRoutes"));
app.use("/api/maintenance-rules", require("./routes/maintenanceRuleRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Error handler middleware (doit être après les routes)
app.use(errorHandler);

module.exports = app;
