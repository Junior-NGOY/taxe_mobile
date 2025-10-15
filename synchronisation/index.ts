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
            console.log('🔄 Synchronisation démarrée');
            console.log('🔍 API URL:', apiUrl);
            console.log('🔍 Device Code:', device?.code);
            
            const res = await fetch(apiUrl + '/synchronisation', {
                headers: {
                    'Device-Code': device?.code
                }
            });

            console.log('📡 Réponse status:', res.status);
            console.log('📡 Réponse ok:', res.ok);

            if(!res.ok)
                throw new Error('Impossible d\'exécuter la requête');

            const data = await res.json();
            console.log('📦 Données reçues:', JSON.stringify(data, null, 2));
            console.log('👥 Superviseurs:', data?.supervisors?.length || 0);
            console.log('👷 Percepteurs:', data?.perceptors?.length || 0);
            console.log('💰 Tarifications:', data?.tarifications?.length || 0);
            console.log('🅿️ Parkings:', data?.parkings?.length || 0);
            
            // await clear();

            updateLocalData({ device: { ...device, site: data?.site }});
            // await setItemAsync(Table.account, [...data?.perceptors, ...data?.supervisors]);
            updateAuthData(data?.supervisors && Array.isArray(data?.supervisors) ? data?.supervisors : []);
            console.log('✅ AuthData mis à jour avec', data?.supervisors?.length || 0, 'superviseurs');
            
            updateWorkSessionData({
                tarifications: data?.tarifications && Array.isArray(data?.tarifications) ? data?.tarifications : [],
                parkings: data?.parkings && Array.isArray(data?.parkings) ? data?.parkings : [],
                perceptors: data?.perceptors && Array.isArray(data?.perceptors) ? data?.perceptors : [],
            });
            console.log('✅ WorkSessionData mis à jour');

            setStatus(OperationStatus.finish);
            setLoading(false);
            console.log('✅ Synchronisation terminée avec succès');
        }
        catch (error) {
            console.error('❌ Erreur synchronisation:', error);
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

