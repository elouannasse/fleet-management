const express = require("express");
const router = express.Router();
const {
  registerChauffeur,
  login,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerChauffeur);
router.post("/login", login);


router.get("/me", protect, getMe); 

module.exports = router;
