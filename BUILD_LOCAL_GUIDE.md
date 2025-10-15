# Guide de Build Local - Solution Alternative

## 🎯 Problème
Le build EAS échoue avec une erreur Gradle inconnue. Solution: Build local avec `expo prebuild`.

---

## 📋 Prérequis

### Windows
1. **Node.js 18+** installé
2. **Java JDK 17** (recommandé pour Expo SDK 54)
   - Télécharger: https://adoptium.net/
   - Configurer JAVA_HOME dans les variables d'environnement
3. **Android Studio** avec Android SDK
   - Télécharger: https://developer.android.com/studio
   - Installer Android SDK 34 (via SDK Manager)
4. **Gradle** (inclus avec Android Studio)

### Variables d'environnement Windows

```bash
# Ajouter dans Variables d'environnement système:

JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
ANDROID_HOME=C:\Users\VOTRE_NOM\AppData\Local\Android\Sdk

# Ajouter au PATH:
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

---

## 🚀 Méthode 1: Expo Prebuild + Gradle

### Étape 1: Générer le projet Android natif

```bash
cd mob-temp

# Générer les fichiers Android natifs
npx expo prebuild --platform android --clean
```

Cela crée le dossier `android/` avec tous les fichiers Gradle.

### Étape 2: Build avec Gradle

```bash
cd android

# Windows PowerShell
.\gradlew assembleRelease

# Windows CMD
gradlew.bat assembleRelease

# Linux/Mac
./gradlew assembleRelease
```

### Étape 3: Récupérer l'APK

L'APK sera généré dans:
```
android/app/build/outputs/apk/release/app-release.apk
```

Renommez-le:
```bash
copy android\app\build\outputs\apk\release\app-release.apk sid-taxe-parking-v3.3.0.apk
```

---

## 🚀 Méthode 2: Expo Build Classic (Déprécié mais fonctionne)

**Note**: Cette méthode est dépréciée mais peut fonctionner si EAS échoue.

```bash
# Installer expo-cli classique
npm install -g expo-cli

# Build APK
expo build:android -t apk

# Suivre le build et télécharger l'APK
```

---

## 🚀 Méthode 3: EAS Build avec Node Modules

Parfois, EAS échoue à cause des dépendances. Essayons de forcer l'installation propre:

```bash
# 1. Nettoyer complètement
cd mob-temp
rm -rf node_modules
rm package-lock.json
rm -rf .expo

# 2. Réinstaller proprement
npm install

# 3. Build avec cache clear
eas build --platform android --profile preview --clear-cache
```

---

## 🔧 Dépannage Build Local

### Erreur: "JAVA_HOME not set"

```bash
# Vérifier Java
java -version

# Devrait afficher: openjdk version "17.x.x"

# Configurer JAVA_HOME (temporaire)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"
```

### Erreur: "SDK location not found"

Créer `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\VOTRE_NOM\\AppData\\Local\\Android\\Sdk
```

### Erreur: "Gradle version incompatible"

Modifier `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
```

### Erreur: "Unable to make field private final java.lang.String java.io.File.path accessible"

Solution: Utiliser Java 17 (pas Java 21+)

---

## 📦 Optimisation de l'APK

### Réduire la taille

Modifier `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // Séparer les architectures (optionnel)
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a'
            universalApk true
        }
    }
}
```

---

## 🎯 Build Production Signé

### 1. Générer un Keystore

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore sid-taxe-parking.keystore -alias sid-key -keyalg RSA -keysize 2048 -validity 10000
```

**⚠️ IMPORTANT**: Sauvegarder le keystore et noter le mot de passe!

### 2. Configurer Gradle

Créer `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=sid-taxe-parking.keystore
MYAPP_UPLOAD_KEY_ALIAS=sid-key
MYAPP_UPLOAD_STORE_PASSWORD=***VOTRE_MOT_DE_PASSE***
MYAPP_UPLOAD_KEY_PASSWORD=***VOTRE_MOT_DE_PASSE***
```

Modifier `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Build Signé

```bash
cd android
.\gradlew assembleRelease
```

APK signé généré dans:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## ✅ Vérification de l'APK

```bash
# Vérifier la signature
keytool -printcert -jarfile app-release.apk

# Analyser la taille
# Installer bundletool: https://github.com/google/bundletool
java -jar bundletool.jar get-size total --apks=app-release.apk
```

---

## 🚀 Installation sur appareil

```bash
# Via ADB
adb install app-release.apk

# Ou copier sur l'appareil et installer manuellement
```

---

## 📝 Script Automatisé

Créer `build-local.bat` (Windows):

```batch
@echo off
echo 🚀 Build APK Local - SID Taxe Parking

echo 📦 Nettoyage...
cd android
call gradlew.bat clean

echo 🏗️ Build en cours...
call gradlew.bat assembleRelease

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ Build réussi!
    echo 📂 APK: android\app\build\outputs\apk\release\app-release.apk
    
    copy app\build\outputs\apk\release\app-release.apk ..\sid-taxe-parking-v3.3.0.apk
    echo 📦 APK copié dans: sid-taxe-parking-v3.3.0.apk
) else (
    echo ❌ Build échoué!
    exit /b 1
)

pause
```

Utilisation:
```bash
.\build-local.bat
```

---

## 🔄 Retour à EAS Build

Si le build local fonctionne mais EAS échoue, le problème vient de la configuration EAS. Essayez:

```bash
# 1. Supprimer le dossier android/
rm -rf android ios

# 2. Rebuild avec EAS et cache clear
eas build --platform android --profile preview --clear-cache --no-wait
```

---

## 📞 Support

Si tous les builds échouent:
1. Vérifier les logs EAS: https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds
2. Consulter: https://docs.expo.dev/build-reference/troubleshooting/
3. Forum Expo: https://forums.expo.dev/

---

**Créé le**: 13 octobre 2025  
**Méthode recommandée**: Prebuild + Gradle local
