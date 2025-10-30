# 🔒 Sécurisation des Actions Sensibles - Mob-Temp

## Résumé
Protection par mot de passe superviseur pour les actions critiques de suppression et réinitialisation des données.

---

## 🎯 Actions Protégées

### 1. **Supprimer les données** (`delete-sweep` 🗑️)
- **Action** : Supprime toutes les données synchronisées (tarifications, percepteurs, parkings, superviseurs)
- **Conservation** : Le code device est conservé
- **Utilité** : Nettoyer les données avant une nouvelle synchronisation

### 2. **Reset complet** (`delete-forever` 🔥)
- **Action** : Supprime **TOUT** y compris le code device
- **Résultat** : L'application revient à l'état initial (comme après installation)
- **Utilité** : Réaffecter le terminal à un autre site ou dispositif

---

## 🛡️ Mécanismes de Sécurité

### **Niveau 1 : Restriction par mode**
```typescript
if (mode !== 'supervisor') {
    communicate({ 
        content: '🔒 Action réservée aux superviseurs uniquement', 
        duration: 3000 
    });
    return;
}
```
- ✅ Les icônes sont **visuellement désactivées** en mode percepteur (grisées)
- ✅ Le clic est bloqué avec un message d'erreur clair
- ✅ Impossible d'accéder aux actions sans être en mode superviseur

### **Niveau 2 : Vérification de la liste des superviseurs**
```typescript
if (supervisors.length === 0) {
    communicate({ 
        content: '⚠️ Aucun superviseur enregistré. Veuillez synchroniser d\'abord.', 
        duration: 4000 
    });
    return;
}
```
- ✅ Vérifie qu'il y a au moins un superviseur enregistré
- ✅ Empêche l'action si la base locale est vide (avant première synchro)

### **Niveau 3 : Authentification par mot de passe**
```typescript
// Modal SupervisorPasswordModal
<SupervisorPasswordModal
    visible={clearDataModalVisible}
    onDismiss={() => setClearDataModalVisible(false)}
    onConfirm={executeClearData}
    title="🗑️ Réinitialiser les données"
    message="Confirmez avec votre mot de passe superviseur..."
    supervisors={supervisors}
/>
```
- ✅ Demande **nom d'utilisateur** + **mot de passe** superviseur
- ✅ Vérifie le mot de passe avec bcrypt (ou texte brut pour compatibilité)
- ✅ L'action n'est exécutée **QUE** si le mot de passe est correct
- ✅ Affiche des erreurs claires en cas d'échec

---

## 📁 Fichiers Modifiés

### **1. Nouveau composant** : `components/SupervisorPasswordModal.tsx`
Composant réutilisable pour demander une confirmation avec mot de passe superviseur.

**Fonctionnalités** :
- 🔐 Validation du nom d'utilisateur et mot de passe
- 👁️ Option d'affichage du mot de passe
- ⏳ État de chargement pendant la vérification
- ❌ Gestion des erreurs avec messages clairs
- 🎨 UI cohérente avec react-native-paper

### **2. Mise à jour** : `screens/SettingsScreen.tsx`
Ajout de la protection sur les boutons de suppression/reset.

**Changements** :
- ✅ Vérification du mode (`supervisor` uniquement)
- ✅ Icônes désactivées visuellement en mode percepteur
- ✅ Affichage du modal de confirmation avec mot de passe
- ✅ Exécution de l'action uniquement après validation

### **3. Mise à jour** : `context/authContext.tsx`
Exposition de la liste des superviseurs dans le contexte.

**Changements** :
- ✅ Ajout de `supervisors: Account[]` dans `ContextData`
- ✅ Export de `users` (liste des superviseurs) via le Provider
- ✅ Accessible depuis n'importe quel composant via `useContext(AuthContext)`

---

## 🔐 Flux de Sécurité

### **Suppression des données** (`handleClearData`)
```
1. Utilisateur clique sur l'icône 🗑️ (delete-sweep)
   ↓
2. Vérification : mode === 'supervisor' ?
   ↓ Non → Message d'erreur + Stop
   ↓ Oui
3. Vérification : supervisors.length > 0 ?
   ↓ Non → Message "Synchroniser d'abord" + Stop
   ↓ Oui
4. Affichage du modal SupervisorPasswordModal
   ↓
5. Utilisateur entre username + password
   ↓
6. Validation du mot de passe (bcrypt ou texte brut)
   ↓ Incorrect → Message d'erreur dans le modal
   ↓ Correct
7. Exécution de clearDataOnly()
   ↓
8. Message de confirmation + Fermeture du modal
```

### **Reset complet** (`handleResetApp`)
```
1. Utilisateur clique sur l'icône 🔥 (delete-forever)
   ↓
2-6. [Même flux que ci-dessus]
   ↓
7. Exécution de clearAllStorage()
   ↓
8. Message "Redémarrez l'application" + Fermeture du modal
```

---

## 🧪 Scénarios de Test

### **Test 1 : Mode Percepteur**
1. ✅ Se connecter en mode percepteur
2. ✅ Aller dans Settings
3. ✅ Les icônes 🗑️ et 🔥 doivent être **grisées**
4. ✅ Cliquer dessus → Message "Action réservée aux superviseurs"

### **Test 2 : Mode Superviseur - Avant Synchro**
1. ✅ Passer en mode superviseur (sans synchroniser)
2. ✅ Cliquer sur 🗑️ ou 🔥
3. ✅ Message "Aucun superviseur enregistré. Veuillez synchroniser d'abord"

### **Test 3 : Mode Superviseur - Mot de passe incorrect**
1. ✅ Synchroniser l'application
2. ✅ Passer en mode superviseur
3. ✅ Cliquer sur 🗑️
4. ✅ Modal s'affiche
5. ✅ Entrer un mauvais mot de passe
6. ✅ Message d'erreur "Mot de passe incorrect" dans le modal

### **Test 4 : Mode Superviseur - Mot de passe correct**
1. ✅ Même setup que Test 3
2. ✅ Entrer le bon username + password
3. ✅ Action exécutée avec succès
4. ✅ Message de confirmation
5. ✅ Modal se ferme automatiquement

### **Test 5 : Reset Complet**
1. ✅ Suivre Test 4 avec l'icône 🔥
2. ✅ Après confirmation, toutes les données sont supprimées
3. ✅ Le code device est aussi supprimé
4. ✅ L'app revient à l'écran d'enregistrement initial

---

## 🎨 Indicateurs Visuels

### **Mode Percepteur**
```
🗑️ (gris/désactivé) | 🔥 (gris/désactivé)
```

### **Mode Superviseur**
```
🗑️ (orange/actif) | 🔥 (rouge/actif)
```

### **Modal de Confirmation**
```
┌────────────────────────────────────┐
│ 🗑️ Réinitialiser les données      │
├────────────────────────────────────┤
│ Confirmez avec votre mot de passe │
│ superviseur pour supprimer...      │
│                                    │
│ [Nom d'utilisateur superviseur]   │
│ [Mot de passe superviseur] 👁️     │
│                                    │
│    [Annuler]    [Supprimer]       │
└────────────────────────────────────┘
```

---

## 🚀 Avantages de cette Approche

1. **Triple protection** : Mode + Liste + Mot de passe
2. **Réutilisable** : Le composant `SupervisorPasswordModal` peut être utilisé pour d'autres actions sensibles
3. **UX claire** : Feedback visuel immédiat (icônes grisées)
4. **Sécurité forte** : Impossible de contourner sans le mot de passe superviseur
5. **Compatible** : Supporte bcrypt ET texte brut (rétrocompatibilité)
6. **Performance** : Validation rapide en texte brut, bcrypt uniquement si nécessaire

---

## 📝 Notes Techniques

- **SupervisorPasswordModal** utilise bcrypt pour la validation (même logique que `authContext`)
- Les superviseurs sont récupérés depuis `AuthContext.supervisors`
- Le mode est vérifié via `AuthContext.mode`
- Les actions sont bloquées à **tous les niveaux** pour éviter les contournements
- Compatible avec React 19 / React Native 0.81.4 / Expo 54

---

## 🔮 Extensions Futures Possibles

Si d'autres actions sensibles doivent être protégées :

1. **Changer l'URL API** (prod/test/local) → Réserver aux superviseurs
2. **Modifier le code device** → Protéger avec mot de passe
3. **Exporter les données** → Demander confirmation superviseur
4. **Réinitialiser une session en cours** → Protection superviseur

Il suffit de réutiliser `SupervisorPasswordModal` avec les props appropriées.

---

**Date** : 24 octobre 2025  
**Version** : mob-temp v3.3.0  
**Sécurité** : ✅ Actions critiques protégées
