import { useState } from "react";
import { Table, deleteAll, getItemAsync, setItemAsync } from '../local-storage';

export function usePersist() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<OperationStatus>(OperationStatus.none); // Status de l'opération

    const persist = async <DataFormat>(data : { value: DataFormat, table: Table, multiple?: boolean }) => {
        setStatus(OperationStatus.started);
        setLoading(true);
        try {
            setLoading(true);
            await setItemAsync(data.table, data.value, data?.multiple);
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

    const clear = async (tables: Table[]) => {
        setStatus(OperationStatus.started);
        try {
            tables.forEach((table) => {
                deleteAll(table);
            });
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