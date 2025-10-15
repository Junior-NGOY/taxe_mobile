/**
 * Utilitaire pour réinitialiser complètement l'application
 * Utilisé pour les tests et le développement
 */

import { clearAllStorage, clearDataOnly } from '../local-storage';

/**
 * Reset complet de l'application (TOUT supprimer)
 * Utiliser pour recommencer complètement à zéro
 */
export async function resetCompleteApp() {
    console.log('🔥 RESET COMPLET DE L\'APPLICATION...');
    try {
        await clearAllStorage();
        console.log('✅ Application réinitialisée avec succès !');
        console.log('📱 Redémarrez l\'application pour voir les changements.');
        return { success: true, message: 'App réinitialisée avec succès' };
    } catch (error: any) {
        console.error('❌ Erreur lors du reset:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Reset uniquement les données synchronisées (garder device et mode)
 * Utiliser pour resynchroniser avec de nouvelles données
 */
export async function resetDataOnly() {
    console.log('🗑️ RESET DES DONNÉES SYNCHRONISÉES...');
    try {
        await clearDataOnly();
        console.log('✅ Données supprimées avec succès !');
        console.log('🔄 Vous pouvez maintenant resynchroniser.');
        return { success: true, message: 'Données supprimées avec succès' };
    } catch (error: any) {
        console.error('❌ Erreur lors de la suppression:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Pour utiliser dans la console de développement :
 * 
 * import { resetCompleteApp, resetDataOnly } from './utils/resetApp';
 * 
 * // Reset complet
 * resetCompleteApp();
 * 
 * // Reset données seulement
 * resetDataOnly();
 */
