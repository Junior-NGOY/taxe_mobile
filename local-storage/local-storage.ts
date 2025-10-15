import { useState } from "react";
import { Table, deleteAll, getItemAsync, setItemAsync } from '../local-storage';

export function useLocalStorage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(OperationStatus.none); // Status de l'opération

    const localStorage = async (table: Table, multiple : boolean = false) => {
        setLoading(true);
        setStatus(OperationStatus.started);
        let result : any[] | any = null;
        try {
            result = await getItemAsync(table); // Récupération des items sous formes de tableau ou d'obejt
            if(!result && multiple) // Si on est censé returner un tableau mais qu'aucune valeur n'est retrouvée
                result = []; 
            else {
                if(multiple)
                    result = Array.isArray(result) ? result : [result];
            }
            setStatus(OperationStatus.finish);
            setLoading(false);
        } catch (e) {
            setStatus(OperationStatus.error);
            setLoading(false);
            throw new Error("Impossible de lire les données locales!");
        }
        
        return result;
    }
    
    return {localStorage, loading, status };
}


export function usePersist<DataFormat>(table: Table, multiple: boolean = false) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<OperationStatus>(OperationStatus.none); // Status de l'opération

    const persist = async (data: DataFormat) => {
        setStatus(OperationStatus.started);
        setLoading(true);
        try {
            setLoading(true);
            await setItemAsync(table, data, multiple);
            setStatus(OperationStatus.finish);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
            setStatus(OperationStatus.error);
            throw new Error("Impossible d'enregistrer les données!");
        }
    };

    return { persist, status, loading };
}

export function useClear() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(OperationStatus.none); // Statut de l'opération

    const clear = async () => {
        setStatus(OperationStatus.started);
        try {
            await deleteAll(Table.parking);
            await deleteAll(Table.account);
            await deleteAll(Table.tarification);
            await deleteAll(Table.perceptors);
            await deleteAll(Table.supervisors);
            // await deleteAll(Table.site);
            /* await deleteAll(Table.allInvoices);
            await deleteAll(Table.invoice);
            await deleteAll(Table.sessionParking);
            await deleteAll(Table.device);
            await deleteAll(Table.site); */


            setLoading(false);
        } catch(e) {
            setStatus(OperationStatus.error);
            setLoading(false);
            throw new Error('Impossible de supprimer les données locales!');
        }

    };

    return { clear, loading, status};
}

export enum OperationStatus {
    none = 0,
    started = 1,
    finish = 2,
    error = 3
}