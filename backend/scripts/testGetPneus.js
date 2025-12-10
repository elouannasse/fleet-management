/**
 * Test script to verify GET /api/pneus endpoint works correctly
 */

const http = require("http");

function testGetPneus() {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/pneus",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  console.log("🧪 Test GET /api/pneus...\n");

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📝 Response:\n`);

      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));

        if (jsonData.success) {
          console.log("\n✅ Test réussi! Le populate fonctionne correctement.");

          if (
            jsonData.data &&
            jsonData.data.pneus &&
            jsonData.data.pneus.length > 0
          ) {
            const firstPneu = jsonData.data.pneus[0];
            console.log(`\n📍 Premier pneu:`);
            console.log(`   - Reference: ${firstPneu.reference}`);
            console.log(`   - VehiculeType: ${firstPneu.vehiculeType}`);
            console.log(
              `   - Vehicule: ${
                firstPneu.vehicule
                  ? `${
                      firstPneu.vehicule.matricule ||
                      "ID: " + firstPneu.vehicule
                    }`
                  : "Non populé"
              }`
            );
          }
        } else {
          console.log("\n❌ Test échoué:", jsonData.message);
        }
      } catch (error) {
        console.log("❌ Erreur de parsing JSON:", error.message);
        console.log("Raw data:", data);
      }

      process.exit(jsonData.success ? 0 : 1);
    });
  });

  req.on("error", (error) => {
    console.error("❌ Erreur de requête:", error.message);
    console.log(
      "\n⚠️  Assurez-vous que le serveur est démarré sur le port 5000"
    );
    process.exit(1);
  });

  req.end();
}

// Wait a bit for server to be ready
setTimeout(testGetPneus, 1000);
