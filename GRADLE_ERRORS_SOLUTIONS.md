# Solutions aux Erreurs Gradle Communes - Expo EAS Build

## 🎯 Pour résoudre votre erreur "Gradle build failed with unknown error"

**Consultez les logs ici**: https://expo.dev/accounts/junior_ngoy/projects/sid-taxe-parking/builds/833a0b92-1f2e-4db6-a040-92c3554869db#run-gradlew

Dans les logs, cherchez la section **"Run gradlew"** et repérez l'erreur exacte (généralement en rouge).

---

## 🔧 Solutions par Type d'Erreur

### 1. Erreur: "Could not resolve all dependencies"

**Cause**: Dépendances Android manquantes ou versions incompatibles

**Solution**:
Créer `mob-temp/android/build.gradle` (ou modifier si existe):

```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "26.1.10909125"
        kotlinVersion = "1.9.22"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.3.0")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}
```

**Rebuild**:
```bash
eas build -p android --profile preview --clear-cache
```

---

### 2. Erreur: "Execution failed for task ':app:mergeReleaseResources'"

**Cause**: Ressources (images, icônes) manquantes ou invalides

**Solution 1**: Vérifier les images
```bash
# Vérifier que ces fichiers existent:
mob-temp/assets/images/icon.png
mob-temp/assets/images/adaptive-icon.png
mob-temp/assets/images/splash.png
mob-temp/assets/images/favicon.ico
```

**Solution 2**: Simplifier `app.json`
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    }
  }
}
```

---

### 3. Erreur: "Duplicate class found"

**Cause**: Conflit de versions entre dépendances

**Solution**: Ajouter dans `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "env": {
          "NODE_ENV": "production"
        }
      }
    }
  }
}
```

Et créer `mob-temp/metro.config.js`:
```javascript
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

---

### 4. Erreur: "Failed to transform bcryptjs"

**Cause**: bcryptjs ne fonctionne pas bien avec le build Android

**Solution**: Remplacer bcryptjs par react-native-bcrypt
```bash
cd mob-temp
npm uninstall bcryptjs @types/bcryptjs
npm install react-native-bcrypt
```

Puis dans le code, remplacer:
```typescript
// Ancien
import bcrypt from 'bcryptjs';

// Nouveau
import bcrypt from 'react-native-bcrypt';
```

---

### 5. Erreur: "Namespace not specified"

**Cause**: Configuration Android manquante

**Solution**: Ajouter dans `app.json`:
```json
{
  "expo": {
    "android": {
      "package": "com.sid.taxeparking",
      "versionCode": 1,
      "permissions": [...],
      "adaptiveIcon": {...},
      "config": {
        "googleMaps": {
          "apiKey": ""
        }
      }
    }
  }
}
```

---

### 6. Erreur: "Out of memory" ou "Java heap space"

**Cause**: Build nécessite plus de mémoire

**Solution**: Ajouter dans `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease --max-workers=2 -Dorg.gradle.jvmargs=-Xmx4096m"
      }
    }
  }
}
```

---

### 7. Erreur: "Plugin with id 'com.facebook.react' not found"

**Cause**: Configuration React Native manquante

**Solution**: S'assurer que `package.json` contient:
```json
{
  "dependencies": {
    "react-native": "0.81.4",
    "expo": "~54.0.0"
  }
}
```

Puis:
```bash
cd mob-temp
rm -rf node_modules package-lock.json
npm install
eas build -p android --profile preview --clear-cache
```

---

## 🚀 Solution Universelle (À Essayer en Premier)

### Étape 1: Nettoyer complètement
```powershell
cd C:\Users\POWERSOFT\projet\Native\SID-Mobile-master\mob-temp

# Supprimer les caches
Remove-Item -Recurse -Force node_modules, package-lock.json, .expo -ErrorAction SilentlyContinue

# Réinstaller proprement
npm install
```

### Étape 2: Vérifier la configuration

**eas.json**:
```json
{
  "cli": {
    "version": ">= 13.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    }
  }
}
```

**app.json** - Vérifier:
```json
{
  "expo": {
    "name": "SID Taxe Parking",
    "slug": "sid-taxe-parking",
    "version": "3.3.0",
    "android": {
      "package": "com.sid.taxeparking",
      "versionCode": 1,
      "permissions": [...]
    },
    "plugins": ["expo-barcode-scanner"]
  }
}
```

### Étape 3: Rebuild avec cache clear
```bash
eas build -p android --profile preview --clear-cache
```

---

## 📋 Checklist de Diagnostic

Avant de rebuild, vérifiez:

- [ ] `eas whoami` affiche votre compte
- [ ] `node_modules/` existe et est complet
- [ ] `package.json` a toutes les dépendances
- [ ] `app.json` a un `package` Android valide (sans underscore)
- [ ] Les images dans `assets/images/` existent
- [ ] `eas.json` a la configuration `android.buildType: "apk"`
- [ ] Pas de fichiers `android/` ou `ios/` (laissez Expo gérer)

---

## 🎯 Procédure Complète de Résolution

```bash
# 1. Se connecter
eas login
eas whoami

# 2. Nettoyer
cd mob-temp
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# 3. Réinstaller
npm install

# 4. Vérifier la config
cat eas.json
cat app.json

# 5. Build avec options maximales
eas build -p android --profile preview --clear-cache --verbose

# 6. Suivre les logs
# Ouvrir le lien affiché dans le terminal
```

---

## 🆘 Si Tout Échoue

### Option 1: Simplifier le projet

Créer un nouveau `eas.json` minimaliste:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Option 2: Utiliser un profil différent

Créer un profil "test" dans `eas.json`:
```json
{
  "build": {
    "test": {
      "android": {
        "buildType": "apk",
        "image": "default"
      },
      "distribution": "internal"
    }
  }
}
```

Build:
```bash
eas build -p android --profile test
```

### Option 3: Build avec image spécifique

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "image": "ubuntu-24.04-android-34-jdk-17-ndk-r26c"
      }
    }
  }
}
```

---

## 📞 Aide Communautaire

Si le problème persiste:

1. **Forums Expo**: https://forums.expo.dev/
2. **Discord Expo**: https://chat.expo.dev/
3. **GitHub Issues**: https://github.com/expo/eas-cli/issues

**Informations à fournir**:
- Lien vers les logs EAS
- Version de eas-cli (`eas --version`)
- Version SDK Expo (dans `app.json`)
- Message d'erreur exact

---

**Prochaine étape**: Consultez les logs du build sur https://expo.dev et trouvez le message d'erreur exact dans la phase "Run gradlew"
