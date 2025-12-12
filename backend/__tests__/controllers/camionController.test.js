const request = require("supertest");
const app = require("../../src/app");

describe("CamionController", () => {
  let admin, adminToken, camion;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    camion = await global.testHelpers.createTestCamion();
  });

  describe("GET /api/camions", () => {
    it("devrait retourner tous les camions", async () => {
      const res = await request(app)
        .get("/api/camions")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.camions).toHaveLength(1);
    });
  });

  describe("GET /api/camions/:id", () => {
    it("devrait retourner un camion par son ID", async () => {
      const res = await request(app)
        .get(`/api/camions/${camion._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.camion.matricule).toBe(camion.matricule);
    });
  });

  describe("POST /api/camions", () => {
    it("devrait créer un nouveau camion", async () => {
      const res = await request(app)
        .post("/api/camions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          matricule: "NEW-123",
          marque: "Volvo",
          modele: "FH16",
          annee: 2021,
          kilometrage: 0,
          capaciteCharge: 25000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.camion.matricule).toBe("NEW-123");
    });
  });

  describe("PUT /api/camions/:id", () => {
    it("devrait mettre à jour un camion", async () => {
      const res = await request(app)
        .put(`/api/camions/${camion._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          kilometrage: 60000,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.camion.kilometrage).toBe(60000);
    });
  });

  describe("DELETE /api/camions/:id", () => {
    it("devrait supprimer un camion", async () => {
      const res = await request(app)
        .delete(`/api/camions/${camion._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/camions/disponibles", () => {
    it("devrait retourner les camions disponibles", async () => {
      const res = await request(app)
        .get("/api/camions/disponibles")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
