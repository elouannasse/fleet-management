# Solution au problème "Schema hasn't been registered for model"

## Problème

L'erreur `"Schema hasn't been registered for model 'camion'"` se produisait lors de l'utilisation de `.populate('vehicule')` dans le modèle Pneu.

## Cause racine

Le modèle Pneu utilise une référence polymorphique avec `refPath: 'vehiculeType'`, mais il y avait un décalage de casse:

- Les valeurs stockées dans `vehiculeType`: `'camion'`, `'remorque'` (minuscules)
- Les modèles Mongoose enregistrés: `'Camion'`, `'Remorque'` (capitalisés)

Mongoose ne trouvait pas le modèle car `'camion'` ≠ `'Camion'`.

## Solution implémentée

### 1. Modèle Pneu (src/models/Pneu.js)

Ajout d'un **setter** sur le champ `vehiculeType` pour normaliser automatiquement la casse:

```javascript
vehiculeType: {
  type: String,
  enum: ['Camion', 'Remorque'],
  required: true,
  set: function(val) {
    // Normalise: 'camion' -> 'Camion', 'remorque' -> 'Remorque'
    if (!val) return val;
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  }
}
```

**Avantages:**

- Accepte `'camion'` ou `'Camion'` en entrée
- Stocke toujours `'Camion'` (capitalisé) en base de données
- Le `refPath: 'vehiculeType'` fonctionne correctement

### 2. Index des modèles (src/models/index.js)

Création d'un fichier centralisé pour exporter tous les modèles:

```javascript
const User = require("./User");
const Camion = require("./Camion");
const Remorque = require("./Remorque");
const Pneu = require("./Pneu");
const Trajet = require("./Trajet");
const Maintenance = require("./Maintenance");

module.exports = {
  User,
  Camion,
  Remorque,
  Pneu,
  Trajet,
  Maintenance,
};
```

### 3. Chargement des modèles (src/app.js)

Import de tous les modèles au démarrage de l'application:

```javascript
// Import all models to ensure they are registered
require("./models");
```

Ceci garantit que tous les modèles sont enregistrés dans Mongoose **avant** que les controllers ne les utilisent.

### 4. Corrections du Controller (src/controllers/pneuController.js)

Mise à jour pour utiliser les noms capitalisés:

```javascript
// Avant
const VehicleModel = pneu.vehiculeType === "camion" ? Camion : Remorque;

// Après
const VehicleModel = pneu.vehiculeType === "Camion" ? Camion : Remorque;
```

## Utilisation dans les controllers

### Import correct des modèles

```javascript
const Pneu = require("../models/Pneu");
const Camion = require("../models/Camion");
const Remorque = require("../models/Remorque");
```

Ou via l'index:

```javascript
const { Pneu, Camion, Remorque } = require("../models");
```

### Utilisation de populate

```javascript
// Fonctionne maintenant correctement
const pneus = await Pneu.find().populate(
  "vehicule",
  "matricule marque modele statut"
);

// Résultat: vehicule sera un objet Camion ou Remorque complet
```

## Comment créer un Pneu

L'API accepte maintenant les deux formats:

```javascript
// Format 1: Minuscules (sera normalisé automatiquement)
{
  "vehiculeType": "camion",
  "vehicule": "507f1f77bcf86cd799439011",
  ...
}

// Format 2: Capitalisé (recommandé)
{
  "vehiculeType": "Camion",
  "vehicule": "507f1f77bcf86cd799439011",
  ...
}
```

Les deux seront stockés comme `"Camion"` en base de données.

## Tests

Pour vérifier que tout fonctionne:

1. **Créer un pneu avec minuscules:**

```bash
POST /api/pneus
{
  "vehiculeType": "camion",
  "vehicule": "...",
  ...
}
```

2. **Récupérer avec populate:**

```bash
GET /api/pneus
# Le champ vehicule contiendra l'objet Camion complet
```

3. **Vérifier la normalisation:**

```bash
GET /api/pneus/:id
# vehiculeType devrait être "Camion" (capitalisé)
```

## Bonnes pratiques

1. ✅ **Toujours importer tous les modèles au démarrage** (dans app.js ou server.js)
2. ✅ **Utiliser des setters pour normaliser les données** (comme ici pour vehiculeType)
3. ✅ **Créer un index.js dans le dossier models** pour centraliser les exports
4. ✅ **Documenter les valeurs enum** et leur format attendu
5. ✅ **Tester les populate** après chaque modification de schema

## Avantages de cette solution

- ✅ **Rétrocompatible**: Accepte les anciennes valeurs en minuscules
- ✅ **Automatique**: La normalisation se fait sans intervention du controller
- ✅ **Cohérent**: Les données sont toujours stockées dans le même format
- ✅ **Sans migration**: Pas besoin de mettre à jour les données existantes manuellement
- ✅ **Type-safe**: L'enum Mongoose valide toujours les valeurs

## Résolution d'autres erreurs similaires

Si vous rencontrez `"Schema hasn't been registered for model 'X'"`:

1. **Vérifiez la casse** du nom du modèle dans refPath
2. **Assurez-vous que le modèle est importé** avant son utilisation
3. **Vérifiez l'ordre d'import** des modèles (dépendances circulaires)
4. **Utilisez mongoose.model('ModelName')** pour vérifier si le modèle est enregistré

```javascript
// Vérifier si un modèle est enregistré
const mongoose = require("mongoose");
try {
  const Camion = mongoose.model("Camion");
  console.log("✅ Modèle Camion enregistré");
} catch (error) {
  console.log("❌ Modèle Camion non enregistré:", error.message);
}
```
