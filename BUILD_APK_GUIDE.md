# Guide de Build et Déploiement APK - Application Mobile Taxe Parking

## 🎯 Objectif
Créer un fichier APK Android distributable en ligne pour l'application de taxation de parking.

---

## 📋 Prérequis

### 1. Compte Expo/EAS
- Créer un compte sur [expo.dev](https://expo.dev)
- Installer EAS CLI: `npm install -g eas-cli`
- Se connecter: `eas login`

### 2. Configuration du projet
Vérifier que le fichier `app.json` contient les bonnes informations:

```json
{
  "expo": {
    "name": "SID Taxe Parking",
    "slug": "sid-taxe-parking",
    "version": "1.0.0",
    "android": {
      "package": "com.sid.taxeparking",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_CONNECT"
      ]
    }
  }
}
```

---

## 🚀 Méthodes de Build

### **Méthode 1: EAS Build (Recommandée) ⭐**

#### Avantages:
- ✅ Build dans le cloud (pas besoin d'Android Studio)
- ✅ Signature automatique
- ✅ Compatible avec tous les OS (Windows, Mac, Linux)
- ✅ Téléchargement direct du APK

#### Étapes:

**1. Initialiser EAS dans le projet**
```bash
cd mob-temp
eas build:configure
```

**2. Créer le build APK**
```bash
# Build APK pour distribution interne (pas Google Play)
eas build --platform android --profile preview
```

Options de profil dans `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**3. Suivre le build**
- Ouvrir le lien fourni dans le terminal
- Attendre la fin du build (~5-15 minutes)
- Télécharger le APK depuis le dashboard EAS

**4. Distribuer le APK**
- Héberger sur votre serveur web
- Partager via Google Drive / Dropbox
- Utiliser un service comme Firebase App Distribution

---

### **Méthode 2: Expo Build (Classique)**

**Attention**: Cette méthode est dépréciée, utilisez EAS à la place.

```bash
expo build:android -t apk
```

---

### **Méthode 3: Build Local (Avancé)**

#### Prérequis:
- Android Studio installé
- Android SDK configuré
- Java JDK 11+

#### Commandes:
```bash
# Générer le projet Android natif
npx expo prebuild --platform android

# Build avec Gradle
cd android
./gradlew assembleRelease

# APK généré dans:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Configuration de Signature (Production)

Pour les builds de production, créer un keystore:

```bash
# Générer un keystore
keytool -genkeypair -v -storetype PKCS12 -keystore sid-taxe-parking.keystore -alias sid-key -keyalg RSA -keysize 2048 -validity 10000

# Configurer dans eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "credentialsSource": "local"
      }
    }
  }
}
```

**⚠️ IMPORTANT**: Sauvegarder le keystore et le mot de passe en lieu sûr!

---

## 🌐 Hébergement et Distribution

### Option 1: Serveur Web Simple
```nginx
# Créer un lien de téléchargement direct
https://votre-domaine.com/downloads/sid-taxe-parking-v1.0.0.apk
```

### Option 2: Firebase App Distribution (Gratuit)
```bash
npm install -g firebase-tools
firebase login
firebase appdistribution:distribute app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers"
```

### Option 3: GitHub Releases
- Créer une release sur GitHub
- Attacher le fichier APK
- Lien: `https://github.com/USERNAME/REPO/releases/download/v1.0.0/app.apk`

### Option 4: Service Cloud (Google Drive, Dropbox)
- Uploader le APK
- Créer un lien partageable public
- Raccourcir avec bit.ly si nécessaire

---

## 📱 Installation sur les appareils

### Pour les utilisateurs finaux:

1. **Activer les sources inconnues**
   - Paramètres → Sécurité → Autoriser les sources inconnues
   - OU lors de l'installation: Cliquer "Autoriser cette source"

2. **Télécharger le APK**
   - Via navigateur web ou QR code
   - Chrome peut bloquer → Cliquer "Télécharger quand même"

3. **Installer**
   - Ouvrir le fichier téléchargé
   - Cliquer "Installer"
   - Ouvrir l'application

---

## 🔄 Mises à jour

### Workflow de versioning:

1. **Incrémenter la version dans `app.json`**
```json
{
  "expo": {
    "version": "1.0.1",  // Version humaine
    "android": {
      "versionCode": 2   // Code numérique (doit augmenter)
    }
  }
}
```

2. **Rebuild et redistribuer**
```bash
eas build --platform android --profile preview
```

3. **Nommer les APK avec la version**
```
sid-taxe-parking-v1.0.1.apk
```

### Système de mise à jour automatique (futur):
- Implémenter `expo-updates` pour les mises à jour OTA (Over-The-Air)
- Ne nécessite pas de re-téléchargement du APK
- Mises à jour automatiques au démarrage

---

## 🧪 Tests avant distribution

### Checklist de test:

- [ ] Test sur plusieurs appareils Android (différentes versions)
- [ ] Test hors ligne (mode avion)
- [ ] Test de l'imprimante Bluetooth
- [ ] Test de synchronisation avec le backend
- [ ] Vérifier les permissions (caméra, Bluetooth)
- [ ] Test du scanner QR code
- [ ] Test de la génération de factures
- [ ] Test de clôture de session

### Environnements:
```javascript
// api/config.js
export const PROD_BASE_URL = 'https://votre-backend-production.com';
export const TEST_BASE_URL = 'https://votre-backend-test.com';
export const LOCAL_BASE_URL = 'http://192.168.1.100:4000';
```

---

## 📊 Sizing et Optimisation

### Réduire la taille du APK:

1. **Activer ProGuard/R8**
```json
// app.json
{
  "expo": {
    "android": {
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
    }
  }
}
```

2. **Supprimer les dépendances inutilisées**
```bash
npm prune --production
```

3. **Optimiser les images**
- Compresser les assets
- Utiliser WebP au lieu de PNG

### Taille cible:
- **Sans optimisation**: ~50-80 MB
- **Avec optimisation**: ~20-40 MB

---

## 🔒 Sécurité

### Bonnes pratiques:

1. **Variables d'environnement**
```javascript
// Ne jamais commit les clés API en clair
const API_KEY = process.env.API_KEY;
```

2. **Obfuscation du code**
- Activer ProGuard (build de production)
- Rend le reverse engineering plus difficile

3. **Certificat SSL/TLS**
- Toujours utiliser HTTPS pour l'API
- Pinning de certificat (avancé)

4. **Signature de l'APK**
- Toujours signer les builds de production
- Ne jamais partager le keystore

---

## 📝 Script de Build Automatisé

Créer un fichier `build.sh`:

```bash
#!/bin/bash

# Script de build automatisé pour SID Taxe Parking

echo "🚀 Démarrage du build APK..."

# Variables
VERSION=$(node -p "require('./app.json').expo.version")
BUILD_TYPE="preview"

# Vérifier EAS CLI
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI non installé. Installation..."
    npm install -g eas-cli
fi

# Login EAS
echo "🔐 Connexion à EAS..."
eas login

# Build
echo "🏗️  Build APK version $VERSION..."
eas build --platform android --profile $BUILD_TYPE --non-interactive

echo "✅ Build terminé!"
echo "📥 Téléchargez votre APK depuis: https://expo.dev/accounts/VOTRE_COMPTE/projects/sid-taxe-parking/builds"
```

Utilisation:
```bash
chmod +x build.sh
./build.sh
```

---

## 🆘 Troubleshooting

### Problème: "App not installed"
**Solution**: 
- Désinstaller l'ancienne version
- Vérifier que le `versionCode` est supérieur
- Vérifier que le package name est le même

### Problème: Build échoue sur EAS
**Solution**:
- Vérifier `eas.json` et `app.json`
- Vérifier les dépendances dans `package.json`
- Consulter les logs sur expo.dev

### Problème: APK trop volumineux
**Solution**:
- Activer ProGuard
- Supprimer les assets non utilisés
- Utiliser des App Bundles (.aab) au lieu de APK

### Problème: Permissions manquantes
**Solution**:
```json
// app.json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_CONNECT",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

---

## 📚 Ressources

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Android App Distribution](https://developer.android.com/studio/publish)
- [Expo Configuration Reference](https://docs.expo.dev/versions/latest/config/app/)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)

---

## ✅ Commandes rapides

```bash
# Build APK de test
eas build --platform android --profile preview

# Build APK de production
eas build --platform android --profile production

# Vérifier le statut du build
eas build:list

# Télécharger le dernier build
eas build:download --platform android
```

---

**Créé le**: 13 octobre 2025  
**Version du guide**: 1.0  
**Application**: SID Mobile - Taxe Parking
