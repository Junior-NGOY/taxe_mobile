# 📱 SID Mobile - Application de Taxation de Parking

## 📖 Description

Application mobile React Native/Expo pour la collecte des taxes de stationnement avec impression de factures, mode hors ligne et synchronisation avec le backend.

**Version**: 3.3.0  
**Plateforme**: Android (React Native)  
**Framework**: Expo SDK 54

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Expo Go (pour tests sur appareil)

### Installation

```bash
# Cloner le projet
cd mob-temp

# Installer les dépendances
npm install

# Lancer en développement
npm start

# Scanner le QR code avec Expo Go
```

---

## 📚 Documentation

### Guides de Déploiement

| Guide | Description | Pour qui |
|-------|-------------|----------|
| **[QUICK_DEPLOYMENT_GUIDE.md](./QUICK_DEPLOYMENT_GUIDE.md)** | 🚀 Guide rapide de déploiement | Démarrage rapide |
| **[BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)** | 📦 Build et distribution APK | Configuration détaillée |
| **[UNINSTALL_PROTECTION_GUIDE.md](./UNINSTALL_PROTECTION_GUIDE.md)** | 🔒 Protection contre désinstallation | Sécurité avancée |

### Guides Techniques

| Guide | Description |
|-------|-------------|
| **[RESET_APP_GUIDE.md](./RESET_APP_GUIDE.md)** | Réinitialisation de l'application |
| **[LOGIN_OPTIMIZATION.md](./LOGIN_OPTIMIZATION.md)** | Optimisation de la connexion |
| **[INVOICE_AMOUNT_UPDATE.md](./INVOICE_AMOUNT_UPDATE.md)** | Affichage des montants de factures |

---

## 🏗️ Architecture

### Structure du Projet

```
mob-temp/
├── screens/          # Écrans de l'application
│   ├── LoginScreen.tsx          # Authentification
│   ├── TabOneScreen.tsx         # Création de factures
│   ├── TabTwoScreen.tsx         # Résumé de session
│   ├── CheckInvoiceScreen.tsx   # Liste des factures
│   └── SettingsScreen.tsx       # Paramètres
├── context/          # Gestion d'état (Context API)
│   ├── authContext.tsx          # Authentification
│   ├── dataContext.tsx          # Données locales
│   ├── workSession.tsx          # Session de travail
│   └── useInvoice.ts            # Logique factures
├── navigation/       # Navigation React Navigation
├── components/       # Composants réutilisables
├── synchronisation/  # Sync avec le backend
├── offline/          # Gestion mode hors ligne
├── local-storage/    # Stockage local AsyncStorage
├── invoice-templates/# Templates d'impression
├── utils/            # Utilitaires
└── api/              # Configuration API

```

### Flux de Données

```
┌─────────────────────────────────────────────────┐
│  1. Démarrage App                               │
│     ↓                                           │
│  2. Chargement données locales (AsyncStorage)   │
│     ↓                                           │
│  3. Login Percepteur/Superviseur                │
│     ↓                                           │
│  4. Synchronisation (si connexion)              │
│     ↓                                           │
│  5. Mode Hors Ligne                             │
│     ├─ Création factures                        │
│     ├─ Impression Bluetooth                     │
│     └─ Stockage local                           │
│     ↓                                           │
│  6. Clôture de Session                          │
│     ↓                                           │
│  7. Upload vers Backend (synchronisation)       │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Fonctionnalités Principales

### Mode Percepteur
- ✅ Création de factures de stationnement
- ✅ Scan QR code pour vérification
- ✅ Impression Bluetooth automatique
- ✅ Compteur de factures en temps réel
- ✅ Gestion des duplicatas
- ✅ Mode hors ligne complet

### Mode Superviseur
- ✅ Consultation des factures
- ✅ Recherche par matricule
- ✅ Statistiques de session
- ✅ Export des données
- ✅ Vérification d'authenticité

### Synchronisation
- ✅ Téléchargement initial des données (sites, tarifs, percepteurs)
- ✅ Fonctionnement hors ligne
- ✅ Upload des factures en fin de journée
- ✅ Gestion des conflits

---

## 🔧 Configuration

### API Backend

Configurer les URLs dans `api/config.js`:

```javascript
export const PROD_BASE_URL = 'https://votre-backend-production.com';
export const TEST_BASE_URL = 'https://votre-backend-test.com';
export const LOCAL_BASE_URL = 'http://192.168.1.100:4000';
```

### Environnement

L'application détecte automatiquement l'environnement selon le code device:
- **Production**: Codes device réels (LUB001, KIN330, etc.)
- **Test**: Code device "TEST"
- **Local**: Code device "LOCAL"

---

## 🎨 Personnalisation

### Templates de Factures

Les templates d'impression sont stockés côté backend et téléchargés lors de la synchronisation.

Format: HTML avec variables dynamiques
```html
<div>
  <h1>{{siteName}}</h1>
  <p>Matricule: {{vehicleNumber}}</p>
  <p>Montant: {{amount}} CDF</p>
  <p>Date: {{date}}</p>
</div>
```

Variables disponibles:
- `{{siteName}}` - Nom du site
- `{{vehicleNumber}}` - Numéro du véhicule
- `{{amount}}` - Montant de la facture
- `{{date}}` - Date et heure
- `{{perceptorName}}` - Nom du percepteur
- `{{invoiceNumber}}` - Numéro de facture

---

## 🔐 Sécurité

### Authentification
- Mode Percepteur: Mot de passe uniquement
- Mode Superviseur: Login + Mot de passe
- Support bcrypt pour mots de passe hachés
- Comparaison asynchrone (optimisée)

### Stockage Local
- AsyncStorage chiffré (react-native-paper)
- Données sensibles jamais en clair
- Nettoyage automatique après upload

### Protection de l'Application
- Mode kiosque (Device Owner) pour POS dédiés
- Blocage de désinstallation
- Alertes de sécurité au backend

---

## 📊 Performances

### Optimisations Implémentées
- ✅ Bcrypt asynchrone (login rapide)
- ✅ Chargement lazy des images
- ✅ Mémorisation des composants
- ✅ Debouncing des recherches
- ✅ Pagination des listes longues

### Métriques
- Démarrage: < 3 secondes
- Login: < 1 seconde (mot de passe clair) / ~300ms (bcrypt)
- Création facture: < 500ms
- Impression: 2-3 secondes

---

## 🧪 Tests

### Tests Manuels

```bash
# Lancer l'app en mode dev
npm start

# Tester avec Expo Go
# Scanner le QR code
```

### Scénarios de Test

1. **Login**
   - [ ] Mode percepteur avec mot de passe correct
   - [ ] Mode percepteur avec mot de passe incorrect
   - [ ] Mode superviseur avec login/password correct
   - [ ] Mode superviseur avec login/password incorrect

2. **Création Facture**
   - [ ] Création facture simple
   - [ ] Création avec impression Bluetooth
   - [ ] Détection de duplicata
   - [ ] Compteur incrémenté

3. **Mode Hors Ligne**
   - [ ] Création factures sans connexion
   - [ ] Stockage local persistant
   - [ ] Synchronisation après reconnexion

4. **Clôture Session**
   - [ ] Upload des factures
   - [ ] Calcul des totaux
   - [ ] Réinitialisation du compteur

---

## 🚀 Build et Déploiement

### Build APK de Production

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter
eas login

# 3. Build
eas build --platform android --profile production

# 4. Télécharger l'APK depuis expo.dev
```

Voir **[BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)** pour les détails complets.

### Distribution

**Recommandation**: Héberger sur votre propre serveur web

```
https://votre-domaine.com/downloads/sid-taxe-parking-v3.3.0.apk
```

---

## 🔒 Protection contre Désinstallation

Pour les POS dédiés, configurer le **mode Device Owner**:

```bash
# 1. Factory reset l'appareil
# 2. Installer l'APK via ADB
adb install sid-taxe-parking.apk

# 3. Activer Device Owner
adb shell dpm set-device-owner com.sid.taxeparking/.DeviceAdminReceiver
```

Voir **[UNINSTALL_PROTECTION_GUIDE.md](./UNINSTALL_PROTECTION_GUIDE.md)** pour les détails complets.

---

## 🆘 Dépannage

### Erreurs Courantes

**Problème**: "Network request failed"
```bash
# Solution: Vérifier l'URL du backend dans api/config.js
# Vérifier la connexion réseau
```

**Problème**: "Bluetooth printer not found"
```bash
# Solution: Vérifier que le Bluetooth est activé
# Vérifier que l'imprimante est appairée
# Redémarrer l'application
```

**Problème**: "Storage full"
```bash
# Solution: Réinitialiser l'application
npm run reset

# Ou depuis l'app: Paramètres → Réinitialiser
```

### Logs de Debug

```bash
# Afficher les logs en temps réel
npx react-native log-android

# Ou dans l'app
console.log('Debug:', variable);
```

---

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Commit
git commit -m "feat: description de la fonctionnalité"

# Push
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request
```

### Conventions de Code

- TypeScript strict
- Composants fonctionnels avec hooks
- Context API pour l'état global
- React Native Paper pour l'UI
- Commentaires en français

---

## 📦 Dépendances Principales

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "react-native-paper": "^5.12.5",
  "react-navigation": "^6.x",
  "bcryptjs": "^3.0.2",
  "date-fns": "^3.6.0",
  "expo-print": "~15.0.7",
  "expo-barcode-scanner": "~13.0.1"
}
```

---

## 📞 Support

### Contacts

- **Développeur**: [Votre équipe]
- **Email**: support@sid-parking.com
- **Documentation**: [Wiki interne]

### Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

---

## 📝 Changelog

### Version 3.3.0 (13 octobre 2025)

#### Ajouté
- ✅ Affichage du montant dans la liste des factures (mode superviseur)
- ✅ Optimisation du login avec bcrypt asynchrone
- ✅ Guides de déploiement complets

#### Amélioré
- ✅ Performance du login (300x plus rapide pour mots de passe clairs)
- ✅ UI du bouton de connexion avec indicateur de chargement
- ✅ Protection contre les double-clics

#### Corrigé
- ✅ Blocage de l'interface lors du login
- ✅ Montants manquants dans la liste des factures

### Version 3.2.0
- Synchronisation améliorée
- Support des templates personnalisés
- Mode kiosque

### Version 3.1.0
- Première version stable
- Mode hors ligne
- Impression Bluetooth

---

## 📄 Licence

Propriétaire - SID Parking System  
Tous droits réservés © 2025

---

**Dernière mise à jour**: 13 octobre 2025  
**Auteur**: Équipe SID  
**Application**: SID Mobile - Taxe Parking
