const express = require("express");
const router = express.Router();
const {
  getAllAlerts,
  getAlertById,
  markAlertAsRead,
  markAlertAsTreated,
  deleteAlert,
  checkAndGenerateAlerts,
} = require("../controllers/maintenanceAlertController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");


router.get("/", protect, adminOnly, getAllAlerts);
router.get("/:id", protect, adminOnly, getAlertById);
router.post("/check", protect, adminOnly, checkAndGenerateAlerts);
router.patch("/:id/read", protect, adminOnly, markAlertAsRead);
router.patch("/:id/treat", protect, adminOnly, markAlertAsTreated);
router.delete("/:id", protect, adminOnly, deleteAlert);

module.exports = router;
