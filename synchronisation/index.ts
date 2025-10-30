// LOCAL STORAGE
import { useContext, useState } from 'react';
import { LocalDataContext } from '../context/dataContext';
import { AuthContext } from '../context/authContext';
import { WorkSessionContext } from '../context/workSession';

/**
 * Mise à jour des données locales sur base des données du serveurs
 * 
 */
// TODO: Ajout de la prise en charge du cas de réussite de persistence partielle des données en local
export function useSynchronise() {
    const [status, setStatus] = useState(OperationStatus.none); // Statut de l'opération
    const [loading, setLoading] = useState(false);
    const { apiUrl, device } = useContext(LocalDataContext);

    // Fonctions de mise à jour via setState
    const { update: updateLocalData } = useContext(LocalDataContext);
    const { update: updateAuthData } = useContext(AuthContext);
    const { update: updateWorkSessionData } = useContext(WorkSessionContext);

    const synchronise = async () => {
        setStatus(OperationStatus.started);
        setLoading(true);

        try {
            // Logs conditionnels uniquement en développement (optimisation performance)
            if (__DEV__) {
                console.log('🔄 Synchronisation démarrée');
                console.log('🔍 API URL:', apiUrl);
                console.log('🔍 Device Code:', device?.code);
            }
            
            const res = await fetch(apiUrl + '/synchronisation', {
                headers: {
                    'Device-Code': device?.code
                }
            });

            if(!res.ok)
                throw new Error('Impossible d\'exécuter la requête');

            const data = await res.json();
            
            // Logs légers uniquement en développement
            if (__DEV__) {
                console.log('📦 Données:', {
                    supervisors: data?.supervisors?.length || 0,
                    perceptors: data?.perceptors?.length || 0,
                    tarifications: data?.tarifications?.length || 0,
                    parkings: data?.parkings?.length || 0,
                    markets: data?.markets?.length || 0
                });
            }

            updateLocalData({ device: { ...device, site: data?.site }});
            updateAuthData(data?.supervisors && Array.isArray(data?.supervisors) ? data?.supervisors : []);
            
            updateWorkSessionData({
                tarifications: data?.tarifications && Array.isArray(data?.tarifications) ? data?.tarifications : [],
                parkings: data?.parkings && Array.isArray(data?.parkings) ? data?.parkings : [],
                markets: data?.markets && Array.isArray(data?.markets) ? data?.markets : [],
                perceptors: data?.perceptors && Array.isArray(data?.perceptors) ? data?.perceptors : [],
            });

            setStatus(OperationStatus.finish);
            setLoading(false);
            
            if (__DEV__) console.log('✅ Synchronisation terminée');
        }
        catch (error) {
            if (__DEV__) console.error('❌ Erreur synchronisation:', error);
            setStatus(OperationStatus.error);
            setLoading(false);
            throw error;
        }
    };

    return { synchronise, status, loading: loading };
}

export enum OperationStatus {
    none = 0,
    started = 1,
    finish = 2,
    error = 3
}

