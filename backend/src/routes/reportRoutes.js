const express = require("express");
const router = express.Router();
const {
  getConsumptionReport,
  getKilometrageReport,
  getMaintenanceReport,
  getDashboardOverview,
  getVehiculeDetailsReport,
} = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

// All routes are admin only
router.get("/consumption", protect, adminOnly, getConsumptionReport);
router.get("/kilometrage", protect, adminOnly, getKilometrageReport);
router.get("/maintenance", protect, adminOnly, getMaintenanceReport);
router.get("/dashboard", protect, adminOnly, getDashboardOverview);
router.get(
  "/vehicule/:vehiculeType/:vehiculeId",
  protect,
  adminOnly,
  getVehiculeDetailsReport
);

module.exports = router;
