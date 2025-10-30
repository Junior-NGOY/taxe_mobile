import { useContext, useState } from "react";
import { Device, LocalDataContext } from '../context/dataContext';

/**
 * 
 * Enregistrer l'appareil au niveau de l'API ...
 */
export const useRegisterDevice = () => {
    const [loading, setLoading] = useState(false);
    const { apiUrl } = useContext(LocalDataContext);

    const register = async (code: string) => {
        let device: Device|undefined = undefined;
        setLoading(true);
        try {
            let res: any = null; 
            try {
                // Convertir le code en majuscules pour qu'il corresponde toujours au format base de données
                const normalizedCode = code.trim().toUpperCase();
                
                // Utiliser la bonne route: /api/devices/serial/:deviceId
                const url = apiUrl + '/devices/serial/' + normalizedCode;
                console.log('🔍 URL de registration:', url);
                console.log('🔍 API URL:', apiUrl);
                console.log('🔍 Code original:', code);
                console.log('🔍 Code normalisé:', normalizedCode);
                res = await fetch(url);
                console.log('📡 Réponse status:', res.status);
                console.log('📡 Réponse ok:', res.ok);
            } catch (error) {
                console.error('❌ Erreur de requête:', error);
                throw new Error('Impossible d\'exécuter la requête. Vérifiez votre connexion.');
            }

            if(!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('Erreur réponse:', errorData);
                throw new Error(errorData.error || "Aucun périphérique trouvé avec ce code");
            }

            const data = await res.json();
            console.log('Device data reçu:', data);
            
            // Le backend retourne maintenant le format Symfony: { device: { id, code, name, state, site } }
            device = data?.device;
            
            if(!device || !device.site)
                throw new Error("Périphérique incompatible ou site non configuré");

            setLoading(false);
            return device;
        } catch (error) {
            setLoading(false);
            console.error('Erreur dans register:', error);
            throw error;
        }
    }

    return { register, loading };
}