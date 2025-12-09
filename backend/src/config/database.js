const mongoose = require('mongoose');
const { mongodbUri } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbUri);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;