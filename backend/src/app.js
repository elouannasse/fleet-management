const express = require('express');
const cors = require('cors');
const { frontendUrl } = require('./config/env');

const app = express();


app.use(cors({
  origin: frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Fleet Management - Backend démarré ✅',
    version: '1.0.0'
  });
});

// Routes API (on va les ajouter après)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/camions', require('./routes/camionRoutes'));
// etc...

// Middleware de gestion d'erreurs (on va le créer après)
// app.use(require('./middlewares/errorHandler'));

module.exports = app;