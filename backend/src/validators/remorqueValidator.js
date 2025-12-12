const Joi = require("joi");

const createRemorqueSchema = Joi.object({
  matricule: Joi.string().required().trim().uppercase().messages({
    "string.empty": "La matricule est obligatoire",
    "any.required": "La matricule est obligatoire",
  }),
  marque: Joi.string().trim().optional(),
  modele: Joi.string().trim().optional(),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .messages({
      "number.min": "L'année doit être supérieure à 1900",
      "number.max": "L'année ne peut pas être dans le futur",
    }),
  type: Joi.string()
    .valid("bâchée", "frigorifique", "citerne", "plateau")
    .required()
    .messages({
      "string.empty": "Le type est obligatoire",
      "any.required": "Le type est obligatoire",
      "any.only": "Type de remorque invalide",
    }),
  capacite: Joi.number().positive().optional().messages({
    "number.base": "La capacité doit être un nombre",
    "number.positive": "La capacité doit être positive",
  }),
  capaciteCharge: Joi.number().positive().optional().messages({
    "number.base": "La capacité de charge doit être un nombre",
    "number.positive": "La capacité de charge doit être positive",
  }),
  typeCarburant: Joi.string()
    .valid("diesel", "essence", "electrique", "hybride")
    .optional(),
  dateAcquisition: Joi.date().optional(),
  statut: Joi.string()
    .valid("disponible", "en service", "en maintenance", "hors service")
    .optional(),
  pneus: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  derniereMaintenance: Joi.date().optional(),
  prochaineMaintenance: Joi.date().optional(),
  remarques: Joi.string().optional().allow(""),
});

const updateRemorqueSchema = Joi.object({
  matricule: Joi.string().trim().uppercase().optional(),
  marque: Joi.string().trim().optional(),
  modele: Joi.string().trim().optional(),
  annee: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  type: Joi.string()
    .valid("bâché", "frigorifique", "citerne", "plateau", "porte-conteneur")
    .optional(),
  capacite: Joi.number().positive().optional(),
  capaciteCharge: Joi.number().positive().optional(),
  typeCarburant: Joi.string()
    .valid("diesel", "essence", "electrique", "hybride")
    .optional(),
  dateAcquisition: Joi.date().optional(),
  statut: Joi.string()
    .valid("disponible", "en service", "en maintenance", "hors service")
    .optional(),
  pneus: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  derniereMaintenance: Joi.date().optional(),
  prochaineMaintenance: Joi.date().optional(),
  remarques: Joi.string().optional().allow(""),
}).min(1);

const validateCreateRemorque = (data) => {
  return createRemorqueSchema.validate(data, { abortEarly: false });
};

const validateUpdateRemorque = (data) => {
  return updateRemorqueSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateRemorque,
  validateUpdateRemorque,
};
