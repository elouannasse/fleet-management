

const mongoose = require("mongoose");
const User = require("../src/models/User");
const { mongoUri } = require("../src/config/env");

const createAdmin = async () => {
  try {
   
    console.log(" Connexion à MongoDB...");
    await mongoose.connect(mongoUri);
    console.log(" Connecté à MongoDB\n");

    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fleet.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
    const adminName = process.env.ADMIN_NAME || "Administrateur";

   
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("  Un administrateur avec cet email existe déjà");
      console.log(` Email: ${adminEmail}`);
      console.log(` Nom: ${existingAdmin.name}`);
      console.log(` Rôle: ${existingAdmin.role}`);
      console.log(` Actif: ${existingAdmin.isActive ? "Oui" : "Non"}`);
      console.log(
        "\n💡 Astuce: Utilisez une autre adresse email ou supprimez l'admin existant\n"
      );
      process.exit(0);
    }

   
    console.log(" Création du compte administrateur...");
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    console.log("\n Administrateur créé avec succès!\n");
    console.log(" Informations du compte:");
    console.log("─".repeat(50));
    console.log(` Nom:       ${admin.name}`);
    console.log(` Email:     ${admin.email}`);
    console.log(` Password:  ${adminPassword}`);
    console.log(` Rôle:      ${admin.role}`);
    console.log(`🆔 ID:        ${admin._id}`);
    console.log("─".repeat(50));
    console.log("\n⚠️  IMPORTANT: Conservez ces informations en lieu sûr!");
    console.log(
      "💡 Conseil: Changez le mot de passe après la première connexion\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("\n Erreur lors de la création de l'administrateur:");
    console.error(error.message);

    if (error.name === "ValidationError") {
      console.error("\n Détails de validation:");
      Object.values(error.errors).forEach((err) => {
        console.error(`  - ${err.message}`);
      });
    }

    if (error.code === 11000) {
      console.error("\n  Cet email est déjà utilisé dans la base de données");
    }

    console.error("\n");
    process.exit(1);
  }
};

createAdmin();
