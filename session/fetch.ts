import { useContext, useState } from "react";
import { Session } from "./context";
import { LocalDataContext } from "../context/dataContext";
import { usePersist } from "../local-storage/local-storage";
import { Table } from "../local-storage";


export const useGetAvailableSession = () => {
    const [session, setSession] = useState<Session>();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(OperationStatus.none); // Status de l'opération
    const { persist } = usePersist<Session>(Table.sessionParking, false);
    const { apiUrl } = useContext(LocalDataContext);

    const getSession = (deviceCode: string) => {

        setLoading(true);
        setStatus(OperationStatus.started);
        //TODO: Mettre en place un nouveau lien de lancement ou de récupération de la session
        fetch(apiUrl + '/session-parking/fetch/', {
            'method': 'POST',
            'mode': 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Device-Code': deviceCode
            }
        }).then((res) => {
            if(!res.ok)
                throw new Error('Impossible d\'exécuter la requête');

            return res.json();
        }).then((data) => {
            persist(data)
                .then(() => {
                    setSession(data);
                    // TODO: Add synchronisation logic here if needed
                });
        })
        .then(() => setStatus(OperationStatus.finish))
        .catch((e) => {
            console.log(e);
            setStatus(OperationStatus.error);
        })
        
        setLoading(false);
    }

    return { session, getSession, status, loading };
}


export enum OperationStatus {
    none = 0,
    started = 1,
    finish = 2,
    error = 3
}