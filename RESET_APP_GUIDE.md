# 🔄 Comment réinitialiser l'application mobile

## 🎯 Pourquoi réinitialiser ?

Vous devez réinitialiser l'app mobile dans ces cas :
- ✅ Vous avez modifié les données backend (seed)
- ✅ Vous voulez tester avec de nouvelles données
- ✅ Vous avez des données corrompues
- ✅ Vous voulez recommencer à zéro

## 🛠️ Méthodes de réinitialisation

### ✅ **Méthode 1 : Depuis l'app mobile (recommandé)**

1. Ouvrez l'application mobile
2. Allez dans **Settings** (⚙️ Paramètres)
3. Cliquez sur les boutons :
   - 🧹 **Orange** = Supprimer uniquement les données synchronisées (garde le code device)
   - 🔥 **Rouge** = RESET COMPLET (supprime TOUT, y compris le code device)

### ✅ **Méthode 2 : Depuis le code**

```typescript
// Dans n'importe quel fichier de l'app
import { resetCompleteApp, resetDataOnly } from './utils/resetApp';

// Option 1: Reset complet (TOUT supprimer)
await resetCompleteApp();

// Option 2: Reset données seulement (garder device)
await resetDataOnly();
```

### ✅ **Méthode 3 : Depuis la console de développement**

Dans le terminal où l'app tourne :
1. Appuyez sur **`d`** pour ouvrir le developer menu
2. Sélectionnez **"Reload"** pour recharger l'app
3. Ou désinstallez et réinstallez l'app

### ✅ **Méthode 4 : Manuellement (Android)**

```bash
# Supprimer les données de l'app (Android)
adb shell pm clear host.exp.exponent

# Ou désinstaller complètement
adb uninstall host.exp.exponent
```

## 📋 Workflow complet de test

### 1️⃣ **Reset backend + seed**
```bash
cd backend
npx prisma migrate reset  # Reset complet + seed automatique
# OU
npx prisma db seed        # Juste re-seed sans reset
```

### 2️⃣ **Reset mobile**
- Ouvrir l'app → Settings → Bouton rouge 🔥 (RESET COMPLET)
- OU désinstaller/réinstaller l'app

### 3️⃣ **Nouveau test**
1. Ouvrir l'app mobile
2. Entrer un code device : **Lub120**, **Kin330**, **OFFLINE**, **8419**, ou **1984**
3. Faire la synchronisation (bouton 🔄)
4. Commencer à facturer !

## 🎨 Boutons de Settings

| Icône | Couleur | Action | Description |
|-------|---------|--------|-------------|
| 🔄 | Bleu | Synchroniser | Télécharge les données du backend |
| 🖨️ | Bleu | Test impression | Teste l'imprimante |
| 🧹 | Orange | Clear data | Supprime données sync (garde device) |
| 🔥 | Rouge | Reset complet | SUPPRIME TOUT (app comme neuve) |

## 🚨 Attention

- ⚠️ **Bouton Rouge** = Vous devrez re-entrer le code device
- ⚠️ **Bouton Orange** = Vous gardez le code device mais devez resynchroniser
- ⚠️ **Toujours synchroniser** après un reset pour récupérer les nouvelles données

## 💡 Astuce développement

Pour les tests rapides, utilisez cette séquence :
1. Backend: `npx prisma db seed` (dans backend/)
2. Mobile: Bouton Orange 🧹 (Clear data)
3. Mobile: Bouton Bleu 🔄 (Synchroniser)

Cela évite de re-entrer le code device à chaque fois ! 🚀
