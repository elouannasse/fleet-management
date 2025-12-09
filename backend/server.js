const app = require('./src/app');
const connectDB = require('./src/config/database');
const { port } = require('./src/config/env');


connectDB();


app.listen(port, () => {
  console.log(` Serveur démarré sur le port ${port}`);
  console.log(` Environnement: ${process.env.NODE_ENV || 'development'}`);
});