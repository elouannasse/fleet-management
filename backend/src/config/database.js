const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

const connectDB = async () => {
  try {
    
    const options = {
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(mongodbUri, options);
    console.log(" MongoDB connecté avec succès");
  } catch (error) {
    console.error(" Erreur de connexion MongoDB:", error.message);

   
    if (error.message.includes("authentication")) {
      console.error("\n  SOLUTION: MongoDB nécessite l'authentification.");
      
    }

    process.exit(1);
  }
};

module.exports = connectDB;
