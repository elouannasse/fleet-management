const Joi = require("joi");

const createPneuSchema = Joi.object({
  reference: Joi.string().required().trim().messages({
    "string.empty": "La référence est obligatoire",
    "any.required": "La référence est obligatoire",
  }),
  marque: Joi.string().required().trim().messages({
    "string.empty": "La marque est obligatoire",
    "any.required": "La marque est obligatoire",
  }),
  modele: Joi.string().optional().trim().messages({
    "string.base": "Le modèle doit être du texte",
  }),
  dimension: Joi.string().required().trim().messages({
    "string.empty": "La dimension est obligatoire",
    "any.required": "La dimension est obligatoire",
  }),
  numeroSerie: Joi.string().optional().trim().messages({
    "string.base": "Le numéro de série doit être du texte",
  }),
  position: Joi.string().required().trim().messages({
    "string.empty": "La position est obligatoire",
    "any.required": "La position est obligatoire",
  }),
  vehiculeType: Joi.string().valid("Camion", "Remorque").required().messages({
    "any.only": 'Le type de véhicule doit être "Camion" ou "Remorque"',
    "any.required": "Le type de véhicule est obligatoire",
  }),
  vehicule: Joi.string().hex().length(24).required().messages({
    "string.hex": "L'ID du véhicule doit être un ObjectId valide",
    "string.length": "L'ID du véhicule doit contenir 24 caractères",
    "any.required": "L'ID du véhicule est obligatoire",
  }),
  dateInstallation: Joi.date().optional().default(Date.now).messages({
    "date.base": "Date d'installation invalide",
  }),
  kilometrageInstallation: Joi.number().min(0).required().messages({
    "number.min": "Le kilométrage d'installation doit être positif",
    "any.required": "Le kilométrage d'installation est obligatoire",
  }),
  dateAchat: Joi.date().optional().messages({
    "date.base": "Date d'achat invalide",
  }),
  prixAchat: Joi.number().min(0).optional().messages({
    "number.min": "Le prix d'achat doit être positif",
  }),
  statut: Joi.string()
    .valid("en service", "en stock", "retiré", "recyclé")
    .optional()
    .messages({
      "any.only":
        "Le statut doit être: en service, en stock, retiré ou recyclé",
    }),
  etat: Joi.string()
    .valid("neuf", "bon", "moyen", "use", "a changer")
    .optional()
    .messages({
      "any.only": "L'état doit être: neuf, bon, moyen, use ou a changer",
    }),
  pressionRecommandee: Joi.number().min(0).required().messages({
    "number.min": "La pression recommandée doit être positive",
    "any.required": "La pression recommandée est obligatoire",
  }),
  remarques: Joi.string().optional().allow("").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
});

const updatePneuSchema = Joi.object({
  reference: Joi.string().trim().optional().messages({
    "string.empty": "La référence ne peut pas être vide",
  }),
  marque: Joi.string().trim().optional().messages({
    "string.empty": "La marque ne peut pas être vide",
  }),
  modele: Joi.string().optional().trim().messages({
    "string.base": "Le modèle doit être du texte",
  }),
  dimension: Joi.string().trim().optional().messages({
    "string.empty": "La dimension ne peut pas être vide",
  }),
  numeroSerie: Joi.string().optional().trim().messages({
    "string.base": "Le numéro de série doit être du texte",
  }),
  position: Joi.string().trim().optional().messages({
    "string.empty": "La position ne peut pas être vide",
  }),
  vehiculeType: Joi.string().valid("Camion", "Remorque").optional().messages({
    "any.only": 'Le type de véhicule doit être "Camion" ou "Remorque"',
  }),
  vehicule: Joi.string().hex().length(24).optional().messages({
    "string.hex": "L'ID du véhicule doit être un ObjectId valide",
    "string.length": "L'ID du véhicule doit contenir 24 caractères",
  }),
  dateInstallation: Joi.date().optional().messages({
    "date.base": "Date d'installation invalide",
  }),
  kilometrageInstallation: Joi.number().min(0).optional().messages({
    "number.min": "Le kilométrage d'installation doit être positif",
  }),
  dateAchat: Joi.date().optional().messages({
    "date.base": "Date d'achat invalide",
  }),
  prixAchat: Joi.number().min(0).optional().messages({
    "number.min": "Le prix d'achat doit être positif",
  }),
  statut: Joi.string()
    .valid("en service", "en stock", "retiré", "recyclé")
    .optional()
    .messages({
      "any.only":
        "Le statut doit être: en service, en stock, retiré ou recyclé",
    }),
  etat: Joi.string()
    .valid("neuf", "bon", "moyen", "use", "a changer")
    .optional()
    .messages({
      "any.only": "L'état doit être: neuf, bon, moyen, use ou a changer",
    }),
  pressionRecommandee: Joi.number().min(0).optional().messages({
    "number.min": "La pression recommandée doit être positive",
  }),
  remarques: Joi.string().optional().allow("").messages({
    "string.base": "Les remarques doivent être du texte",
  }),
})
  .min(1)
  .messages({
    "object.min": "Au moins un champ doit être fourni pour la mise à jour",
  });

const updatePneuEtatSchema = Joi.object({
  etat: Joi.string()
    .valid("neuf", "bon", "moyen", "use", "a changer")
    .required()
    .messages({
      "any.only": "L'état doit être: neuf, bon, moyen, use ou a changer",
      "any.required": "L'état est obligatoire",
    }),
});

const validateCreatePneu = (data) => {
  return createPneuSchema.validate(data, { abortEarly: false });
};

const validateUpdatePneu = (data) => {
  return updatePneuSchema.validate(data, { abortEarly: false });
};

const validateUpdatePneuEtat = (data) => {
  return updatePneuEtatSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreatePneu,
  validateUpdatePneu,
  validateUpdatePneuEtat,
};
