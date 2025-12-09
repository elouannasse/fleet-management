const express = require("express");
const router = express.Router();
const {
  getAllRemorques,
  getRemorqueById,
  getRemorquesDisponibles,
  createRemorque,
  updateRemorque,
  deleteRemorque,
} = require("../controllers/remorqueController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");


router.get("/", protect, getAllRemorques);
router.get("/disponibles", protect, getRemorquesDisponibles);
router.get("/:id", protect, getRemorqueById);


router.post("/", protect, adminOnly, createRemorque);
router.put("/:id", protect, adminOnly, updateRemorque);
router.delete("/:id", protect, adminOnly, deleteRemorque);

module.exports = router;
