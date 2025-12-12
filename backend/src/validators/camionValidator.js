const Joi = require("joi");

const createCamionSchema = Joi.object({
  matricule: Joi.string().required().trim().uppercase().messages({
    "string.empty": "La matricule est obligatoire",
    "any.required": "La matricule est obligatoire",
  }),
  marque: Joi.string().required().trim().messages({
    "string.empty": "La marque est obligatoire",
    "any.required": "La marque est obligatoire",
  }),
  modele: Joi.string().required().trim().messages({
    "string.empty": "Le modèle est obligatoire",
    "any.required": "Le modèle est obligatoire",
  }),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      "number.min": "L'année doit être supérieure à 1900",
      "number.max": "L'année ne peut pas être dans le futur",
    }),
  kilometrage: Joi.number().min(0).optional().default(0).messages({
    "number.min": "Le kilométrage doit être positif",
  }),
  capaciteCharge: Joi.number().min(0).required().messages({
    "number.min": "La capacité de charge doit être positive",
    "any.required": "La capacité de charge est obligatoire",
  }),
  typeCarburant: Joi.string()
    .valid("diesel", "essence", "electrique", "hybride")
    .optional()
    .messages({
      "any.only":
        "Le type de carburant doit être: diesel, essence, electrique ou hybride",
    }),
  dateAcquisition: Joi.date().optional().messages({
    "date.base": "Date d'acquisition invalide",
  }),
  statut: Joi.string()
    .valid("disponible", "en service", "en maintenance", "hors service")
    .optional()
    .messages({
      "any.only":
        "Le statut doit être: disponible, en service, en maintenance ou hors service",
    }),
  pneus: Joi.array().items(Joi.string().hex().length(24)).optional().messages({
    "string.hex": "ID de pneu invalide",
    "string.length": "ID de pneu invalide",
  }),
  derniereMaintenance: Joi.date().optional().messages({
    "date.base": "Date de dernière maintenance invalide",
  }),
  prochaineMaintenance: Joi.date().optional().messages({
    "date.base": "Date de prochaine maintenance invalide",
  }),
  remarques: Joi.string().optional().allow("").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
});

const updateCamionSchema = Joi.object({
  matricule: Joi.string().trim().uppercase().optional().messages({
    "string.empty": "La matricule ne peut pas être vide",
  }),
  marque: Joi.string().trim().optional().messages({
    "string.empty": "La marque ne peut pas être vide",
  }),
  modele: Joi.string().trim().optional().messages({
    "string.empty": "Le modèle ne peut pas être vide",
  }),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      "number.min": "L'année doit être supérieure à 1900",
      "number.max": "L'année ne peut pas être dans le futur",
    }),
  kilometrage: Joi.number().min(0).optional().messages({
    "number.min": "Le kilométrage doit être positif",
  }),
  capaciteCharge: Joi.number().min(0).optional().messages({
    "number.min": "La capacité de charge doit être positive",
  }),
  typeCarburant: Joi.string()
    .valid("diesel", "essence", "electrique", "hybride")
    .optional()
    .messages({
      "any.only":
        "Le type de carburant doit être: diesel, essence, electrique ou hybride",
    }),
  dateAcquisition: Joi.date().optional().messages({
    "date.base": "Date d'acquisition invalide",
  }),
  statut: Joi.string()
    .valid("disponible", "en service", "en maintenance", "hors service")
    .optional()
    .messages({
      "any.only":
        "Le statut doit être: disponible, en service, en maintenance ou hors service",
    }),
  pneus: Joi.array().items(Joi.string().hex().length(24)).optional().messages({
    "string.hex": "ID de pneu invalide",
    "string.length": "ID de pneu invalide",
  }),
  derniereMaintenance: Joi.date().optional().allow(null).messages({
    "date.base": "Date de dernière maintenance invalide",
  }),
  prochaineMaintenance: Joi.date().optional().allow(null).messages({
    "date.base": "Date de prochaine maintenance invalide",
  }),
  remarques: Joi.string().optional().allow("").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const validateCreateCamion = (data) => {
  return createCamionSchema.validate(data, { abortEarly: false });
};

const validateUpdateCamion = (data) => {
  return updateCamionSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateCamion,
  validateUpdateCamion,
};
