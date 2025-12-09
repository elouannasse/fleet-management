const { ROLES } = require("../utils/constants");
const ResponseHandler = require("../utils/responseHandler");


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseHandler.unauthorized(res, "Utilisateur non authentifié");
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(
        res,
        `Accès refusé. Rôle requis: ${roles.join(" ou ")}`
      );
    }

    next();
  };
};

const adminOnly = authorize(ROLES.ADMIN);

module.exports = {
  authorize,
  adminOnly,
};
