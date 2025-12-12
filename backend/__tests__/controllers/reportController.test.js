const request = require("supertest");
const app = require("../../src/app");

describe("ReportController", () => {
  let admin, adminToken, camion, chauffeur;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    camion = await global.testHelpers.createTestCamion();
    chauffeur = await global.testHelpers.createTestUser({ role: "chauffeur" });
  });

  describe("GET /api/reports/maintenance", () => {
    it("devrait retourner le rapport de maintenance", async () => {
      const res = await request(app)
        .get("/api/reports/maintenance")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("devrait accepter des paramètres de date", async () => {
      const startDate = new Date("2024-01-01").toISOString();
      const endDate = new Date("2024-12-31").toISOString();

      const res = await request(app)
        .get(
          `/api/reports/maintenance?startDate=${startDate}&endDate=${endDate}`
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/reports/consumption", () => {
    it("devrait retourner le rapport de consommation", async () => {
      const res = await request(app)
        .get("/api/reports/consumption")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/reports/kilometrage", () => {
    it("devrait retourner le rapport de kilométrage", async () => {
      const res = await request(app)
        .get("/api/reports/kilometrage")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/reports/dashboard", () => {
    it("devrait retourner les données du dashboard", async () => {
      const res = await request(app)
        .get("/api/reports/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
