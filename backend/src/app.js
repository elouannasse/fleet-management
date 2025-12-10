const express = require("express");
const cors = require("cors");
const { frontendUrl } = require("./config/env");

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
app.use("/api/camions", require("./routes/camionRoutes"));
app.use("/api/remorques", require("./routes/remorqueRoutes"));
app.use("/api/pneus", require("./routes/pneuRoutes"));
app.use("/api/maintenances", require("./routes/maintenanceRoutes"));
app.use("/api/maintenance-rules", require("./routes/maintenanceRuleRoutes"));
app.use("/api/maintenance-alerts", require("./routes/maintenanceAlertRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur",
  });
});

module.exports = app;
