const request = require("supertest");
const app = require("../../src/app");

describe("PneuController", () => {
  let admin, adminToken, camion, pneu;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    camion = await global.testHelpers.createTestCamion();
    pneu = await global.testHelpers.createTestPneu({
      vehicule: camion._id,
      vehiculeType: "Camion",
    });
  });

  describe("GET /api/pneus", () => {
    it("devrait retourner tous les pneus", async () => {
      const res = await request(app)
        .get("/api/pneus")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pneus).toHaveLength(1);
    });
  });

  describe("GET /api/pneus/:id", () => {
    it("devrait retourner un pneu par son ID", async () => {
      const res = await request(app)
        .get(`/api/pneus/${pneu._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pneu.marque).toBe(pneu.marque);
    });
  });

  describe("POST /api/pneus", () => {
    it("devrait créer un nouveau pneu", async () => {
      const res = await request(app)
        .post("/api/pneus")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          marque: "Bridgestone",
          reference: "BR-2024",
          dimension: "315/80R22.5",
          vehiculeType: "Camion",
          vehicule: camion._id.toString(),
          position: "avant-droit",
          etat: "neuf",
          kilometrageInstallation: 0,
          pressionRecommandee: 8.5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pneu.marque).toBe("Bridgestone");
    });
  });

  describe("PUT /api/pneus/:id", () => {
    it("devrait mettre à jour un pneu", async () => {
      const res = await request(app)
        .put(`/api/pneus/${pneu._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          remarques: "Pneu en bon état",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/pneus/:id", () => {
    it("devrait supprimer un pneu", async () => {
      const res = await request(app)
        .delete(`/api/pneus/${pneu._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PATCH /api/pneus/:id/etat", () => {
    it("devrait mettre à jour l'état d'un pneu", async () => {
      const res = await request(app)
        .patch(`/api/pneus/${pneu._id}/etat`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          etat: "bon",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/pneus/vehicule/:vehiculeType/:vehiculeId", () => {
    it("devrait retourner les pneus d'un véhicule", async () => {
      const res = await request(app)
        .get(`/api/pneus/vehicule/Camion/${camion._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
