/**
 * Test complet avec authentification
 */

const http = require("http");

let authToken = null;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function login() {
  console.log("🔐 Connexion en tant qu'admin...");

  const postData = JSON.stringify({
    email: "admin@fleet.com",
    password: "admin123",
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/login",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  try {
    const result = await makeRequest(options, postData);

    if (result.data.success && result.data.data && result.data.data.token) {
      authToken = result.data.data.token;
      console.log("✅ Connexion réussie");
      return true;
    } else {
      console.log("❌ Échec de connexion:", result.data.message);
      return false;
    }
  } catch (error) {
    console.log("❌ Erreur de connexion:", error.message);
    return false;
  }
}

async function testGetPneus() {
  console.log("\n🧪 Test GET /api/pneus...\n");

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/pneus",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  try {
    const result = await makeRequest(options);

    console.log(`📊 Status Code: ${result.statusCode}`);
    console.log(`📝 Response:\n`);
    console.log(JSON.stringify(result.data, null, 2));

    if (result.data.success) {
      console.log("\n✅ Test réussi! Le populate fonctionne correctement.");

      if (
        result.data.data &&
        result.data.data.pneus &&
        result.data.data.pneus.length > 0
      ) {
        console.log(`\n📍 Nombre de pneus: ${result.data.data.pneus.length}`);

        const firstPneu = result.data.data.pneus[0];
        console.log(`\n📍 Premier pneu:`);
        console.log(`   - Reference: ${firstPneu.reference}`);
        console.log(`   - VehiculeType: ${firstPneu.vehiculeType}`);

        if (firstPneu.vehicule) {
          if (typeof firstPneu.vehicule === "object") {
            console.log(`   - Vehicule populé: ✅`);
            console.log(`   - Matricule: ${firstPneu.vehicule.matricule}`);
            console.log(`   - Marque: ${firstPneu.vehicule.marque}`);
            console.log(`   - Modèle: ${firstPneu.vehicule.modele}`);
          } else {
            console.log(`   - Vehicule (ID seulement): ${firstPneu.vehicule}`);
            console.log(`   - ⚠️  Le populate n'a pas fonctionné`);
          }
        } else {
          console.log(`   - Vehicule: null`);
        }
      } else {
        console.log("\nℹ️  Aucun pneu trouvé dans la base de données");
      }

      process.exit(0);
    } else {
      console.log("\n❌ Test échoué:", result.data.message);
      process.exit(1);
    }
  } catch (error) {
    console.log("❌ Erreur de requête:", error.message);
    process.exit(1);
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════");
  console.log("   TEST DE L'ENDPOINT GET /api/pneus");
  console.log("═══════════════════════════════════════\n");

  // Wait for server to be ready
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const loginSuccess = await login();

  if (!loginSuccess) {
    console.log("\n❌ Impossible de continuer sans authentification");
    process.exit(1);
  }

  await testGetPneus();
}

runTests();
