const request = require("supertest");
const app = require("../../src/app");

describe("RemorqueController", () => {
  let admin, adminToken, remorque;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    remorque = await global.testHelpers.createTestRemorque();
  });

  describe("GET /api/remorques", () => {
    it("devrait retourner toutes les remorques", async () => {
      const res = await request(app)
        .get("/api/remorques")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.remorques).toHaveLength(1);
    });
  });

  describe("GET /api/remorques/:id", () => {
    it("devrait retourner une remorque par son ID", async () => {
      const res = await request(app)
        .get(`/api/remorques/${remorque._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.remorque.matricule).toBe(remorque.matricule);
    });
  });

  describe("POST /api/remorques", () => {
    it("devrait créer une nouvelle remorque", async () => {
      const res = await request(app)
        .post("/api/remorques")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          matricule: "NEW-REM-123",
          marque: "Krone",
          type: "frigorifique",
          annee: 2020,
          capacite: 25000,
          capaciteCharge: 18000,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.remorque.matricule).toBe("NEW-REM-123");
    });
  });

  describe("PUT /api/remorques/:id", () => {
    it("devrait mettre à jour une remorque", async () => {
      const res = await request(app)
        .put(`/api/remorques/${remorque._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          marque: "Updated Brand",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/remorques/:id", () => {
    it("devrait supprimer une remorque", async () => {
      const res = await request(app)
        .delete(`/api/remorques/${remorque._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/remorques/disponibles", () => {
    it("devrait retourner les remorques disponibles", async () => {
      const res = await request(app)
        .get("/api/remorques/disponibles")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
