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

  // 🆕 Tests pour POST /api/users (création utilisateur)
  describe("POST /api/users", () => {
    it("devrait créer un nouvel utilisateur (chauffeur par défaut)", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Nouveau Chauffeur",
          email: "nouveau@test.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("nouveau@test.com");
      expect(res.body.data.user.role).toBe("chauffeur");
      expect(res.body.data.user.password).toBeUndefined(); // Password ne doit pas être retourné
    });

    it("devrait créer un nouvel admin", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Nouvel Admin",
          email: "newadmin@test.com",
          password: "admin123",
          role: "admin",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe("admin");
    });

    it("devrait échouer si l'email existe déjà", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test",
          email: chauffeur.email, // Email déjà utilisé
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("email");
    });

    it("devrait échouer avec des données invalides", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Te", // Trop court (min 3 caractères)
          email: "invalid-email", // Email invalide
          password: "123", // Trop court (min 6 caractères)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("devrait refuser l'accès à un chauffeur", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${chauffeurToken}`)
        .send({
          name: "Test",
          email: "test@test.com",
          password: "password123",
        });

      expect(res.status).toBe(403);
    });
  });

  // 🆕 Tests pour protection anti-auto-destruction
  describe("Protection anti-auto-destruction", () => {
    it("devrait empêcher un admin de modifier son propre rôle", async () => {
      const res = await request(app)
        .put(`/api/users/${admin._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          role: "chauffeur",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("propre rôle");
    });

    it("devrait empêcher un admin de se désactiver lui-même", async () => {
      const res = await request(app)
        .put(`/api/users/${admin._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          isActive: false,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("désactiver");
    });

    it("devrait empêcher un admin de se supprimer lui-même", async () => {
      const res = await request(app)
        .delete(`/api/users/${admin._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("supprimer");
    });

    it("devrait permettre de modifier d'autres champs sans problème", async () => {
      const res = await request(app)
        .put(`/api/users/${admin._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Admin Updated",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe("Admin Updated");
    });
  });
});
