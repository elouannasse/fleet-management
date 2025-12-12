const request = require("supertest");
const app = require("../../src/app");

describe("AuthController", () => {
  let admin, chauffeur, adminToken, chauffeurToken;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    chauffeur = await global.testHelpers.createTestUser({ role: "chauffeur" });
    adminToken = global.testHelpers.generateToken(admin._id);
    chauffeurToken = global.testHelpers.generateToken(chauffeur._id);
  });

  describe("POST /api/auth/register", () => {
    it("devrait créer un nouveau chauffeur", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "New Chauffeur",
        email: "newchauffeur@test.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("chauffeur");
    });

    it("devrait échouer si l'email existe déjà", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test",
        email: "duplicate@test.com",
        password: "pass123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Test2",
        email: "duplicate@test.com",
        password: "pass456",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("devrait se connecter avec des identifiants valides", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: chauffeur.email,
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("devrait échouer avec un mauvais mot de passe", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: chauffeur.email,
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("devrait retourner le profil de l'utilisateur connecté", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${chauffeurToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("devrait échouer sans token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });
  });
});
