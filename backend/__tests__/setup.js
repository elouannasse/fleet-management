const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../src/config/env");

let mongoServer;

// Setup avant tous les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Nettoyer la DB après chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Helper functions
global.testHelpers = {
  generateToken: (userId) => {
    return jwt.sign({ id: userId }, jwtSecret, { expiresIn: "1d" });
  },

  createTestUser: async (data = {}) => {
    const User = require("../src/models/User");
    return await User.create({
      name: data.name || "Test User",
      email: data.email || `test${Date.now()}@example.com`,
      password: data.password || "password123",
      role: data.role || "chauffeur",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
  },

  createTestAdmin: async () => {
    const User = require("../src/models/User");
    return await User.create({
      name: "Admin User",
      email: `admin${Date.now()}@example.com`,
      password: "admin123",
      role: "admin",
      isActive: true,
    });
  },

  createTestCamion: async (data = {}) => {
    const Camion = require("../src/models/Camion");
    return await Camion.create({
      matricule: data.matricule || `TEST-${Date.now()}`,
      marque: data.marque || "Mercedes",
      modele: data.modele || "Actros",
      annee: data.annee || 2020,
      kilometrage: data.kilometrage || 50000,
      statut: data.statut || "disponible",
      capaciteCharge: data.capaciteCharge || 20000,
      ...data,
    });
  },

  createTestRemorque: async (data = {}) => {
    const Remorque = require("../src/models/Remorque");
    return await Remorque.create({
      matricule: data.matricule || `REM-${Date.now()}`,
      marque: data.marque || "Schmitz",
      type: data.type || "bâchée",
      annee: data.annee || 2019,
      kilometrage: data.kilometrage || 30000,
      statut: data.statut || "disponible",
      capaciteCharge: data.capaciteCharge || 15000,
      capacite: data.capacite || 15000,
      ...data,
    });
  },

  createTestTrajet: async (data = {}) => {
    const Trajet = require("../src/models/Trajet");
    const trajetData = { ...data };
    delete trajetData._id;
    return await Trajet.create({
      lieuDepart: data.lieuDepart || "Casablanca",
      lieuArrivee: data.lieuArrivee || "Marrakech",
      dateDepart: data.dateDepart || new Date(),
      camion: data.camion,
      chauffeur: data.chauffeur,
      statut: data.statut || "à faire",
      distance: data.distance || 200,
      ...trajetData,
    });
  },

  createTestMaintenance: async (data = {}) => {
    const Maintenance = require("../src/models/Maintenance");
    const vehiculeType = data.vehiculeType || "Camion";
    return await Maintenance.create({
      vehiculeType,
      vehicule: data.vehicule,
      type: data.type || "vidange",
      description: data.description || "Maintenance test",
      kilometrageActuel: data.kilometrageActuel || 50000,
      datePrevue: data.datePrevue || new Date(),
      statut: data.statut || "planifiée",
      creePar: data.creePar,
      ...data,
    });
  },

  createTestPneu: async (data = {}) => {
    const Pneu = require("../src/models/Pneu");
    const vehiculeType = data.vehiculeType || "Camion";
    return await Pneu.create({
      marque: data.marque || "Michelin",
      reference: data.reference || `REF-${Date.now()}`,
      dimension: data.dimension || "315/80R22.5",
      vehiculeType,
      vehicule: data.vehicule,
      position: data.position || "avant-gauche",
      état: data.état || "neuf",
      kilometrage: data.kilometrage || 0,
      kilometrageInstallation: data.kilometrageInstallation || 0,
      pressionRecommandee: data.pressionRecommandee || 8.5,
      dateInstallation: data.dateInstallation || new Date(),
      ...data,
    });
  },
};
