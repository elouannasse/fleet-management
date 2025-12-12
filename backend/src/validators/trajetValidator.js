const Joi = require("joi");

const createTrajetSchema = Joi.object({
  chauffeur: Joi.string().hex().length(24).required().messages({
    "string.hex": "L'ID du chauffeur doit être un ObjectId valide",
    "string.length": "L'ID du chauffeur doit contenir 24 caractères",
    "any.required": "Le chauffeur est obligatoire",
  }),
  camion: Joi.string().hex().length(24).required().messages({
    "string.hex": "L'ID du camion doit être un ObjectId valide",
    "string.length": "L'ID du camion doit contenir 24 caractères",
    "any.required": "Le camion est obligatoire",
  }),
  remorque: Joi.string().hex().length(24).optional().allow(null).messages({
    "string.hex": "L'ID de la remorque doit être un ObjectId valide",
    "string.length": "L'ID de la remorque doit contenir 24 caractères",
  }),
  lieuDepart: Joi.string().required().trim().messages({
    "string.empty": "Le lieu de départ est obligatoire",
    "any.required": "Le lieu de départ est obligatoire",
  }),
  lieuArrivee: Joi.string().required().trim().messages({
    "string.empty": "Le lieu d'arrivée est obligatoire",
    "any.required": "Le lieu d'arrivée est obligatoire",
  }),
  dateDepart: Joi.date().required().messages({
    "date.base": "La date de départ doit être une date valide",
    "any.required": "La date de départ est obligatoire",
  }),
  dateArrivee: Joi.date().optional().allow(null).messages({
    "date.base": "La date d'arrivée doit être une date valide",
  }),
  distancePrevue: Joi.number().min(0).optional().allow(null).messages({
    "number.min": "La distance prévue doit être positive",
  }),
  statut: Joi.string()
    .valid("planifié", "à faire", "en cours", "terminé")
    .optional()
    .messages({
      "any.only": "Le statut doit être: planifié, à faire, en cours ou terminé",
    }),
  marchandise: Joi.string().optional().allow(null, "").messages({
    "string.base": "La marchandise doit être du texte",
  }),
  poidsMarchandise: Joi.number().min(0).optional().allow(null).messages({
    "number.min": "Le poids de la marchandise doit être positif",
  }),
  poids: Joi.number().min(0).optional().allow(null).messages({
    "number.min": "Le poids doit être positif",
  }),
  remarques: Joi.string().optional().allow(null, "").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
});

/**
 * Schéma de validation pour la mise à jour d'un trajet
 */
const updateTrajetSchema = Joi.object({
  chauffeur: Joi.string().hex().length(24).optional().messages({
    "string.hex": "L'ID du chauffeur doit être un ObjectId valide",
    "string.length": "L'ID du chauffeur doit contenir 24 caractères",
  }),
  lieuDepart: Joi.string().trim().optional().messages({
    "string.empty": "Le lieu de départ ne peut pas être vide",
  }),
  lieuArrivee: Joi.string().trim().optional().messages({
    "string.empty": "Le lieu d'arrivée ne peut pas être vide",
  }),
  dateDepart: Joi.date().optional().messages({
    "date.base": "La date de départ doit être une date valide",
  }),
  marchandise: Joi.string().optional().allow(null, "").messages({
    "string.base": "La marchandise doit être du texte",
  }),
  poidsMarchandise: Joi.number().min(0).optional().allow(null).messages({
    "number.min": "Le poids de la marchandise doit être positif",
  }),
  remarques: Joi.string().optional().allow(null, "").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const updateTrajetStatusSchema = Joi.object({
  statut: Joi.string()
    .valid("planifié", "à faire", "en cours", "terminé")
    .optional()
    .messages({
      "any.only": "Le statut doit être: planifié, à faire, en cours ou terminé",
    }),
  kilometrageDepart: Joi.number().min(0).optional().messages({
    "number.min": "Le kilométrage de départ doit être positif",
  }),
  kilometrageArrivee: Joi.number().min(0).optional().messages({
    "number.min": "Le kilométrage d'arrivée doit être positif",
  }),
  gasoilConsomme: Joi.number().min(0).optional().messages({
    "number.min": "Le gasoil consommé doit être positif",
  }),
  coutGasoil: Joi.number().min(0).optional().messages({
    "number.min": "Le coût du gasoil doit être positif",
  }),
  remarques: Joi.string().optional().allow(null, "").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const validateCreateTrajet = (data) => {
  return createTrajetSchema.validate(data, { abortEarly: false });
};

const validateUpdateTrajet = (data) => {
  return updateTrajetSchema.validate(data, { abortEarly: false });
};

const validateUpdateTrajetStatus = (data) => {
  return updateTrajetStatusSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateTrajet,
  validateUpdateTrajet,
  validateUpdateTrajetStatus,
};
