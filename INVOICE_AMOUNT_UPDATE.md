# Ajout du montant dans la liste des factures (Mode Superviseur)

## 📋 Modifications apportées

### 1. **Contexte WorkSession** (`context/workSession.tsx`)
- ✅ Ajout du champ `amount?: number` dans le type `IdInvoice`
- ✅ Calcul et stockage du montant lors de l'ajout d'une facture:
  - Priorité: `invoice.amount` (number ou string) → `invoice.tarification.price`
  - Le montant est extrait et converti en nombre

### 2. **Écran CheckInvoice** (`screens/CheckInvoiceScreen.tsx`)
- ✅ Affichage du montant dans la description de chaque facture
- ✅ Ajout d'un badge de montant à droite de chaque item avec:
  - Montant en vert foncé (Colors.green700)
  - Devise "CDF" en gris
  - Formatage avec séparateurs de milliers

## 🎨 Rendu visuel

Chaque facture dans la liste affiche maintenant:
```
┌────────────────────────────────────────────────────┐
│ 🧾  ABC-123 - 2 impressions            1,000      │
│     Montant: 1,000 CDF                  CDF       │
│     13/10/2025 - 10:30:45                         │
└────────────────────────────────────────────────────┘
```

## 📊 Structure des données

```typescript
type IdInvoice = {
    matricule: string,
    date: string,
    times: Date[],
    count: number,
    amount?: number // ✅ NOUVEAU
}
```

## 🔄 Flux de données

1. **Création de facture** → Le montant est extrait de `invoice.amount` ou `invoice.tarification.price`
2. **Stockage** → Le montant est ajouté à l'objet `IdInvoice` et persisté
3. **Affichage** → Le montant est affiché dans la liste avec formatage

## ⚠️ Note importante

Les factures déjà créées avant cette mise à jour n'auront pas de montant car le champ est optionnel (`amount?: number`). Seules les nouvelles factures créées après cette modification afficheront le montant.

Pour les anciennes factures, le montant ne sera pas affiché (gestion gracieuse avec l'opérateur ternaire).

## 🚀 Prochaines étapes suggérées

1. **Migration des données anciennes** : Script pour retrouver les montants des factures existantes
2. **Total dans l'en-tête** : Afficher le total de toutes les factures
3. **Filtrage par montant** : Permettre de filtrer les factures par plage de montant
