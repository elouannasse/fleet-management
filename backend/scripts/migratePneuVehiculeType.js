/**
 * Migration script to fix vehiculeType values in database
 * Converts 'camion' -> 'Camion' and 'remorque' -> 'Remorque'
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { mongodbUri } = require("../src/config/env");

async function migratePneus() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(mongodbUri);
    console.log("✅ Connecté à MongoDB");

    const db = mongoose.connection.db;
    const pneusCollection = db.collection("pneus");

    // Find all pneus with lowercase vehiculeType
    const pneusToUpdate = await pneusCollection
      .find({
        vehiculeType: { $in: ["camion", "remorque"] },
      })
      .toArray();

    console.log(
      `\n📊 Pneus trouvés avec vehiculeType en minuscules: ${pneusToUpdate.length}`
    );

    if (pneusToUpdate.length === 0) {
      console.log(
        "✅ Aucune migration nécessaire. Toutes les données sont déjà correctes."
      );
      process.exit(0);
    }

    // Update each pneu
    let updatedCount = 0;
    for (const pneu of pneusToUpdate) {
      const capitalizedType =
        pneu.vehiculeType.charAt(0).toUpperCase() +
        pneu.vehiculeType.slice(1).toLowerCase();

      await pneusCollection.updateOne(
        { _id: pneu._id },
        { $set: { vehiculeType: capitalizedType } }
      );

      updatedCount++;
      console.log(
        `✓ Mis à jour: ${pneu.vehiculeType} -> ${capitalizedType} (ID: ${pneu._id})`
      );
    }

    console.log(`\n✅ Migration terminée avec succès!`);
    console.log(`📈 ${updatedCount} pneus mis à jour`);

    // Verify the results
    const remainingLowercase = await pneusCollection.countDocuments({
      vehiculeType: { $in: ["camion", "remorque"] },
    });

    if (remainingLowercase === 0) {
      console.log(
        "✅ Vérification: Tous les vehiculeType sont maintenant capitalisés"
      );
    } else {
      console.log(
        `⚠️  Attention: ${remainingLowercase} pneus ont encore des valeurs en minuscules`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  }
}

// Run migration
migratePneus();
