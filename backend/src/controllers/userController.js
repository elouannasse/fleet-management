const User = require("../models/User");
const ResponseHandler = require("../utils/responseHandler");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../validators/userValidator");

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

// Créer un nouvel utilisateur (admin seulement)
exports.createUser = async (req, res, next) => {
  try {
    // Validation des données
    const { error, value } = validateCreateUser(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const {
      name,
      email,
      password,
      role,
      isActive,
      telephone,
      numeroPermis,
      dateExpirationPermis,
      adresse,
    } = value;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.badRequest(res, "Cet email est déjà utilisé");
    }

    // Créer l'utilisateur (le password sera hashé automatiquement par le pre-save hook)
    const userData = {
      name,
      email,
      password,
      role: role || "chauffeur",
      isActive: isActive !== undefined ? isActive : true,
    };

    // Ajouter les champs chauffeur s'ils sont fournis
    if (telephone !== undefined) userData.telephone = telephone;
    if (numeroPermis !== undefined) userData.numeroPermis = numeroPermis;
    if (dateExpirationPermis !== undefined)
      userData.dateExpirationPermis = dateExpirationPermis;
    if (adresse !== undefined) userData.adresse = adresse;

    const user = await User.create(userData);

    // Récupérer l'utilisateur sans le password
    const userResponse = await User.findById(user._id).select("-password");

    ResponseHandler.success(
      res,
      { user: userResponse },
      "Utilisateur créé avec succès",
      201
    );
  } catch (error) {
    // Gérer les erreurs de duplication MongoDB
    if (error.code === 11000) {
      return ResponseHandler.badRequest(res, "Cet email est déjà utilisé");
    }
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
    // Validation des données
    const { error, value } = validateUpdateUser(req.body);
    if (error) {
      return ResponseHandler.badRequest(
        res,
        "Erreur de validation",
        error.details.map((d) => d.message)
      );
    }

    const {
      name,
      email,
      role,
      isActive,
      telephone,
      numeroPermis,
      dateExpirationPermis,
      adresse,
    } = value;

    const user = await User.findById(req.params.id);

    if (!user) {
      return ResponseHandler.error(res, "Utilisateur non trouvé", 404);
    }

    // Protection anti-auto-destruction : empêcher un admin de modifier son propre rôle
    if (
      req.params.id === req.user.id &&
      role &&
      role !== req.user.role &&
      req.user.role === "admin"
    ) {
      return ResponseHandler.forbidden(
        res,
        "Vous ne pouvez pas modifier votre propre rôle"
      );
    }

    // Protection anti-auto-destruction : empêcher un admin de se désactiver lui-même
    if (req.params.id === req.user.id && isActive === false) {
      return ResponseHandler.forbidden(
        res,
        "Vous ne pouvez pas désactiver votre propre compte"
      );
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

    // Mettre à jour les champs chauffeur (permettre les valeurs vides/null)
    if (telephone !== undefined) user.telephone = telephone;
    if (numeroPermis !== undefined) user.numeroPermis = numeroPermis;
    if (dateExpirationPermis !== undefined)
      user.dateExpirationPermis = dateExpirationPermis;
    if (adresse !== undefined) user.adresse = adresse;

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
    // Protection anti-auto-destruction : empêcher un admin de se supprimer lui-même
    if (req.params.id === req.user.id) {
      return ResponseHandler.forbidden(
        res,
        "Vous ne pouvez pas supprimer votre propre compte"
      );
    }

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
