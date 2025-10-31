import { ReactNode, createContext, useEffect, useState, useContext } from "react";
import { useLocalStorage, usePersist } from "../local-storage/local-storage";
import { usePersist as usePersistV2 } from "../local-storage/local-storage-2";
import { Table } from "../local-storage";
import { format, toDate } from "date-fns";
import { useWorkSession } from "../hooks/useWorkSession";
import { differenceInDays } from "date-fns/differenceInDays";
import { SessionContext } from "../session/context";

export const WorkSessionContext = createContext<DataContext>({
    invoices: [],
    addInvoice: (invoice: any, duplicate?: boolean): void => {},
    reinitialiseCounter: (): void => {},
    resetInvoices: (): void => {},
    parkings: [],
    markets: [],
    perceptors: [],
    tracedInvoices: [],
    tarifications: [],
    update: (data: { tarifications?: Tarification[], perceptors?: Perceptor[], parkings?: Parking[], markets?: Market[] }) => {},
    stop: false,
    unlockSession: (): void => {}
});

export const Provider: React.FC<{ children: ReactNode }> = (props) => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stop, setStop] = useState(false);
    const data = useWorkSession();
    const { session } = useContext(SessionContext); // Accéder à la session pour maxDays

    const {localStorage} = useLocalStorage();
    const { persist }  = usePersist<Invoice>(Table.invoice, true);
    const { persist: persistIds }  = usePersist<IdInvoice[]>(Table.allInvoices);

    const { persist: persistV2 } = usePersistV2();

    // Liste des matricules déjà facturés en un jour donné
    const [ids, setIds] = useState<IdInvoice[]>([]);

    const addInvoice = (invoice: Invoice, duplicate?: boolean) => {
        let occurence: IdInvoice|undefined = undefined;
        const date = invoice?.createdAt ? invoice?.createdAt : new Date();
        const amount = typeof invoice.amount === 'number' ? invoice.amount : (typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.tarification.price);
        
        try {
            if(!duplicate) {
                setInvoices([...invoices, invoice]);
                occurence = { matricule: invoice.matricule, date: format(date, 'dd/MM/yyyy'), count: 1, times: [date], amount};

                persist(invoice)
                    .catch(error => {
                        throw error;
                    });
                const newIds = [...ids, occurence];
                setIds(newIds);

                persistIds(newIds)
                    .catch((error) => {
                        throw error;
                    });
                
            } else {
                const index = ids.length - 1;
                let occurence = ids[index];
                if(occurence) {
                    occurence = { ...occurence, count: occurence?.count + 1, times: [...occurence.times, date]};
                    let newIds = ids;
                    newIds[index] = occurence;
                    setIds(newIds);

                    persistIds(newIds)
                        .catch((error) => {
                            throw error;
                        });
                }
            }
        } catch (error) {
            throw new Error("Erreur lors de la création de la facture" );
        }
    };

    const reinitialiseCounter = () => {
        try {
            setInvoices([]);
            setIds([]);
            persistV2<Invoice[]>({ value: [], table: Table.invoice });
            persistV2<IdInvoice[]>({ value: [], table: Table.allInvoices });
            setStop(false);
        } catch (error) {
            throw error;
        }
    };

    const resetInvoices = () => {
        try {
            setInvoices([]);
            setIds([]);
            persistV2<Invoice[]>({ value: [], table: Table.invoice });
            persistV2<IdInvoice[]>({ value: [], table: Table.allInvoices });
            setStop(false); // Déverrouiller après reset
        } catch (error) {
            throw new Error("Erreur lors de la réinitialisation des factures");
        }
    };

    const unlockSession = () => {
        setStop(false);
    };

    useEffect(() => {
        // Recupération des données dans le local storage
        localStorage(Table.invoice, true)
            .then((values : Invoice[]) => {
                setInvoices(values);
            })
            .catch(e => console.log('App component => ', e));

        localStorage(Table.allInvoices, true)
            .then((values : IdInvoice[]) => {
                setIds(values);
            })
            .catch(e => console.log('App component => ', e));
    }, []);

    useEffect(() => {
        if(invoices.length > 0 && session) {
            let first = invoices[0];
    
            first.createdAt = typeof first.createdAt === 'string' ? new Date(first.createdAt) : first.createdAt;
            
            // Utiliser maxDays de la session (par défaut 2 si non défini)
            const maxDaysAllowed = session.maxDays ?? 2;
            
            if(differenceInDays(new Date(), first.createdAt) > maxDaysAllowed) {
                setStop(true);
            }
        }
    }, [invoices, session]);

    return (
        <WorkSessionContext.Provider 
            value={{ 
                invoices,
                addInvoice,
                reinitialiseCounter,
                resetInvoices,
                unlockSession,
                tracedInvoices: Array.from(ids.values()),
                stop,
                ...data
            }}
        >
            {props.children}
        </WorkSessionContext.Provider>
    );
};


type DataContext = {
    invoices: Invoice[],
    addInvoice: (invoice: any, duplicate?: boolean) => void,
    reinitialiseCounter: () => void,
    resetInvoices: () => void,
    unlockSession: () => void,
    perceptors?: Perceptor[],
    parkings?: Parking[],
    markets?: Market[],
    tracedInvoices: IdInvoice[],
    tarifications?: Tarification[],
    update: (data: { tarifications?: Tarification[], perceptors?: Perceptor[], parkings?: Parking[], markets?: Market[] }) => void,
    stop?: boolean
};

export interface Invoice { 
    matricule: string, 
    tarification: {
        id: string,
        name: string, 
        price: number,
        code?: string
    },
    amount?: string|number,
    createdAt: Date,
    localId?: string,
    number?: string
};

export type IdInvoice = {
    matricule: string,
    date: string,
    times: Date[],
    count: number,
    amount?: number // Montant de la facture
}

export type Perceptor = {
    id: string,
    username?: string,
    userIdentifier: string,
    password: string,
    person?: {
        id?: string,
        name: string
    }
};

export type Parking = {
    id: number|string;
    name: string;
};

export type Market = {
    id: number|string;
    name: string;
    stallCount?: number;
};


export interface Device {
    id: string,
    name: string,
    state: string,
    code: string,
    site: {
        id: string,
        name: string
    }
};

export type Tarification = {
    id: string;
    price: number;
    name: string;
    vehicleType: {
        icon: string
    }
};

export type { DataContext };