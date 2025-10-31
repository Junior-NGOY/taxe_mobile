# Guide d'intégration du système de session dynamique

## ✅ Ce qui a été implémenté

### 1. Backend (Types et Logique)
- ✅ Ajout du champ `maxDays` dans le type `Session`
- ✅ Fonction `extendSession(additionalDays)` dans SessionContext
- ✅ Fonctions `resetInvoices()` et `unlockSession()` dans WorkSessionContext  
- ✅ Vérification dynamique basée sur `session.maxDays` au lieu de la valeur codée en dur "2"
- ✅ Composant `SessionBlockedModal` avec authentification à 2 niveaux

### 2. Composants créés
- ✅ `components/SessionBlockedModal.tsx` - Modal de gestion session bloquée

## 🔧 Ce qu'il reste à faire

### Étape 1 : Ajouter l'input "Nombre de jours" lors de la création de session

Fichier à modifier : `screens/TabTwoScreen.tsx` (ou votre écran de démarrage de session)

**Trouver le formulaire de démarrage de session et ajouter** :

```tsx
import { useState } from 'react';

// Dans votre composant
const [maxDays, setMaxDays] = useState('3'); // Valeur par défaut

// Dans le formulaire, ajouter avant ou après le sélecteur de parking :
<TextInput
    label="Nombre de jours maximum (avant blocage)"
    value={maxDays}
    onChangeText={setMaxDays}
    keyboardType="number-pad"
    mode="outlined"
    style={{ marginBottom: 12 }}
    placeholder="Ex: 3"
/>

// Modifier l'appel à start() pour inclure maxDays :
start({ 
    perceptor: selectedPerceptor, 
    parking: selectedParking, 
    printingLimit: printLimit,
    maxDays: parseInt(maxDays) || 3 // Par défaut 3 si vide
})
```

### Étape 2 : Intégrer le SessionBlockedModal

Fichier à modifier : `screens/TabOneScreen.tsx` (écran principal de taxation)

**Importer et utiliser le modal** :

```tsx
import { SessionBlockedModal } from '../components/SessionBlockedModal';
import { SessionContext } from '../session/context';
import { WorkSessionContext } from '../context/workSession';

// Dans votre composant
const { session, extendSession } = useContext(SessionContext);
const { stop, resetInvoices, unlockSession } = useContext(WorkSessionContext);
const [showBlockedModal, setShowBlockedModal] = useState(false);

// Surveiller le blocage
useEffect(() => {
    if (stop) {
        setShowBlockedModal(true);
    }
}, [stop]);

// Gérer la prolongation
const handleExtend = (days: number) => {
    extendSession(days);
    unlockSession();
    setShowBlockedModal(false);
};

// Gérer la réinitialisation
const handleReset = () => {
    resetInvoices();
    setShowBlockedModal(false);
};

// Dans le JSX, ajouter à la fin :
<SessionBlockedModal
    visible={showBlockedModal}
    onDismiss={() => setShowBlockedModal(false)}
    onExtend={handleExtend}
    onReset={handleReset}
    currentMaxDays={session?.maxDays ?? 2}
/>
```

### Étape 3 : Bloquer l'interface quand `stop === true`

Dans `screens/TabOneScreen.tsx`, entourer le formulaire de taxation :

```tsx
{stop ? (
    <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>
            ⚠️ Session bloquée
        </Text>
        <Text style={{ textAlign: 'center' }}>
            Veuillez synchroniser ou prolonger la session
        </Text>
    </View>
) : (
    // Votre formulaire de taxation existant
    <YourTaxationForm />
)}
```

## 🔐 Informations de connexion

### Superviseur
- **Mot de passe** : À définir (actuellement le modal accepte tout mot de passe)
- **Action** : Prolonger la session de X jours

### Administrateur  
- **Email** : `sidpaie01@gmail.com`
- **Mot de passe** : `s@&paie#01`
- **Action** : Réinitialiser les factures (efface toutes les factures mais garde percepteur, parking, etc.)

## 📝 Flux utilisateur

### Scénario 1 : Création de session
1. Agent sélectionne percepteur
2. Agent sélectionne parking/marché
3. **Agent saisit nombre de jours** (ex: 5 jours)
4. Session démarre avec `maxDays = 5`

### Scénario 2 : Session bloquée - Prolongation
1. Après 5 jours, session bloque automatiquement
2. Modal s'affiche avec 2 options
3. Superviseur choisit "Prolonger"
4. Entre nombre de jours (ex: 3)
5. Entre son mot de passe
6. Session prolongée de 3 jours (total: 5+3=8 jours)

### Scénario 3 : Session bloquée - Réinitialisation
1. Session bloquée
2. Admin choisit "Réinitialiser les factures"
3. Entre email `sidpaie01@gmail.com`
4. Entre mot de passe `s@&paie#01`
5. **Toutes les factures sont effacées**
6. Session continue avec percepteur, parking, etc. conservés
7. Compteur repart à zéro

## ⚠️ Points importants

1. **Validation du mot de passe superviseur** : Actuellement le modal accepte tout mot de passe. Vous devez ajouter la logique de vérification dans `SessionBlockedModal.tsx` ligne 35-40.

2. **Sécurité** : Le mot de passe admin est codé en dur. Pour plus de sécurité, envisagez de le stocker côté serveur.

3. **Synchronisation** : La réinitialisation des factures efface les données localement. Assurez-vous que c'est le comportement souhaité.

4. **Valeur par défaut** : Si `maxDays` n'est pas défini, le système utilise 2 jours (comportement actuel).

## 🧪 Tests recommandés

1. ✅ Créer une session avec maxDays = 1
2. ✅ Attendre 2 jours (ou modifier manuellement la date dans le code)
3. ✅ Vérifier que le modal s'affiche
4. ✅ Tester la prolongation avec mot de passe superviseur
5. ✅ Tester la réinitialisation avec credentials admin
6. ✅ Vérifier que les factures sont bien effacées
7. ✅ Vérifier que percepteur/parking sont conservés

## 📂 Fichiers modifiés

- ✅ `session/context.tsx` - Ajout extendSession
- ✅ `session/start.ts` - Ajout paramètre maxDays
- ✅ `context/workSession.tsx` - Logique de blocage dynamique + resetInvoices
- ✅ `components/SessionBlockedModal.tsx` - Nouveau fichier (modal)

## 📂 Fichiers à modifier (par vous)

- ⏳ `screens/TabTwoScreen.tsx` - Ajouter input maxDays
- ⏳ `screens/TabOneScreen.tsx` - Intégrer SessionBlockedModal et bloquer UI
- ⏳ `components/SessionBlockedModal.tsx` - Ajouter validation mot de passe superviseur (ligne 35-40)
