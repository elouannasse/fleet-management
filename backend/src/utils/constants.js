module.exports = {
  ROLES: {
    ADMIN: "admin",
    CHAUFFEUR: "chauffeur",
  },

  TRAJET_STATUS: {
    A_FAIRE: "à faire",
    EN_COURS: "en cours",
    TERMINE: "terminé",
  },

  VEHICULE_STATUS: {
    DISPONIBLE: "disponible",
    EN_SERVICE: "en service",
    EN_MAINTENANCE: "en maintenance",
    HORS_SERVICE: "hors service",
  },

  MAINTENANCE_TYPES: {
    PNEU: "pneu",
    VIDANGE: "vidange",
    REVISION: "revision",
    REPARATION: "reparation",
  },

  MAINTENANCE_STATUS: {
    PLANIFIEE: "planifiée",
    EN_COURS: "en cours",
    TERMINEE: "terminée",
    ANNULEE: "annulée",
  },

  MAINTENANCE_PRIORITY: {
    BASSE: "basse",
    NORMALE: "normale",
    HAUTE: "haute",
    URGENTE: "urgente",
  },

  ALERT_TYPES: {
    PNEU_REMPLACEMENT: "remplacement_pneu",
    VIDANGE: "vidange",
    REVISION: "revision",
    MAINTENANCE_PREVENTIVE: "maintenance_preventive",
  },

  PNEU_ETAT: {
    NEUF: "neuf",
    BON: "bon",
    MOYEN: "moyen",
    USAGE: "usé",
    A_REMPLACER: "à remplacer",
  },
};
