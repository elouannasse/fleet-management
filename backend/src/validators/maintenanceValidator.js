const Joi = require("joi");

// Schéma de validation pour la création d'une maintenance
const createMaintenanceSchema = Joi.object({
  vehiculeType: Joi.string().valid("Camion", "Remorque").required().messages({
    "any.only": "Le type de véhicule doit être 'Camion' ou 'Remorque'",
    "any.required": "Le type de véhicule est obligatoire",
  }),
  vehicule: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "ID de véhicule invalide",
      "any.required": "Le véhicule est obligatoire",
    }),
  type: Joi.string()
    .valid("pneu", "vidange", "revision", "reparation")
    .required()
    .messages({
      "any.only": "Type de maintenance invalide",
      "any.required": "Le type de maintenance est obligatoire",
    }),
  description: Joi.string().required().messages({
    "string.empty": "La description est obligatoire",
    "any.required": "La description est obligatoire",
  }),
  statut: Joi.string()
    .valid("planifiée", "en cours", "terminée", "annulée")
    .optional(),
  priorite: Joi.string()
    .valid("basse", "normale", "haute", "urgente")
    .optional(),
  kilometrageActuel: Joi.number().positive().required().messages({
    "number.positive": "Le kilométrage doit être positif",
    "any.required": "Le kilométrage actuel est obligatoire",
  }),
  datePrevue: Joi.date().required().messages({
    "any.required": "La date prévue est obligatoire",
  }),
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional(),
  cout: Joi.number().min(0).optional(),
  pieces: Joi.array()
    .items(
      Joi.object({
        nom: Joi.string().required(),
        quantite: Joi.number().positive().required(),
        prixUnitaire: Joi.number().min(0).required(),
      })
    )
    .optional(),
  mainDoeuvre: Joi.number().min(0).optional(),
  technicien: Joi.string().optional().allow(""),
  garage: Joi.string().optional().allow(""),
  remarques: Joi.string().optional().allow(""),
});

// Schéma de validation pour la mise à jour d'une maintenance
const updateMaintenanceSchema = Joi.object({
  type: Joi.string()
    .valid("pneu", "vidange", "revision", "reparation")
    .optional(),
  description: Joi.string().optional(),
  statut: Joi.string()
    .valid("planifiée", "en cours", "terminée", "annulée")
    .optional(),
  priorite: Joi.string()
    .valid("basse", "normale", "haute", "urgente")
    .optional(),
  kilometrageActuel: Joi.number().positive().optional(),
  datePrevue: Joi.date().optional(),
  dateDebut: Joi.date().optional(),
  dateFin: Joi.date().optional(),
  cout: Joi.number().min(0).optional(),
  pieces: Joi.array()
    .items(
      Joi.object({
        nom: Joi.string().required(),
        quantite: Joi.number().positive().required(),
        prixUnitaire: Joi.number().min(0).required(),
      })
    )
    .optional(),
  mainDoeuvre: Joi.number().min(0).optional(),
  technicien: Joi.string().optional().allow(""),
  garage: Joi.string().optional().allow(""),
  remarques: Joi.string().optional().allow(""),
}).min(1);

// Fonction de validation pour la création
const validateCreateMaintenance = (data) => {
  return createMaintenanceSchema.validate(data, { abortEarly: false });
};

// Fonction de validation pour la mise à jour
const validateUpdateMaintenance = (data) => {
  return updateMaintenanceSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateMaintenance,
  validateUpdateMaintenance,
};
