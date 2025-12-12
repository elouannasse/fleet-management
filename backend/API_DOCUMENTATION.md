# API Documentation - Fleet Management Backend

## Base URL
```
http://localhost:5000/api
```

## Authentication
Toutes les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Routes

### POST /auth/register
Inscription d'un nouveau chauffeur
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "password": "motdepasse123",
  "telephone": "0123456789",
  "numeroPermis": "123456789"
}
```

### POST /auth/login
Connexion utilisateur
```json
{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@email.com",
    "role": "chauffeur"
  }
}
```

### GET /auth/me
Récupérer les informations de l'utilisateur connecté
**Headers:** `Authorization: Bearer <token>`

---

## 👥 Users Routes

### GET /users
Récupérer tous les utilisateurs (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /users/chauffeurs
Récupérer tous les chauffeurs
**Headers:** `Authorization: Bearer <token>`

### GET /users/:id
Récupérer un utilisateur par ID (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### PUT /users/:id
Modifier un utilisateur (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /users/:id
Supprimer un utilisateur (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🚛 Camions Routes

### GET /camions
Récupérer tous les camions
**Headers:** `Authorization: Bearer <token>`

### GET /camions/disponibles
Récupérer les camions disponibles
**Headers:** `Authorization: Bearer <token>`

### GET /camions/:id
Récupérer un camion par ID
**Headers:** `Authorization: Bearer <token>`

### POST /camions
Créer un nouveau camion (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "immatriculation": "ABC-123-DE",
  "marque": "Volvo",
  "modele": "FH16",
  "annee": 2020,
  "kilometrage": 50000,
  "capaciteCarburant": 400,
  "consommationMoyenne": 35,
  "statut": "disponible"
}
```

### PUT /camions/:id
Modifier un camion (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /camions/:id
Supprimer un camion (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🚚 Remorques Routes

### GET /remorques
Récupérer toutes les remorques
**Headers:** `Authorization: Bearer <token>`

### GET /remorques/disponibles
Récupérer les remorques disponibles
**Headers:** `Authorization: Bearer <token>`

### GET /remorques/:id
Récupérer une remorque par ID
**Headers:** `Authorization: Bearer <token>`

### POST /remorques
Créer une nouvelle remorque (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "immatriculation": "REM-123-DE",
  "type": "frigorifique",
  "capacite": 25000,
  "statut": "disponible"
}
```

### PUT /remorques/:id
Modifier une remorque (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /remorques/:id
Supprimer une remorque (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🛞 Pneus Routes

### GET /pneus
Récupérer tous les pneus
**Headers:** `Authorization: Bearer <token>`

### GET /pneus/vehicule/:vehiculeType/:vehiculeId
Récupérer les pneus d'un véhicule
**Headers:** `Authorization: Bearer <token>`

### GET /pneus/:id
Récupérer un pneu par ID
**Headers:** `Authorization: Bearer <token>`

### POST /pneus
Créer un nouveau pneu (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "marque": "Michelin",
  "modele": "XZE2+",
  "dimension": "315/80R22.5",
  "position": "avant_gauche",
  "vehiculeType": "camion",
  "vehiculeId": "camion_id",
  "kilometrageInstallation": 100000,
  "pressionRecommandee": 9.0,
  "statut": "bon"
}
```

### PUT /pneus/:id
Modifier un pneu (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /pneus/:id
Supprimer un pneu (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🛣️ Trajets Routes

### GET /trajets
Récupérer tous les trajets
**Headers:** `Authorization: Bearer <token>`

### GET /trajets/mes-trajets
Récupérer les trajets du chauffeur connecté (Chauffeur seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /trajets/stats
Récupérer les statistiques des trajets (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /trajets/:id
Récupérer un trajet par ID
**Headers:** `Authorization: Bearer <token>`

### POST /trajets
Créer un nouveau trajet (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "chauffeurId": "user_id",
  "camionId": "camion_id",
  "remorqueId": "remorque_id",
  "lieuDepart": "Paris",
  "lieuArrivee": "Lyon",
  "dateDepart": "2024-01-15T08:00:00Z",
  "dateArriveePrevu": "2024-01-15T14:00:00Z",
  "distancePrevue": 465,
  "carburantDepart": 300,
  "description": "Transport de marchandises"
}
```

### PUT /trajets/:id
Modifier un trajet (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### PATCH /trajets/:id/status
Mettre à jour le statut d'un trajet
**Headers:** `Authorization: Bearer <token>`
```json
{
  "statut": "en_cours",
  "carburantArrivee": 250,
  "kilometrageFin": 100500
}
```

### GET /trajets/:id/pdf
Générer un PDF du trajet
**Headers:** `Authorization: Bearer <token>`

### DELETE /trajets/:id
Supprimer un trajet (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🔧 Maintenances Routes

### GET /maintenances
Récupérer toutes les maintenances (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /maintenances/stats
Récupérer les statistiques de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /maintenances/vehicule/:vehiculeType/:vehiculeId
Récupérer les maintenances d'un véhicule (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /maintenances/:id
Récupérer une maintenance par ID (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### POST /maintenances
Créer une nouvelle maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "vehiculeType": "camion",
  "vehiculeId": "camion_id",
  "type": "preventive",
  "description": "Vidange moteur",
  "datePrevu": "2024-01-20T09:00:00Z",
  "cout": 150.00,
  "garage": "Garage Central"
}
```

### PUT /maintenances/:id
Modifier une maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /maintenances/:id
Supprimer une maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 📊 Reports Routes

### GET /reports/consumption
Rapport de consommation (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

### GET /reports/kilometrage
Rapport de kilométrage (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

### GET /reports/maintenance
Rapport de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`
**Query params:** `?startDate=2024-01-01&endDate=2024-01-31`

### GET /reports/dashboard
Vue d'ensemble du tableau de bord (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### GET /reports/vehicule/:vehiculeType/:vehiculeId
Rapport détaillé d'un véhicule (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 📋 Maintenance Rules Routes

### GET /maintenance-rules
Récupérer toutes les règles de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### POST /maintenance-rules
Créer une nouvelle règle de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### PUT /maintenance-rules/:id
Modifier une règle de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

### DELETE /maintenance-rules/:id
Supprimer une règle de maintenance (Admin seulement)
**Headers:** `Authorization: Bearer <token>`

---

## 🔒 Rôles et Permissions

### Rôles disponibles :
- **admin** : Accès complet à toutes les fonctionnalités
- **chauffeur** : Accès limité aux trajets assignés

### Permissions par rôle :

#### Admin :
- Gestion complète des utilisateurs
- Gestion des véhicules (camions, remorques, pneus)
- Création et gestion des trajets
- Gestion des maintenances
- Accès aux rapports et statistiques

#### Chauffeur :
- Consultation de ses trajets assignés
- Mise à jour du statut des trajets
- Consultation des véhicules disponibles

---

## 📝 Codes de Statut

### Statuts des véhicules :
- `disponible`
- `en_mission`
- `en_maintenance`
- `hors_service`

### Statuts des trajets :
- `planifie`
- `en_cours`
- `termine`
- `annule`

### Statuts des maintenances :
- `planifie`
- `en_cours`
- `termine`
- `reporte`

### Types de maintenance :
- `preventive`
- `corrective`
- `urgente`

---

## 🚨 Gestion des Erreurs

### Format de réponse d'erreur :
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Code d'erreur spécifique"
}
```

### Codes d'erreur HTTP :
- `200` : Succès
- `201` : Créé avec succès
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès refusé
- `404` : Ressource non trouvée
- `500` : Erreur serveur

---

## 📋 Exemples d'utilisation Frontend

### Connexion et stockage du token :
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};
```

### Requête avec authentification :
```javascript
const getCamions = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/camions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

### Création d'un trajet :
```javascript
const createTrajet = async (trajetData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/trajets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(trajetData)
  });
  return response.json();
};
```