const Joi = require("joi");

// Schéma de validation pour la création d'une règle de maintenance
const createRuleSchema = Joi.object({
  nom: Joi.string().required().messages({
    "string.empty": "Le nom est obligatoire",
    "any.required": "Le nom est obligatoire",
  }),
  type: Joi.string()
    .valid("pneu", "vidange", "revision", "reparation")
    .required()
    .messages({
      "any.only": "Type de maintenance invalide",
      "any.required": "Le type de maintenance est obligatoire",
    }),
  typeAlerte: Joi.string()
    .valid("kilometrage", "temporel", "mixte")
    .required()
    .messages({
      "any.only": "Type d'alerte invalide",
      "any.required": "Le type d'alerte est obligatoire",
    }),
  description: Joi.string().optional().allow(""),
  intervalleKm: Joi.number().min(0).default(0).messages({
    "number.min": "L'intervalle kilométrique doit être positif",
  }),
  intervalleJours: Joi.number().min(0).default(0).messages({
    "number.min": "L'intervalle temporel doit être positif",
  }),
  seuilAlerteKm: Joi.number().min(0).default(1000).messages({
    "number.min": "Le seuil d'alerte kilométrique doit être positif",
  }),
  seuilAlerteJours: Joi.number().min(0).default(7).messages({
    "number.min": "Le seuil d'alerte temporel doit être positif",
  }),
  vehiculeTypes: Joi.array()
    .items(Joi.string().valid("Camion", "Remorque"))
    .default(["Camion", "Remorque"])
    .messages({
      "array.includes":
        "Les types de véhicules doivent être 'Camion' ou 'Remorque'",
    }),
  actif: Joi.boolean().default(true),
}).custom((value, helpers) => {
  // Validation personnalisée : au moins un intervalle doit être défini
  if (!value.intervalleKm && !value.intervalleJours) {
    return helpers.error("any.custom", {
      message:
        "Au moins un intervalle (kilométrique ou temporel) doit être défini",
    });
  }
  return value;
});

// Schéma de validation pour la mise à jour d'une règle
const updateRuleSchema = Joi.object({
  nom: Joi.string().optional(),
  type: Joi.string()
    .valid("pneu", "vidange", "revision", "reparation")
    .optional(),
  typeAlerte: Joi.string().valid("kilometrage", "temporel", "mixte").optional(),
  description: Joi.string().optional().allow(""),
  intervalleKm: Joi.number().min(0).optional(),
  intervalleJours: Joi.number().min(0).optional(),
  seuilAlerteKm: Joi.number().min(0).optional(),
  seuilAlerteJours: Joi.number().min(0).optional(),
  vehiculeTypes: Joi.array()
    .items(Joi.string().valid("Camion", "Remorque"))
    .optional(),
  actif: Joi.boolean().optional(),
}).min(1);

// Fonction de validation pour la création
const validateCreateRule = (data) => {
  return createRuleSchema.validate(data, { abortEarly: false });
};

// Fonction de validation pour la mise à jour
const validateUpdateRule = (data) => {
  return updateRuleSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateRule,
  validateUpdateRule,
};
