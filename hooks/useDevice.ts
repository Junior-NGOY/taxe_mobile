import { useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../local-storage/local-storage";
import { BASE_URL, LOCAL_BASE_URL, PROD_BASE_URL, TEST_BASE_URL } from "../api/config";
import { Device } from "../context/dataContext";
import { Table } from "../local-storage";
import { usePersist } from "../local-storage/local-storage-2";
import { FeedBackContext } from "../feedback/context";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useDevice = () => {
    const {localStorage} = useLocalStorage();
    const { persist } = usePersist();
    const { communicate } = useContext(FeedBackContext);

    const [data, setData] = useState<Data>({ apiUrl: BASE_URL }); // Utilise BASE_URL par défaut (local)
    const [status, setStatus] = useState(OperationStatus.none);
    const [isInitialized, setIsInitialized] = useState(false);

    const update = (newData: Data) => {
        setData(prevData => ({ ...prevData, ...newData }));
    }

    // Chargement initial uniquement au montage
    useEffect(() => {
        (async () => {
            try {
                setStatus(OperationStatus.started);
                console.log('📱 [useDevice] Chargement des données locales...');
                
                const mode = await localStorage(Table.mode);
                let device = await localStorage(Table.device);
                const site = await localStorage(Table.site);
                
                // NOUVELLE VALIDATION : Vérifier que le device a les champs requis
                if (device) {
                    const isValid = device.id && device.code && device.name;
                    if (!isValid) {
                        console.warn('⚠️ [useDevice] Device corrompu détecté:', device);
                        console.warn('⚠️ [useDevice] Suppression du device invalide...');
                        device = null; // Forcer le re-registration
                        await AsyncStorage.removeItem(Table.device);
                    } else {
                        console.log('✅ [useDevice] Device valide trouvé:', device.code);
                        
                        // PERSISTANCE REDONDANTE : Sauvegarder aussi le serialNumber séparément
                        try {
                            await AsyncStorage.setItem('@device_backup', JSON.stringify({
                                code: device.code,
                                id: device.id,
                                timestamp: new Date().toISOString()
                            }));
                            console.log('💾 [useDevice] Backup du device créé');
                        } catch (error) {
                            console.error('❌ [useDevice] Erreur backup:', error);
                        }
                    }
                } else {
                    console.log('📭 [useDevice] Aucun device trouvé en local');
                    
                    // RÉCUPÉRATION : Essayer le backup
                    try {
                        const backupData = await AsyncStorage.getItem('@device_backup');
                        if (backupData) {
                            const backup = JSON.parse(backupData);
                            console.log('🔄 [useDevice] Backup trouvé:', backup.code);
                            communicate({ 
                                content: `Device perdu. Code de récupération: ${backup.code}. Veuillez vous reconnecter.`, 
                                duration: 10000 
                            });
                        }
                    } catch (error) {
                        console.error('❌ [useDevice] Erreur lecture backup:', error);
                    }
                }
                
                device = site ? { ...device, site } : device; 

                setData({ device, apiUrl: mode ? mode : BASE_URL });
                setStatus(OperationStatus.finish);
                setIsInitialized(true);
                
                console.log('✅ [useDevice] Initialisation terminée. Device:', device ? device.code : 'null');
            } catch (error: any) {
                console.error('❌ [useDevice] Erreur lors du chargement:', error);
                communicate({ content: error.message, duration: 5000 })
                setStatus(OperationStatus.error);
                setIsInitialized(true);
            }
        })();
    }, []); // Pas de dépendances - s'exécute une seule fois

    // Persistence optimisée - uniquement après l'initialisation
    useEffect(() => {
        if(!isInitialized) return;
        
        if(data?.apiUrl){
            // Validation et persistence de l'URL
            const validUrls = [PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL];
            const apiUrl = validUrls.some(url => data.apiUrl === url) ? data.apiUrl : BASE_URL;
            
            persist<string>({ value: apiUrl, table: Table.mode })
                .catch((error) => {
                    if (__DEV__) console.error('Erreur persist apiUrl:', error);
                });
        }
    }, [data.apiUrl, isInitialized]);

    useEffect(() => {
        if(!isInitialized) return;
        
        if(data?.device){
            console.log('💾 [useDevice] Sauvegarde du device:', data.device.code);
            
            // Persistance principale
            persist<Device>({ value: data.device, table: Table.device })
                .then(() => {
                    console.log('✅ [useDevice] Device sauvegardé avec succès');
                    
                    // PERSISTANCE REDONDANTE : Créer un backup séparé
                    AsyncStorage.setItem('@device_backup', JSON.stringify({
                        code: data.device!.code,
                        id: data.device!.id,
                        name: data.device!.name,
                        timestamp: new Date().toISOString()
                    })).then(() => {
                        console.log('✅ [useDevice] Backup créé');
                    }).catch(err => {
                        console.error('❌ [useDevice] Erreur backup:', err);
                    });
                })
                .catch((error) => {
                    console.error('❌ [useDevice] Erreur persist device:', error);
                    if (__DEV__) console.error('Erreur persist device:', error);
                });
        }
    }, [data.device, isInitialized]);

    return { ...data, update, status };
};

export type Data = { 
    device?: Device;
    apiUrl?: string
};

export enum OperationStatus {
    none = 0,
    started = 1,
    finish = 2,
    error = 3
}