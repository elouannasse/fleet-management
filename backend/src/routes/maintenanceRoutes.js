const express = require("express");
const router = express.Router();
const {
  getAllMaintenances,
  getMaintenanceById,
  getMaintenancesByVehicule,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
} = require("../controllers/maintenanceController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");


router.get("/", protect, adminOnly, getAllMaintenances);
router.get("/stats", protect, adminOnly, getMaintenanceStats);
router.get(
  "/vehicule/:vehiculeType/:vehiculeId",
  protect,
  adminOnly,
  getMaintenancesByVehicule
);
router.get("/:id", protect, adminOnly, getMaintenanceById);
router.post("/", protect, adminOnly, createMaintenance);
router.put("/:id", protect, adminOnly, updateMaintenance);
router.delete("/:id", protect, adminOnly, deleteMaintenance);

module.exports = router;
