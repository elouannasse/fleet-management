const Joi = require("joi");

/**
 * Validation pour la création d'un utilisateur (admin seulement)
 */
exports.validateCreateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.min": "Le nom doit contenir au moins 3 caractères",
      "string.max": "Le nom ne peut pas dépasser 100 caractères",
      "any.required": "Le nom est obligatoire",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Email invalide",
      "any.required": "L'email est obligatoire",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Le mot de passe doit contenir au moins 6 caractères",
      "any.required": "Le mot de passe est obligatoire",
    }),
    role: Joi.string()
      .valid("admin", "chauffeur")
      .default("chauffeur")
      .messages({
        "any.only": "Le rôle doit être 'admin' ou 'chauffeur'",
      }),
    isActive: Joi.boolean().default(true),
    // Champs chauffeur optionnels
    telephone: Joi.string().allow("", null).messages({
      "string.base": "Le téléphone doit être une chaîne de caractères",
    }),
    numeroPermis: Joi.string().allow("", null).messages({
      "string.base": "Le numéro de permis doit être une chaîne de caractères",
    }),
    dateExpirationPermis: Joi.date().allow(null).messages({
      "date.base": "La date d'expiration du permis doit être une date valide",
    }),
    adresse: Joi.string().allow("", null).messages({
      "string.base": "L'adresse doit être une chaîne de caractères",
    }),
  });

  return schema.validate(data);
};

/**
 * Validation pour la modification d'un utilisateur
 */
exports.validateUpdateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).messages({
      "string.min": "Le nom doit contenir au moins 3 caractères",
      "string.max": "Le nom ne peut pas dépasser 100 caractères",
    }),
    email: Joi.string().email().messages({
      "string.email": "Email invalide",
    }),
    role: Joi.string().valid("admin", "chauffeur").messages({
      "any.only": "Le rôle doit être 'admin' ou 'chauffeur'",
    }),
    isActive: Joi.boolean(),
    // Champs chauffeur optionnels
    telephone: Joi.string().allow("", null).messages({
      "string.base": "Le téléphone doit être une chaîne de caractères",
    }),
    numeroPermis: Joi.string().allow("", null).messages({
      "string.base": "Le numéro de permis doit être une chaîne de caractères",
    }),
    dateExpirationPermis: Joi.date().allow(null).messages({
      "date.base": "La date d'expiration du permis doit être une date valide",
    }),
    adresse: Joi.string().allow("", null).messages({
      "string.base": "L'adresse doit être une chaîne de caractères",
    }),
  });

  return schema.validate(data);
};

/**
 * Validation pour le changement de mot de passe
 */
exports.validateUpdatePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required().messages({
      "any.required": "Le mot de passe actuel est obligatoire",
    }),
    newPassword: Joi.string().min(6).required().messages({
      "string.min":
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      "any.required": "Le nouveau mot de passe est obligatoire",
    }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Les mots de passe ne correspondent pas",
        "any.required": "La confirmation du mot de passe est obligatoire",
      }),
  });

  return schema.validate(data);
};
