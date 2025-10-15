# Protection contre la Désinstallation - Application Mobile

## 🎯 Objectif
Empêcher la désinstallation non autorisée de l'application sur les appareils de taxation.

---

## ⚠️ Limitations Android

**Important**: Android ne permet PAS nativement de bloquer complètement la désinstallation d'une application pour des raisons de sécurité utilisateur.

Cependant, plusieurs solutions existent selon le niveau de contrôle souhaité:

---

## 🔒 Solutions Disponibles

### **Solution 1: Mode Kiosque (Device Owner) - ⭐ RECOMMANDÉE**

#### Description:
L'application devient "Device Owner" et peut contrôler entièrement l'appareil.

#### Capacités:
- ✅ **Bloquer la désinstallation** complètement
- ✅ **Cacher les paramètres système**
- ✅ **Désactiver les autres applications**
- ✅ **Mode kiosque** (une seule app visible)
- ✅ **Contrôle total sur l'appareil**

#### Configuration requise:
- Appareil **neuf ou réinitialisé** (factory reset)
- Aucun autre compte Google configuré
- Droits administrateur

#### Implémentation:

**1. Ajouter les dépendances**

Dans `package.json`:
```json
{
  "dependencies": {
    "react-native-device-owner": "^1.0.0"
  }
}
```

**2. Configuration Android native**

Créer `android/app/src/main/res/xml/device_admin.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<device-admin xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-policies>
        <limit-password />
        <watch-login />
        <reset-password />
        <force-lock />
        <wipe-data />
        <expire-password />
        <encrypted-storage />
        <disable-camera />
    </uses-policies>
</device-admin>
```

**3. Modifier `AndroidManifest.xml`**

Ajouter dans `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
    <application>
        <!-- Existant -->
        
        <!-- Device Admin Receiver -->
        <receiver
            android:name=".DeviceAdminReceiver"
            android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data
                android:name="android.app.device_admin"
                android:resource="@xml/device_admin" />
            <intent-filter>
                <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
            </intent-filter>
        </receiver>
    </application>
    
    <!-- Permissions -->
    <uses-permission android:name="android.permission.BIND_DEVICE_ADMIN" />
</manifest>
```

**4. Activer le Device Owner via ADB**

```bash
# Connecter l'appareil via USB
# Activer le débogage USB

# Commande pour définir l'app comme Device Owner
adb shell dpm set-device-owner com.sid.taxeparking/.DeviceAdminReceiver

# Vérifier
adb shell dpm list-owners
```

**5. Code React Native pour le mode kiosque**

Créer `utils/kioskMode.ts`:
```typescript
import { NativeModules, Platform } from 'react-native';

const { DeviceOwnerModule } = NativeModules;

export const KioskMode = {
  // Activer le mode kiosque
  enableKioskMode: async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      await DeviceOwnerModule.startLockTask();
      console.log('✅ Mode kiosque activé');
    } catch (error) {
      console.error('❌ Erreur mode kiosque:', error);
    }
  },

  // Désactiver le mode kiosque (avec mot de passe admin)
  disableKioskMode: async (adminPassword: string) => {
    if (Platform.OS !== 'android') return;
    
    // Vérifier le mot de passe admin
    const isValidAdmin = await verifyAdminPassword(adminPassword);
    
    if (!isValidAdmin) {
      throw new Error('Mot de passe administrateur invalide');
    }
    
    try {
      await DeviceOwnerModule.stopLockTask();
      console.log('✅ Mode kiosque désactivé');
    } catch (error) {
      console.error('❌ Erreur désactivation:', error);
    }
  },

  // Cacher les paramètres système
  hideSystemUI: async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      await DeviceOwnerModule.setStatusBarDisabled(true);
      await DeviceOwnerModule.setSystemUIDisabled(true);
      console.log('✅ Interface système cachée');
    } catch (error) {
      console.error('❌ Erreur masquage UI:', error);
    }
  },

  // Bloquer la désinstallation
  preventUninstall: async () => {
    if (Platform.OS !== 'android') return;
    
    try {
      await DeviceOwnerModule.setUninstallBlocked('com.sid.taxeparking', true);
      console.log('✅ Désinstallation bloquée');
    } catch (error) {
      console.error('❌ Erreur blocage:', error);
    }
  }
};

// Vérification du mot de passe admin (exemple)
const verifyAdminPassword = async (password: string): Promise<boolean> => {
  // Récupérer le hash du mot de passe stocké
  const storedHash = await AsyncStorage.getItem('admin_password_hash');
  
  // Comparer avec bcrypt
  return bcrypt.compareSync(password, storedHash);
};
```

**6. Utilisation dans l'app**

```typescript
// App.tsx ou écran principal
import { KioskMode } from './utils/kioskMode';

useEffect(() => {
  // Activer le mode kiosque au démarrage
  KioskMode.enableKioskMode();
  KioskMode.preventUninstall();
  KioskMode.hideSystemUI();
}, []);
```

#### Avantages:
- ✅ Protection maximale
- ✅ Impossible de désinstaller sans mot de passe admin
- ✅ Contrôle total de l'appareil

#### Inconvénients:
- ❌ Nécessite un factory reset pour l'activation
- ❌ Configuration complexe
- ❌ Difficile à retirer (par design)

---

### **Solution 2: Device Admin (Partiel)**

#### Description:
L'application devient administrateur de l'appareil avec des droits limités.

#### Capacités:
- ⚠️ **Demander un mot de passe** avant désinstallation
- ⚠️ **Avertir l'utilisateur** mais ne peut pas bloquer complètement
- ✅ Plus facile à configurer que Device Owner

#### Implémentation:

**1. Configuration AndroidManifest.xml**

```xml
<receiver
    android:name=".MyDeviceAdminReceiver"
    android:permission="android.permission.BIND_DEVICE_ADMIN">
    <meta-data
        android:name="android.app.device_admin"
        android:resource="@xml/device_admin_receiver" />
    <intent-filter>
        <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
        <action android:name="android.app.action.ACTION_DEVICE_ADMIN_DISABLE_REQUESTED" />
    </intent-filter>
</receiver>
```

**2. Code natif Java/Kotlin**

`MyDeviceAdminReceiver.java`:
```java
public class MyDeviceAdminReceiver extends DeviceAdminReceiver {
    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        // Message affiché quand l'utilisateur tente de désactiver l'admin
        return "⚠️ Attention: La désactivation désinstallera l'application de taxation.";
    }
    
    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
        // L'utilisateur a désactivé l'admin
        Toast.makeText(context, "Protection désactivée", Toast.LENGTH_SHORT).show();
    }
}
```

**3. Demander les droits admin**

```typescript
import { NativeModules } from 'react-native';

const requestAdminRights = async () => {
  try {
    await NativeModules.DeviceAdmin.requestAdminRights();
    console.log('✅ Droits administrateur accordés');
  } catch (error) {
    console.error('❌ Droits refusés');
  }
};
```

#### Avantages:
- ✅ Plus facile à configurer
- ✅ Ne nécessite pas de factory reset
- ✅ Peut être activé/désactivé par l'utilisateur

#### Inconvénients:
- ❌ **Ne bloque pas complètement** la désinstallation
- ❌ L'utilisateur peut désactiver l'admin puis désinstaller
- ❌ Avertissement seulement

---

### **Solution 3: MDM (Mobile Device Management) - 🏢 ENTREPRISE**

#### Description:
Utiliser un système MDM professionnel pour gérer les appareils.

#### Services MDM populaires:
- **Google Workspace** (anciennement G Suite)
- **Microsoft Intune**
- **VMware Workspace ONE**
- **MobileIron**
- **Jamf** (principalement iOS)

#### Capacités:
- ✅ **Gestion centralisée** de tous les appareils
- ✅ **Bloquer la désinstallation** à distance
- ✅ **Déploiement automatique** de l'app
- ✅ **Mises à jour forcées**
- ✅ **Effacement à distance** si appareil perdu/volé
- ✅ **Géolocalisation** des appareils
- ✅ **Rapports d'utilisation**

#### Configuration (exemple avec Google Workspace):

**1. Inscrire l'appareil dans Google Workspace**
```bash
# L'appareil doit être configuré avec un compte Google Workspace
# Au démarrage: Ajouter compte → email@votre-entreprise.com
```

**2. Configurer la politique dans la console admin**
- Console Admin → Appareils → Configuration
- Bloquer la désinstallation de "SID Taxe Parking"
- Forcer l'installation
- Mode kiosque (optionnel)

**3. L'application sera protégée automatiquement**

#### Avantages:
- ✅ Solution professionnelle éprouvée
- ✅ Gestion centralisée
- ✅ Support technique
- ✅ Conformité légale (RGPD, etc.)

#### Inconvénients:
- ❌ **Coût** (~5-10€/appareil/mois)
- ❌ Nécessite une infrastructure
- ❌ Complexité de mise en place

---

### **Solution 4: Protection par Mot de Passe Personnalisé**

#### Description:
Créer un écran de protection dans l'application qui demande un mot de passe avant de permettre l'accès aux paramètres.

#### Implémentation:

**1. Créer un écran de protection**

`screens/UninstallProtectionScreen.tsx`:
```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD_HASH = '$2a$10$...'; // Hash du mot de passe admin

export default function UninstallProtectionScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleUnlock = async () => {
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (isValid) {
      Alert.alert('✅ Accès accordé', 'Vous pouvez maintenant désinstaller l\'application.');
      onUnlock();
    } else {
      setAttempts(attempts + 1);
      
      if (attempts >= 5) {
        Alert.alert('🔒 Trop de tentatives', 'Contactez l\'administrateur système.');
        // Envoyer une alerte au serveur
        sendSecurityAlert();
      } else {
        Alert.alert('❌ Mot de passe incorrect', `Tentatives restantes: ${5 - attempts}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Title>Protection contre la Désinstallation</Title>
      <Text>Entrez le mot de passe administrateur pour continuer</Text>
      
      <TextInput
        mode="outlined"
        label="Mot de passe administrateur"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button mode="contained" onPress={handleUnlock}>
        Déverrouiller
      </Button>
    </View>
  );
}
```

**2. Intercepter l'accès aux paramètres**

```typescript
// SettingsScreen.tsx
const SettingsScreen = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <UninstallProtectionScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <View>
      <Text>Paramètres de l'application</Text>
      {/* Options de paramètres */}
    </View>
  );
};
```

#### Avantages:
- ✅ Simple à implémenter
- ✅ Pas de configuration système nécessaire
- ✅ Contrôle dans l'application

#### Inconvénients:
- ❌ **Ne bloque PAS réellement** la désinstallation système
- ❌ L'utilisateur peut forcer la désinstallation depuis les paramètres Android
- ❌ Protection faible

---

## 🎯 Recommandation par Cas d'Usage

| Cas d'Usage | Solution Recommandée | Niveau de Protection |
|-------------|---------------------|---------------------|
| **POS dédiés** (appareils propriété de l'entreprise) | **Device Owner (Solution 1)** | 🔒🔒🔒 Maximum |
| **Téléphones d'employés** (BYOD) | **MDM Entreprise (Solution 3)** | 🔒🔒 Élevé |
| **Appareils partagés** | **Device Admin (Solution 2)** | 🔒 Moyen |
| **Test/Développement** | **Protection par mot de passe (Solution 4)** | ⚠️ Faible |

---

## 🚀 Implémentation Recommandée pour SID Taxe Parking

### Configuration Device Owner (Kiosque)

**1. Préparer le module natif**

Créer `android/app/src/main/java/com/sid/taxeparking/DeviceOwnerModule.java`:

```java
package com.sid.taxeparking;

import android.app.Activity;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class DeviceOwnerModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "DeviceOwnerModule";
    private DevicePolicyManager devicePolicyManager;
    private ComponentName adminComponent;

    public DeviceOwnerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        devicePolicyManager = (DevicePolicyManager) reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE);
        adminComponent = new ComponentName(reactContext, DeviceAdminReceiver.class);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void startLockTask(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null && devicePolicyManager.isDeviceOwnerApp(getReactApplicationContext().getPackageName())) {
            activity.startLockTask();
            promise.resolve(true);
        } else {
            promise.reject("NOT_DEVICE_OWNER", "App is not device owner");
        }
    }

    @ReactMethod
    public void stopLockTask(Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            activity.stopLockTask();
            promise.resolve(true);
        } else {
            promise.reject("NO_ACTIVITY", "No activity found");
        }
    }

    @ReactMethod
    public void setUninstallBlocked(String packageName, boolean blocked, Promise promise) {
        if (devicePolicyManager.isDeviceOwnerApp(getReactApplicationContext().getPackageName())) {
            devicePolicyManager.setUninstallBlocked(adminComponent, packageName, blocked);
            promise.resolve(true);
        } else {
            promise.reject("NOT_DEVICE_OWNER", "App is not device owner");
        }
    }
}
```

**2. Enregistrer le module**

`android/app/src/main/java/com/sid/taxeparking/DeviceOwnerPackage.java`:

```java
package com.sid.taxeparking;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DeviceOwnerPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new DeviceOwnerModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
```

**3. Ajouter dans MainApplication.java**

```java
@Override
protected List<ReactPackage> getPackages() {
    List<ReactPackage> packages = new PackageList(this).getPackages();
    packages.add(new DeviceOwnerPackage()); // <-- Ajouter ici
    return packages;
}
```

---

## 📋 Procédure de Déploiement

### Pour les POS/Tablettes dédiés:

1. **Réinitialiser l'appareil** (factory reset)
2. **Ne PAS configurer de compte Google**
3. **Activer le débogage USB** (Paramètres → Options développeur)
4. **Installer l'APK via ADB**:
   ```bash
   adb install sid-taxe-parking.apk
   ```
5. **Définir comme Device Owner**:
   ```bash
   adb shell dpm set-device-owner com.sid.taxeparking/.DeviceAdminReceiver
   ```
6. **Lancer l'application** → Mode kiosque s'active automatiquement
7. **Désactiver le débogage USB** (sécurité)

### Pour retirer le Device Owner (maintenance):

```bash
# Avec ADB
adb shell dpm remove-active-admin com.sid.taxeparking/.DeviceAdminReceiver

# Ou factory reset complet
```

---

## 🔐 Sécurité Additionnelle

### Recommandations:

1. **Mot de passe fort** pour le compte admin
2. **Chiffrement de l'appareil** activé
3. **Verrouillage automatique** après inactivité
4. **Désactivation USB** en production
5. **Logs d'audit** envoyés au serveur
6. **Alerte en cas de tentative de désinstallation**

### Code d'alerte:

```typescript
const sendSecurityAlert = async () => {
  try {
    await fetch(`${API_URL}/security/uninstall-attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: device.id,
        timestamp: new Date().toISOString(),
        location: await getLocation()
      })
    });
  } catch (error) {
    console.error('Erreur envoi alerte:', error);
  }
};
```

---

## ✅ Checklist de Protection

- [ ] Device Owner configuré sur tous les POS
- [ ] Mode kiosque activé au démarrage
- [ ] Désinstallation bloquée
- [ ] Interface système cachée (barre de notification, bouton home)
- [ ] Mot de passe admin configuré et sécurisé
- [ ] Alertes de sécurité envoyées au serveur
- [ ] Documentation pour le support technique
- [ ] Procédure de déblocage en cas d'urgence

---

## 📞 Support

En cas de problème:
1. **Factory reset** l'appareil
2. **Réinstaller** l'application
3. **Reconfigurer** le Device Owner
4. **Contacter** le support technique si nécessaire

---

**Créé le**: 13 octobre 2025  
**Version**: 1.0  
**Application**: SID Mobile - Taxe Parking  
**Niveau de sécurité**: Maximum (Device Owner)
