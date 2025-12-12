const request = require("supertest");
const app = require("../../src/app");

describe("MaintenanceController", () => {
  let admin, adminToken, camion, maintenance;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    camion = await global.testHelpers.createTestCamion();
    maintenance = await global.testHelpers.createTestMaintenance({
      vehicule: camion._id,
      vehiculeType: "Camion",
      creePar: admin._id,
    });
  });

  describe("GET /api/maintenances", () => {
    it("devrait retourner toutes les maintenances", async () => {
      const res = await request(app)
        .get("/api/maintenances")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maintenances).toHaveLength(1);
    });

    it("devrait filtrer par vehiculeType", async () => {
      const res = await request(app)
        .get("/api/maintenances?vehiculeType=Camion")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.maintenances).toHaveLength(1);
    });
  });

  describe("GET /api/maintenances/:id", () => {
    it("devrait retourner une maintenance par son ID", async () => {
      const res = await request(app)
        .get(`/api/maintenances/${maintenance._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maintenance.type).toBe(maintenance.type);
    });
  });

  describe("POST /api/maintenances", () => {
    it("devrait créer une nouvelle maintenance", async () => {
      const res = await request(app)
        .post("/api/maintenances")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          vehiculeType: "Camion",
          vehicule: camion._id.toString(),
          type: "revision",
          description: "Révision annuelle",
          kilometrageActuel: 60000,
          datePrevue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.maintenance.type).toBe("revision");
    });
  });

  describe("PUT /api/maintenances/:id", () => {
    it("devrait mettre à jour une maintenance", async () => {
      const res = await request(app)
        .put(`/api/maintenances/${maintenance._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          statut: "en cours",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/maintenances/:id", () => {
    it("devrait supprimer une maintenance", async () => {
      const res = await request(app)
        .delete(`/api/maintenances/${maintenance._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/maintenances/vehicule/:vehiculeType/:vehiculeId", () => {
    it("devrait retourner les maintenances d'un véhicule", async () => {
      const res = await request(app)
        .get(`/api/maintenances/vehicule/Camion/${camion._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/maintenances/stats", () => {
    it("devrait retourner les statistiques de maintenance", async () => {
      const res = await request(app)
        .get("/api/maintenances/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
