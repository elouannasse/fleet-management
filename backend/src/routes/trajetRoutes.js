const express = require("express");
const router = express.Router();
const {
  getAllTrajets,
  getTrajetById,
  getMesTrajets,
  createTrajet,
  updateTrajet,
  updateTrajetStatus,
  deleteTrajet,
  getTrajetStats,
  generateTrajetPDF,
} = require("../controllers/trajetController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize, adminOnly } = require("../middlewares/roleMiddleware");
const { ROLES } = require("../utils/constants");

router.use(protect);

router.get("/mes-trajets", authorize(ROLES.CHAUFFEUR), getMesTrajets);
router.get("/stats", adminOnly, getTrajetStats);

router.route("/").get(getAllTrajets).post(adminOnly, createTrajet);

router
  .route("/:id")
  .get(getTrajetById)
  .put(adminOnly, updateTrajet)
  .delete(adminOnly, deleteTrajet);

router.patch("/:id/status", updateTrajetStatus);

// Générer PDF du trajet
router.get("/:id/pdf", generateTrajetPDF);

module.exports = router;
