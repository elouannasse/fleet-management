const express = require("express");
const router = express.Router();
const {
  getAllCamions,
  getCamionById,
  getCamionsDisponibles,
  createCamion,
  updateCamion,
  deleteCamion,
} = require("../controllers/camionController");
const { protect } = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");


router.get("/", protect, getAllCamions);
router.get("/disponibles", protect, getCamionsDisponibles);
router.get("/:id", protect, getCamionById);


router.post("/", protect, adminOnly, createCamion);
router.put("/:id", protect, adminOnly, updateCamion);
router.delete("/:id", protect, adminOnly, deleteCamion);

module.exports = router;
