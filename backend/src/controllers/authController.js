const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret, jwtExpire } = require("../config/env");

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpire });
};

exports.registerChauffeur = async (req, res) => {
  try {
    const { name, nom, email, password } = req.body;
    const userName = name || nom;

    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir nom, email et mot de passe",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      });
    }

    const user = await User.create({
      name: userName,
      email,
      password,
      role: "chauffeur",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Chauffeur enregistré avec succès",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Gérer les erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    // Gérer les erreurs de duplication (email déjà existant)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de l'inscription",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
    });
  }
};
