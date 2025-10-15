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

    const update = (newData: Data) => {
        setData({ ...data, ...newData });
    }

    useEffect(() => {
        (async () => {
            try {
                setStatus(OperationStatus.started);
                const mode = await localStorage(Table.mode);
                let device = await localStorage(Table.device);
                const site = await localStorage(Table.site);
                device = site ? { ...device, site } : device; 

                setData({ device, apiUrl: mode ? mode : data.apiUrl });
                setStatus(OperationStatus.finish);
            } catch (error: any) {
                communicate({ content: error.message, duration: 5000 })
                setStatus(OperationStatus.error);
            }
        })();
    }, []);

    useEffect(() => {
        if(data?.apiUrl){
            // Ajouter LOCAL_BASE_URL à la liste des URLs valides
            const validUrls = [PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL];
            const apiUrl = validUrls.some(url => data.apiUrl === url) ? data.apiUrl : BASE_URL;
            persist<string>({ value: apiUrl, table: Table.mode })
                .catch((error) => {
                    throw error;
                });
        }
    }, [data.apiUrl]);

    useEffect(() => {
        if(data?.device){
            persist<Device>({ value: data.device, table: Table.device })
                .catch((error) => {
                    throw error;
                });
        }
    }, [data.device]);




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