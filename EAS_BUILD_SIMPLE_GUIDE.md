# 🚀 Guide Simplifié - Build APK avec Expo EAS

## ✅ Configuration Complète

Votre projet est maintenant configuré correctement pour EAS Build!

### Fichiers configurés:
- ✅ `app.json` - Package: `com.sid.taxeparking`, Version: 3.3.0
- ✅ `eas.json` - Build type: APK, Distribution: Internal
- ✅ EAS CLI - Mis à jour vers la dernière version

---

## 🎯 Commande de Build

### Build APK de Test (Preview)
```bash
cd mob-temp
eas build -p android --profile preview
```

### Build APK de Production
```bash
eas build -p android --profile production
```

### Options Utiles
```bash
# Avec cache clear (si problème)
eas build -p android --profile preview --clear-cache

# Sans attendre (build en arrière-plan)
eas build -p android --profile preview --no-wait

# Avec verbose (plus de logs)
eas build -p android --profile preview --verbose
```

---

## 📊 Vérifier le Statut du Build

### Méthode 1: Commande
```bash
eas build:list --limit 1
```

### Méthode 2: Script PowerShell
```powershell
.\check-build-status.ps1
```

### Méthode 3: Web Dashboard
https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds

---

## ⏱️ Temps de Build

- **Build complet**: 10-15 minutes
- **Avec cache**: 5-8 minutes

**Astuce**: Vous pouvez fermer le terminal, le build continue dans le cloud!

---

## 📥 Télécharger l'APK

### Après le build réussi:

**Méthode 1: Via commande**
```bash
eas build:download --latest --platform android --output sid-taxe-parking.apk
```

**Méthode 2: Via web**
1. Aller sur https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds
2. Cliquer sur le dernier build réussi
3. Cliquer sur "Download"

---

## ❌ Si le Build Échoue

### 1. Voir les logs détaillés
Aller sur: https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds
Cliquer sur le build échoué → Phase "Run gradlew" → Copier l'erreur

### 2. Erreurs communes et solutions

#### "Gradle build failed with unknown error"
```bash
# Solution: Clear cache et rebuild
eas build -p android --profile preview --clear-cache
```

#### "Entity not authorized"
```bash
# Solution: Vérifier que vous êtes connecté au bon compte
eas whoami
eas logout
eas login
```

#### "Out of memory"
```json
// Ajouter dans eas.json > build > preview > android:
{
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleRelease --max-workers=2"
  }
}
```

#### "Dependencies resolution failed"
```bash
# Solution: Nettoyer et réinstaller
cd mob-temp
rm -rf node_modules package-lock.json
npm install
eas build -p android --profile preview
```

---

## 🔄 Workflow de Build Complet

```bash
# 1. Vérifier la connexion
eas whoami

# 2. Lancer le build
cd mob-temp
eas build -p android --profile preview

# 3. Attendre (ou Ctrl+C pour détacher)
# Le build continue dans le cloud

# 4. Vérifier le statut
eas build:list --limit 1

# 5. Une fois terminé, télécharger
eas build:download --latest --platform android --output sid-taxe-parking-v3.3.0.apk
```

---

## 📱 Tester l'APK

### Sur appareil physique:

1. **Activer sources inconnues**
   - Paramètres → Sécurité → Sources inconnues → Activer

2. **Transférer l'APK**
   ```bash
   # Via ADB
   adb install sid-taxe-parking-v3.3.0.apk
   
   # Ou copier sur l'appareil et installer manuellement
   ```

3. **Installer et tester**

---

## 🎨 Personnaliser le Build

### Changer la version
Dans `app.json`:
```json
{
  "expo": {
    "version": "3.3.1",  // Version humaine
    "android": {
      "versionCode": 2   // Code numérique (doit augmenter)
    }
  }
}
```

### Changer le nom du package
Dans `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.sid.taxeparking"
    }
  }
}
```

⚠️ **Attention**: Changer le package crée une nouvelle app (l'ancienne sera considérée différente)

---

## 📝 Checklist Avant Build

- [ ] Version incrémentée dans `app.json`
- [ ] `versionCode` incrémenté
- [ ] Testé en développement (`expo start`)
- [ ] Connecté à EAS (`eas whoami`)
- [ ] Toutes les modifications commitées (recommandé)

---

## 🆘 Support

### En cas de problème persistant:

1. **Consulter les logs EAS** (lien fourni après le build)
2. **Chercher l'erreur sur**: https://forums.expo.dev/
3. **Documentation EAS**: https://docs.expo.dev/build/introduction/

---

## 🎯 Commandes Rapides

```bash
# Build
eas build -p android --profile preview

# Statut
eas build:list --limit 1

# Télécharger
eas build:download --latest --platform android

# Logs
eas build:view [BUILD_ID]

# Annuler un build
eas build:cancel [BUILD_ID]
```

---

**Créé le**: 14 octobre 2025  
**Application**: SID Mobile - Taxe Parking v3.3.0  
**EAS CLI**: 16.22.0+
