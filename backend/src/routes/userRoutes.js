const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// Routes pour les utilisateurs (toutes protégées, admin only sauf getChauffeurs)
router.get("/", protect, adminOnly, userController.getAllUsers);
router.get("/chauffeurs", protect, userController.getChauffeurs);
router.get("/:id", protect, adminOnly, userController.getUserById);
router.put("/:id", protect, adminOnly, userController.updateUser);
router.delete("/:id", protect, adminOnly, userController.deleteUser);

module.exports = router;
