const request = require("supertest");
const app = require("../../src/app");

describe("TrajetController", () => {
  let admin, adminToken, chauffeur, camion, trajet;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    chauffeur = await global.testHelpers.createTestUser({ role: "chauffeur" });
    camion = await global.testHelpers.createTestCamion();
    trajet = await global.testHelpers.createTestTrajet({
      camion: camion._id,
      chauffeur: chauffeur._id,
    });
  });

  describe("GET /api/trajets", () => {
    it("devrait retourner tous les trajets", async () => {
      const res = await request(app)
        .get("/api/trajets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trajets).toHaveLength(1);
    });
  });

  describe("GET /api/trajets/:id", () => {
    it("devrait retourner un trajet par son ID", async () => {
      const res = await request(app)
        .get(`/api/trajets/${trajet._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trajet.lieuDepart).toBe(trajet.lieuDepart);
    });
  });

  describe("POST /api/trajets", () => {
    it("devrait créer un nouveau trajet", async () => {
      const res = await request(app)
        .post("/api/trajets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          lieuDepart: "Rabat",
          lieuArrivee: "Tanger",
          dateDepart: new Date(),
          camion: camion._id.toString(),
          chauffeur: chauffeur._id.toString(),
          distancePrevue: 300,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trajet.lieuDepart).toBe("Rabat");
    });
  });

  describe("PUT /api/trajets/:id", () => {
    it("devrait mettre à jour un trajet", async () => {
      const res = await request(app)
        .put(`/api/trajets/${trajet._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          marchandise: "Électronique",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/trajets/:id", () => {
    it("devrait supprimer un trajet", async () => {
      const res = await request(app)
        .delete(`/api/trajets/${trajet._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /api/trajets/:id/status", () => {
    it("devrait mettre à jour le statut d'un trajet", async () => {
      const res = await request(app)
        .patch(`/api/trajets/${trajet._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          statut: "en cours",
          kilometrageDepart: 50000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/trajets/stats", () => {
    it("devrait retourner les statistiques des trajets", async () => {
      const res = await request(app)
        .get("/api/trajets/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/trajets/:id/pdf", () => {
    it("devrait générer un PDF du trajet", async () => {
      const res = await request(app)
        .get(`/api/trajets/${trajet._id}/pdf`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
