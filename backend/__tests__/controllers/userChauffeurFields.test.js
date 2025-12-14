const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/User");

/**
 * TESTS POUR LES NOUVEAUX CHAMPS CHAUFFEUR
 *
 * Ce fichier teste spécifiquement les 4 nouveaux champs ajoutés au modèle User :
 * - telephone
 * - numeroPermis
 * - dateExpirationPermis
 * - adresse
 */

describe("UserController - Champs Chauffeur", () => {
  let adminToken;
  let adminUser;

  beforeEach(async () => {
    // Créer un admin pour chaque test
    adminUser = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(adminUser._id);
  });

  describe("POST /api/users - Création avec champs chauffeur", () => {
    it("devrait créer un chauffeur avec TOUS les champs chauffeur", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Jamal Chauffeur Complet",
          email: "jamal.complet@test.com",
          password: "jamal123",
          role: "chauffeur",
          telephone: "0612345678",
          numeroPermis: "ABC123456",
          dateExpirationPermis: "2026-12-31",
          adresse: "123 Rue Mohammed V, Casablanca",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("telephone", "0612345678");
      expect(response.body.data.user).toHaveProperty(
        "numeroPermis",
        "ABC123456"
      );
      expect(response.body.data.user).toHaveProperty("dateExpirationPermis");
      expect(response.body.data.user).toHaveProperty(
        "adresse",
        "123 Rue Mohammed V, Casablanca"
      );
    });

    it("devrait créer un chauffeur SANS les champs chauffeur (optionnels)", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Hassan Simple",
          email: "hassan.simple@test.com",
          password: "hassan123",
          role: "chauffeur",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("name", "Hassan Simple");
      // Les champs chauffeur peuvent être undefined ou null
    });

    it("devrait créer un admin SANS champs chauffeur", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Admin Secondaire",
          email: "admin2.chauffeur@test.com",
          password: "admin123",
          role: "admin",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("role", "admin");
    });
  });

  describe("PUT /api/users/:id - Modification avec champs chauffeur", () => {
    let chauffeurId;

    beforeEach(async () => {
      // Créer un chauffeur de test pour chaque test
      const chauffeur = await User.create({
        name: "Chauffeur à Modifier",
        email: `modifier${Date.now()}@test.com`,
        password: "test123",
        role: "chauffeur",
        telephone: "0611111111",
        numeroPermis: "OLD123",
        dateExpirationPermis: new Date("2025-12-31"),
        adresse: "Ancienne Adresse",
      });
      chauffeurId = chauffeur._id;
    });

    it("devrait modifier TOUS les champs chauffeur", async () => {
      const response = await request(app)
        .put(`/api/users/${chauffeurId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Chauffeur Modifié Complet",
          telephone: "0622222222",
          numeroPermis: "NEW456",
          dateExpirationPermis: "2027-06-30",
          adresse: "Nouvelle Adresse Complete",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("telephone", "0622222222");
      expect(response.body.data.user).toHaveProperty("numeroPermis", "NEW456");
      expect(response.body.data.user).toHaveProperty(
        "adresse",
        "Nouvelle Adresse Complete"
      );
    });

    it("devrait modifier SEULEMENT le téléphone", async () => {
      const response = await request(app)
        .put(`/api/users/${chauffeurId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          telephone: "0633333333",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("telephone", "0633333333");
    });

    it("devrait vider un champ chauffeur (null)", async () => {
      const response = await request(app)
        .put(`/api/users/${chauffeurId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          adresse: null,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("devrait vider un champ chauffeur (string vide)", async () => {
      const response = await request(app)
        .put(`/api/users/${chauffeurId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          telephone: "",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/users/:id - Récupération avec champs chauffeur", () => {
    let chauffeurCompletId;

    beforeEach(async () => {
      // Créer un chauffeur complet pour chaque test
      const chauffeur = await User.create({
        name: "Chauffeur Complet GET",
        email: `get${Date.now()}@test.com`,
        password: "test123",
        role: "chauffeur",
        telephone: "0644444444",
        numeroPermis: "GET123",
        dateExpirationPermis: new Date("2026-12-31"),
        adresse: "Adresse Complete GET",
      });
      chauffeurCompletId = chauffeur._id;
    });

    it("devrait retourner TOUS les champs chauffeur", async () => {
      const response = await request(app)
        .get(`/api/users/${chauffeurCompletId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("telephone", "0644444444");
      expect(response.body.data.user).toHaveProperty("numeroPermis", "GET123");
      expect(response.body.data.user).toHaveProperty("dateExpirationPermis");
      expect(response.body.data.user).toHaveProperty(
        "adresse",
        "Adresse Complete GET"
      );
      expect(response.body.data.user).not.toHaveProperty("password"); // Password ne doit pas être retourné
    });
  });

  describe("GET /api/users - Liste avec champs chauffeur", () => {
    it("devrait retourner tous les utilisateurs avec leurs champs chauffeur", async () => {
      // Créer quelques chauffeurs pour le test
      await User.create({
        name: "Chauffeur Liste 1",
        email: `liste1${Date.now()}@test.com`,
        password: "test123",
        role: "chauffeur",
        telephone: "0655555555",
        numeroPermis: "LIST1",
      });

      await User.create({
        name: "Chauffeur Liste 2",
        email: `liste2${Date.now()}@test.com`,
        password: "test123",
        role: "chauffeur",
      });

      const response = await request(app)
        .get("/api/users?role=chauffeur")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);

      // Vérifier que les champs chauffeur sont présents (s'ils existent)
      const chauffeurWithFields = response.body.data.users.find(
        (u) => u.telephone !== undefined && u.telephone !== null
      );
      if (chauffeurWithFields) {
        expect(chauffeurWithFields).toHaveProperty("telephone");
        expect(chauffeurWithFields).not.toHaveProperty("password");
      }
    });
  });

  describe("Validation des champs chauffeur", () => {
    it("devrait accepter une date d'expiration valide", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Date Valide",
          email: "date.valide@test.com",
          password: "test123",
          role: "chauffeur",
          dateExpirationPermis: "2028-01-15",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it("devrait rejeter une date d'expiration invalide", async () => {
      const response = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Date Invalide",
          email: "date.invalide@test.com",
          password: "test123",
          role: "chauffeur",
          dateExpirationPermis: "invalid-date",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
