const express = require("express");
const router = express.Router();
const {
  getAllPneus,
  getPneuById,
  getPneusByVehicule,
  createPneu,
  updatePneu,
  updatePneuEtat,
  deletePneu,
} = require("../controllers/pneuController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");


router.get("/", protect, getAllPneus);
router.get("/vehicule/:vehiculeType/:vehiculeId", protect, getPneusByVehicule);
router.get("/:id", protect, getPneuById);


router.patch("/:id/etat", protect, updatePneuEtat);


router.post("/", protect, adminOnly, createPneu);
router.put("/:id", protect, adminOnly, updatePneu);
router.delete("/:id", protect, adminOnly, deletePneu);

module.exports = router;
