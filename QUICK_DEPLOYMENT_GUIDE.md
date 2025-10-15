# Guide Rapide - Build APK et Protection

## 🚀 1. Créer un APK téléchargeable

### Méthode Rapide (EAS Build - Recommandée)

```bash
# 1. Installer EAS CLI
npm install -g eas-cli

# 2. Se connecter
eas login

# 3. Configurer le projet
cd mob-temp
eas build:configure

# 4. Créer le build APK
eas build --platform android --profile preview

# 5. Télécharger l'APK
# Le lien sera affiché dans le terminal
# Télécharger depuis: https://expo.dev
```

### Hébergement du APK

**Option A: Serveur Web**
```bash
# Uploader sur votre serveur
https://votre-domaine.com/downloads/sid-taxe-parking-v1.0.0.apk
```

**Option B: Google Drive / Dropbox**
- Uploader le fichier APK
- Créer un lien partageable public
- Partager le lien aux utilisateurs

**Option C: GitHub Releases**
- Créer une release sur GitHub
- Attacher le fichier APK
- Lien: `https://github.com/USER/REPO/releases/download/v1.0.0/app.apk`

---

## 🔒 2. Protection contre la Désinstallation

### ⚠️ Important
Android ne permet **PAS** de bloquer complètement la désinstallation pour des raisons de sécurité.

### Solutions Disponibles

#### Solution 1: Mode Kiosque (Device Owner) ⭐ RECOMMANDÉE

**Pour**: POS dédiés, appareils propriété de l'entreprise

**Protection**: 🔒🔒🔒 MAXIMALE

**Configuration**:
```bash
# 1. Factory reset l'appareil
# 2. Ne PAS configurer de compte Google
# 3. Activer débogage USB
# 4. Installer l'APK
adb install sid-taxe-parking.apk

# 5. Définir comme Device Owner
adb shell dpm set-device-owner com.sid.taxeparking/.DeviceAdminReceiver

# 6. Lancer l'app → Mode kiosque activé
```

**Résultat**:
- ✅ Désinstallation **totalement bloquée**
- ✅ Paramètres système cachés
- ✅ Une seule app visible (mode kiosque)
- ✅ Contrôle total de l'appareil

---

#### Solution 2: MDM (Mobile Device Management) 🏢

**Pour**: Gestion d'entreprise à grande échelle

**Protection**: 🔒🔒 ÉLEVÉE

**Services**:
- Google Workspace (~5€/appareil/mois)
- Microsoft Intune
- VMware Workspace ONE

**Avantages**:
- ✅ Gestion centralisée
- ✅ Déploiement automatique
- ✅ Mises à jour forcées
- ✅ Effacement à distance

---

#### Solution 3: Device Admin (Partiel) ⚠️

**Pour**: Appareils partagés, BYOD

**Protection**: 🔒 MOYENNE

**Résultat**:
- ⚠️ Demande un mot de passe avant désinstallation
- ⚠️ N'empêche PAS complètement
- ⚠️ L'utilisateur peut désactiver puis désinstaller

---

## 📊 Comparaison Rapide

| Solution | Protection | Complexité | Coût | Recommandé pour |
|----------|-----------|------------|------|-----------------|
| **Device Owner** | 🔒🔒🔒 | Moyenne | Gratuit | POS dédiés |
| **MDM** | 🔒🔒 | Faible | 5-10€/mois | Entreprise |
| **Device Admin** | 🔒 | Faible | Gratuit | Test/Dev |

---

## 🎯 Recommandation pour SID Taxe Parking

### Configuration Optimale:

1. **Build APK avec EAS**
   ```bash
   eas build --platform android --profile production
   ```

2. **Héberger sur serveur web sécurisé**
   ```
   https://sid-parking.com/downloads/app-v1.0.0.apk
   ```

3. **Configurer en mode Device Owner** sur tous les POS
   - Factory reset chaque appareil
   - Installer l'APK via ADB
   - Activer Device Owner
   - Bloquer la désinstallation

4. **Surveillance centralisée**
   - Logs envoyés au backend
   - Alertes en cas de tentative de désinstallation
   - Géolocalisation des appareils

---

## 📋 Checklist de Déploiement

### Avant le déploiement:
- [ ] APK construit et testé
- [ ] APK hébergé en ligne (lien accessible)
- [ ] Appareils réinitialisés (factory reset)
- [ ] Débogage USB activé
- [ ] ADB installé sur l'ordinateur de configuration

### Configuration:
- [ ] APK installé via ADB
- [ ] Device Owner activé
- [ ] Mode kiosque testé
- [ ] Désinstallation bloquée vérifiée
- [ ] Mot de passe admin configuré

### Post-déploiement:
- [ ] Débogage USB désactivé (sécurité)
- [ ] Test complet de l'application
- [ ] Formation des utilisateurs
- [ ] Documentation remise au support

---

## 🆘 Dépannage Rapide

### "App not installed"
```bash
# Désinstaller l'ancienne version d'abord
adb uninstall com.sid.taxeparking

# Réinstaller
adb install sid-taxe-parking.apk
```

### Device Owner échoue
```bash
# Vérifier qu'aucun compte Google n'est configuré
adb shell pm list users

# Si des comptes existent: factory reset
```

### Débloquer un appareil
```bash
# Retirer le Device Owner
adb shell dpm remove-active-admin com.sid.taxeparking/.DeviceAdminReceiver

# Ou factory reset complet
```

---

## 📚 Documentation Complète

Consultez les guides détaillés:
- **BUILD_APK_GUIDE.md** - Guide complet de build
- **UNINSTALL_PROTECTION_GUIDE.md** - Protection détaillée

---

## 🔗 Liens Utiles

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Android Device Admin](https://developer.android.com/guide/topics/admin/device-admin)
- [Android Kiosk Mode](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode)

---

**Temps de déploiement estimé**: 30-45 minutes par appareil  
**Niveau technique requis**: Intermédiaire  
**Support requis**: ADB, accès USB aux appareils
