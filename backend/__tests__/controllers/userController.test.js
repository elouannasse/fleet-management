const request = require("supertest");
const app = require("../../src/app");

describe("UserController", () => {
  let admin, adminToken, chauffeur, chauffeurToken;

  beforeEach(async () => {
    admin = await global.testHelpers.createTestAdmin();
    adminToken = global.testHelpers.generateToken(admin._id);
    chauffeur = await global.testHelpers.createTestUser({ role: "chauffeur" });
    chauffeurToken = global.testHelpers.generateToken(chauffeur._id);
  });

  describe("GET /api/users", () => {
    it("devrait retourner tous les utilisateurs pour un admin", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toHaveLength(2);
    });

    it("devrait refuser l'accès à un chauffeur", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${chauffeurToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/users/:id", () => {
    it("devrait retourner un utilisateur par son ID", async () => {
      const res = await request(app)
        .get(`/api/users/${chauffeur._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(chauffeur.email);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("devrait mettre à jour un utilisateur", async () => {
      const res = await request(app)
        .put(`/api/users/${chauffeur._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe("Updated Name");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("devrait supprimer un utilisateur", async () => {
      const res = await request(app)
        .delete(`/api/users/${chauffeur._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
