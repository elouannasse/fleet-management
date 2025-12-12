// ============================================================================
// CODE COMPLET PRÊT À COPIER-COLLER
// Architecture: Validator Joi + Service Métier + Controller Minimal
// ============================================================================

// ============================================================================
// 📁 FICHIER 1: src/validators/maintenanceValidator.js
// ============================================================================

const Joi = require("joi");

/**
 * Validator pour la planification de maintenance
 */
const planifierMaintenanceSchema = Joi.object({
  camionId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "L'ID du camion doit être un ObjectId MongoDB valide",
      "any.required": "L'ID du camion est requis",
    }),

  type: Joi.string()
    .valid("vidange", "revision", "pneu", "reparation")
    .required()
    .messages({
      "any.only": "Le type doit être: vidange, revision, pneu ou reparation",
      "any.required": "Le type de maintenance est requis",
    }),

  date: Joi.date().iso().min("now").required().messages({
    "date.base": "La date doit être une date valide",
    "date.min": "La date ne peut pas être dans le passé",
    "any.required": "La date de maintenance est requise",
  }),

  kilometrage: Joi.number().integer().min(0).max(2000000).required().messages({
    "number.base": "Le kilométrage doit être un nombre",
    "number.min": "Le kilométrage ne peut pas être négatif",
    "number.max": "Le kilométrage ne peut pas dépasser 2 000 000 km",
    "any.required": "Le kilométrage est requis",
  }),

  description: Joi.string().max(500).optional().messages({
    "string.max": "La description ne peut pas dépasser 500 caractères",
  }),

  cout: Joi.number().min(0).optional().messages({
    "number.min": "Le coût ne peut pas être négatif",
  }),
});

/**
 * Valide les données de planification de maintenance
 */
const validatePlanifierMaintenance = (data) => {
  return planifierMaintenanceSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

module.exports = {
  validatePlanifierMaintenance,
  planifierMaintenanceSchema,
};

// ============================================================================
// 📁 FICHIER 2: src/services/maintenanceService.js (AJOUTER CETTE FONCTION)
// ============================================================================

// Ajouter au début du fichier:
const Maintenance = require("../models/Maintenance");
const { MAINTENANCE_STATUS } = require("../utils/constants");

// Ajouter cette fonction au service:

/**
 * Planifie une nouvelle maintenance pour un camion
 */
const planifierMaintenance = async (
  camionId,
  type,
  date,
  kilometrage,
  description = null,
  cout = null
) => {
  // Vérification de l'existence du camion
  const camion = await Camion.findById(camionId);

  if (!camion) {
    throw new Error("Camion non trouvé");
  }

  // Vérification du kilométrage cohérent
  if (kilometrage < camion.kilometrage) {
    throw new Error(
      `Le kilométrage de maintenance (${kilometrage} km) ne peut pas être inférieur au kilométrage actuel du camion (${camion.kilometrage} km)`
    );
  }

  // Création de la maintenance
  const maintenance = await Maintenance.create({
    vehicule: camionId,
    vehiculeType: "Camion",
    type,
    datePrevue: new Date(date),
    kilometragePrevisionnel: kilometrage,
    statut: MAINTENANCE_STATUS.PLANIFIEE,
    description,
    coutEstime: cout || 0,
  });

  // Mise à jour de la prochaine maintenance du camion
  if (
    !camion.prochaineMaintenance ||
    new Date(date) < camion.prochaineMaintenance
  ) {
    camion.prochaineMaintenance = new Date(date);
    await camion.save();
  }

  // Population des données du camion
  await maintenance.populate("vehicule", "matricule marque modele kilometrage");

  return maintenance;
};

// Ajouter dans module.exports:
module.exports = {
  planifierMaintenance, // ← AJOUTER CETTE LIGNE
  // ... autres exports existants
};

// ============================================================================
// 📁 FICHIER 3: src/controllers/maintenancePlanificationController.js (NOUVEAU)
// ============================================================================

const {
  validatePlanifierMaintenance,
} = require("../validators/maintenanceValidator");
const { planifierMaintenance } = require("../services/maintenanceService");

/**
 * Controller minimal pour la planification de maintenance
 * Ne contient que la validation et l'appel au service
 */

/**
 * POST /api/maintenances/planifier
 * Planifie une nouvelle maintenance pour un camion
 */
const planifierMaintenanceController = async (req, res) => {
  try {
    // Validation des données avec Joi
    const { error, value } = validatePlanifierMaintenance(req.body);

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors,
      });
    }

    // Appel au service métier
    const { camionId, type, date, kilometrage, description, cout } = value;
    const maintenance = await planifierMaintenance(
      camionId,
      type,
      date,
      kilometrage,
      description,
      cout
    );

    // Réponse JSON simple
    return res.status(201).json({
      success: true,
      message: "Maintenance planifiée avec succès",
      data: {
        id: maintenance._id,
        camion: {
          id: maintenance.vehicule._id,
          matricule: maintenance.vehicule.matricule,
          marque: maintenance.vehicule.marque,
          modele: maintenance.vehicule.modele,
          kilometrage: maintenance.vehicule.kilometrage,
        },
        type: maintenance.type,
        datePrevue: maintenance.datePrevue,
        kilometragePrevisionnel: maintenance.kilometragePrevisionnel,
        statut: maintenance.statut,
        description: maintenance.description,
        coutEstime: maintenance.coutEstime,
        createdAt: maintenance.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur planification maintenance:", error);

    // Gestion des erreurs métier
    if (error.message === "Camion non trouvé") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("kilométrage")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Erreur serveur générique
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la planification de la maintenance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  planifierMaintenanceController,
};

// ============================================================================
// 📁 FICHIER 4: src/routes/maintenancePlanificationRoutes.js (NOUVEAU)
// ============================================================================

const express = require("express");
const router = express.Router();
const {
  planifierMaintenanceController,
} = require("../controllers/maintenancePlanificationController");

/**
 * Route pour planifier une maintenance
 * POST /api/maintenances/planifier
 */
router.post("/planifier", planifierMaintenanceController);

module.exports = router;

// ============================================================================
// 📁 FICHIER 5: src/app.js (AJOUTER CETTE LIGNE)
// ============================================================================

// Ajouter avec les autres imports de routes:
const maintenancePlanificationRoutes = require("./routes/maintenancePlanificationRoutes");

// Ajouter avec les autres app.use():
app.use("/api/maintenances", maintenancePlanificationRoutes);

// ============================================================================
// 🚀 INSTALLATION
// ============================================================================

// Dans le terminal:
// npm install joi

// ============================================================================
// 📋 EXEMPLE DE REQUÊTE HTTP
// ============================================================================

/*
POST http://localhost:5000/api/maintenances/planifier
Content-Type: application/json

{
  "camionId": "507f1f77bcf86cd799439011",
  "type": "vidange",
  "date": "2025-12-15T10:00:00.000Z",
  "kilometrage": 150000,
  "description": "Vidange complète avec changement de filtre à huile",
  "cout": 250
}
*/

// ============================================================================
// ✅ RÉPONSE SUCCESS (201)
// ============================================================================

/*
{
  "success": true,
  "message": "Maintenance planifiée avec succès",
  "data": {
    "id": "675812a3b4c5d6e7f8901234",
    "camion": {
      "id": "507f1f77bcf86cd799439011",
      "matricule": "ABC-123",
      "marque": "Volvo",
      "modele": "FH16",
      "kilometrage": 145000
    },
    "type": "vidange",
    "datePrevue": "2025-12-15T10:00:00.000Z",
    "kilometragePrevisionnel": 150000,
    "statut": "planifiée",
    "description": "Vidange complète avec changement de filtre à huile",
    "coutEstime": 250,
    "createdAt": "2025-12-10T14:30:00.000Z"
  }
}
*/

// ============================================================================
// ❌ RÉPONSES D'ERREUR
// ============================================================================

// Erreur de validation (400):
/*
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    "L'ID du camion est requis",
    "Le type de maintenance est requis"
  ]
}
*/

// Camion non trouvé (404):
/*
{
  "success": false,
  "message": "Camion non trouvé"
}
*/

// Kilométrage invalide (400):
/*
{
  "success": false,
  "message": "Le kilométrage de maintenance (100000 km) ne peut pas être inférieur au kilométrage actuel du camion (145000 km)"
}
*/

// ============================================================================
// ✨ ARCHITECTURE EN 3 COUCHES
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST HTTP                              │
│                    POST /api/maintenances/planifier              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  📋 VALIDATOR (validators/maintenanceValidator.js)              │
│  ✓ Valide camionId (ObjectId)                                   │
│  ✓ Valide type (vidange|revision|pneu|reparation)               │
│  ✓ Valide date (future uniquement)                              │
│  ✓ Valide kilometrage (0-2000000)                               │
│  ✓ Messages d'erreur personnalisés                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  🏢 SERVICE (services/maintenanceService.js)                    │
│  ✓ Vérifie l'existence du camion                                │
│  ✓ Valide le kilométrage cohérent                               │
│  ✓ Crée la maintenance en base                                  │
│  ✓ Met à jour la prochaine maintenance du camion                │
│  ✓ Population des données                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  🎮 CONTROLLER (controllers/maintenancePlanificationController) │
│  ✓ Orchestre validator + service                                │
│  ✓ Formate la réponse HTTP                                      │
│  ✓ Gère les codes de statut (201, 400, 404, 500)                │
│  ✓ Transforme les erreurs métier en erreurs HTTP                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        RESPONSE JSON                             │
│                  { success, message, data }                      │
└─────────────────────────────────────────────────────────────────┘
*/

// ============================================================================
// 🎯 AVANTAGES DE CETTE ARCHITECTURE
// ============================================================================

/*
✅ SÉPARATION DES RESPONSABILITÉS
  - Validator: Validation des données
  - Service: Logique métier
  - Controller: Orchestration + Réponses HTTP

✅ TESTABILITÉ
  - Chaque couche testable indépendamment
  - Mocks faciles pour les tests unitaires
  - Tests d'intégration simplifiés

✅ MAINTENABILITÉ
  - Code organisé et structuré
  - Responsabilités clairement définies
  - Facile à étendre et modifier

✅ RÉUTILISABILITÉ
  - Validator réutilisable partout
  - Service utilisable dans CLI, WebSocket, etc.
  - Controller minimal et clair

✅ ROBUSTESSE
  - Validation stricte avec Joi
  - Gestion propre des erreurs
  - Messages d'erreur explicites
*/

console.log("✅ Code complet prêt à être utilisé!");
console.log("\n📦 Installation: npm install joi");
console.log("\n📁 Fichiers à créer/modifier:");
console.log("  1. src/validators/maintenanceValidator.js (nouveau)");
console.log("  2. src/services/maintenanceService.js (ajouter fonction)");
console.log(
  "  3. src/controllers/maintenancePlanificationController.js (nouveau)"
);
console.log("  4. src/routes/maintenancePlanificationRoutes.js (nouveau)");
console.log("  5. src/app.js (ajouter route)");
