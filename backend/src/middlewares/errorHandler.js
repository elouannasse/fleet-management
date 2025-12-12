const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Erreur de validation Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error.message = message;
    error.statusCode = 400;
  }

  // Erreur de clé dupliquée (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `Le champ ${field} existe déjà`;
    error.statusCode = 400;
  }

  // Erreur CastError de Mongoose
  if (err.name === "CastError") {
    error.message = `Ressource avec l'ID ${err.value} invalide`;
    error.statusCode = 400;
  }

  // Erreur JWT
  if (err.name === "JsonWebTokenError") {
    error.message = "Token d'authentification invalide";
    error.statusCode = 401;
  }

  // Token expiré
  if (err.name === "TokenExpiredError") {
    error.message = "Token d'authentification expiré";
    error.statusCode = 401;
  }

  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    error: error.message || err.message || "Erreur serveur",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
