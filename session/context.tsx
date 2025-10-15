import React, { ReactNode, useState } from "react";
import { Account } from "../context/authContext";
import { useLocalStorage } from "../local-storage/local-storage";
import { Table, deleteAll } from "../local-storage";
import { usePersist } from "../local-storage/local-storage-2";

export const SessionContext = React.createContext<ContextData>({
    session: undefined,
    create: (session: Session) => {},
    close: () => {},
    addMissing: (data: { missing?: number, invoiceMissing?: number }) => {},
    loading: false,
});

export const Provider: React.FC<{ children: ReactNode }> = (props) => {
    const [session, setSession] = React.useState<Session>();
    const { localStorage } = useLocalStorage();
    const { persist } = usePersist();
    const [loading, setLoading] = useState(false);

    const addMissing = (data: { missing?: number, invoiceMissing?: number }) => {
        setLoading(true);
        const newSession = {...session, ...data };
        setSession(newSession);
        try {
            persist<Session>({ value: newSession, table: Table.sessionParking})
                .catch((error) => {
                    throw error;
                });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            throw new Error('Impossible de persister les manquants');
        }
    }

    const create = (session: Session) => {
        try {
            setSession(session);
            persist<Session>({ value: session, table: Table.sessionParking })
                .catch((error) => {
                    throw new Error('Impossible de persister la session');
                });
        } catch (error) {
            throw error;
        }
    };

    const close = () => {
        try {
            setSession(undefined);
            deleteAll(Table.sessionParking)
                .catch((error) => {
                    throw error;
                });
        } catch (error) {
            throw new Error('Impossible de supprimer la session');
        }
    };

    React.useEffect(() => {
        localStorage(Table.sessionParking, false)
            .then((value) => {
                setSession(value);
            })
            .catch(error => {
                throw error;
            });
    }, []);

    return (
        <SessionContext.Provider 
            value={{ session, create, close, addMissing, loading }}
        >
            {props.children}
        </SessionContext.Provider>
    );
};

type ContextData = {
    session?: Session,
    create: (session: Session) => void,
    close: () => void,
    addMissing: (data: { missing?: number, invoiceMissing?: number }) => void, 
    loading: boolean
};

export type Session = {
    id?: number|string; // Une session sans id est locale
    code?: string;
    startAt?: string|Date;
    account?: Account,
    missing?: number,
    invoiceMissing?: number,
    parking?: {
        id: number|string;
        name: string;
    },
    printingLimit?: number
};
