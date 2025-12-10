const express = require("express");
const router = express.Router();
const {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule,
  toggleRuleStatus,
} = require("../controllers/maintenanceRuleController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

router.get("/", protect, adminOnly, getAllRules);
router.get("/:id", protect, adminOnly, getRuleById);
router.post("/", protect, adminOnly, createRule);
router.put("/:id", protect, adminOnly, updateRule);
router.patch("/:id/toggle", protect, adminOnly, toggleRuleStatus);
router.delete("/:id", protect, adminOnly, deleteRule);

module.exports = router;
