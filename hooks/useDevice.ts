import { useContext, useEffect, useState } from "react";
import { useLocalStorage } from "../local-storage/local-storage";
import { BASE_URL, LOCAL_BASE_URL, PROD_BASE_URL, TEST_BASE_URL } from "../api/config";
import { Device } from "../context/dataContext";
import { Table } from "../local-storage";
import { usePersist } from "../local-storage/local-storage-2";
import { FeedBackContext } from "../feedback/context";

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
                const mode = await localStorage(Table.mode);
                let device = await localStorage(Table.device);
                const site = await localStorage(Table.site);
                device = site ? { ...device, site } : device; 

                setData({ device, apiUrl: mode ? mode : BASE_URL });
                setStatus(OperationStatus.finish);
                setIsInitialized(true);
            } catch (error: any) {
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
            persist<Device>({ value: data.device, table: Table.device })
                .catch((error) => {
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