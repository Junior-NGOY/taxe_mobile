import { useContext, useEffect, useState } from "react";
import { IdInvoice, Invoice, WorkSessionContext } from "./workSession";
import { format } from "date-fns";
import { usePersist } from "../local-storage/local-storage";
import { Table } from "../local-storage";


export const useInvoice = () => {
    const [loading, setLoading] = useState(false); 

    const { persist }  = usePersist<Invoice>(Table.invoice, true);
    const { persist: persistIds }  = usePersist<IdInvoice>(Table.allInvoices, true);
    const { tracedInvoices } = useContext(WorkSessionContext);
    const [ids, setIds] = useState<Map<string, IdInvoice>>(new Map([]));

    useEffect(() => {
        let invoices = new Map<string, IdInvoice>(tracedInvoices.map(item => [item.matricule, item]));
        setIds(invoices);
    }, [tracedInvoices]);

    const add = async (invoice: Invoice) => { // Fonction d'ajout des factures dans la bdd locale
        setLoading(true);
        const date = invoice?.createdAt ? invoice?.createdAt : new Date();
        try {
            let occurence = ids.get(invoice.matricule);
            if(occurence && occurence.date === format(date, 'dd/MM/yyyy')){
                occurence = { ...occurence, count: occurence.count + 1, times: [...occurence.times, date] };

                persistIds(occurence); // Opération secondaire asynchrone

            } else {
                persist(invoice)
                    .then(() => {
                        occurence = { matricule: invoice.matricule, date: format(date, 'dd/MM/yyyy'), count: 1, times: [date]};
                        persistIds(occurence); // Opération secondaire asynchrone
                        setLoading(false);
                    })
                    .catch((error) => {
                        throw new Error('Erreur lors de la persistence des données');
                    });  
            }

        } catch (error) {
            setLoading(false);
            throw new Error("Erreur lors de la création de la facture");
        }

    };

    return { add, loading };

};
