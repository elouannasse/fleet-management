const User = require("../models/User");
const ResponseHandler = require("../utils/responseHandler");

// Obtenir tous les utilisateurs (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    ResponseHandler.success(res, {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir uniquement les chauffeurs actifs
exports.getChauffeurs = async (req, res, next) => {
  try {
    const chauffeurs = await User.find({
      role: "chauffeur",
      isActive: true,
    }).select("-password");

    ResponseHandler.success(res, { chauffeurs });
  } catch (error) {
    next(error);
  }
};

// Obtenir un utilisateur par ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return ResponseHandler.error(res, "Utilisateur non trouvé", 404);
    }

    ResponseHandler.success(res, { user });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return ResponseHandler.error(res, "Utilisateur non trouvé", 404);
    }

    // Vérifier l'email dupliqué
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ResponseHandler.error(res, "Cet email est déjà utilisé", 400);
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    ResponseHandler.success(
      res,
      { user: updatedUser },
      "Utilisateur modifié avec succès"
    );
  } catch (error) {
    next(error);
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return ResponseHandler.error(res, "Utilisateur non trouvé", 404);
    }

    await User.findByIdAndDelete(req.params.id);

    ResponseHandler.success(res, null, "Utilisateur supprimé avec succès");
  } catch (error) {
    next(error);
  }
};
