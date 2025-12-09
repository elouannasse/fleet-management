module.exports = {
  // Rôles utilisateurs
  ROLES: {
    ADMIN: 'admin',
    CHAUFFEUR: 'chauffeur'
  },

  // Statuts trajets
  TRAJET_STATUS: {
    A_FAIRE: 'à faire',
    EN_COURS: 'en cours',
    TERMINE: 'terminé'
  },

  // Statuts véhicules
  VEHICULE_STATUS: {
    DISPONIBLE: 'disponible',
    EN_SERVICE: 'en service',
    EN_MAINTENANCE: 'en maintenance',
    HORS_SERVICE: 'hors service'
  },

  // Types de maintenance
  MAINTENANCE_TYPES: {
    PNEU: 'pneu',
    VIDANGE: 'vidange',
    REVISION: 'revision',
    REPARATION: 'reparation'
  },

  // États des pneus
  PNEU_ETAT: {
    NEUF: 'neuf',
    BON: 'bon',
    MOYEN: 'moyen',
    USAGE: 'usé',
    A_REMPLACER: 'à remplacer'
  }
};