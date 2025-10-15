import { useContext, useState } from "react";
import { LocalDataContext } from "../context/dataContext";
import { SessionContext } from "../session/context";
import { WorkSessionContext } from "../context/workSession";


/**
 * 
 * Envoi des factures sur le serveur web
 */
export function useUpload() 
{
    const [count, setCount] = useState(0);
    const MAX_STEP = 3;
    const [status, setStatus] = useState(UploadStatus.none);
    const [loading, setLoading] = useState(false);
    const { session } = useContext(SessionContext);
    const { invoices } = useContext(WorkSessionContext);
    const { device, apiUrl } = useContext(LocalDataContext);

    const upload = async () => {
        setCount(0); // Initialisation du compteur
        setLoading(true);
        setStatus(UploadStatus.started);

        try {
            const invoicesToSend = invoices.map((invoice : any) => {
                return ({
                    amount: invoice?.amount,
                    tarification: '/api/tarifications/' + invoice?.tarification?.id,
                    code: invoice?.number,
                    matricule: invoice?.matricule,
                    //createdAt: invoice?.createdAt
                });
            });

            setCount(1); // Incrémentation après préparation des factures pour l'envoi à l'API
            
            // nouveau lien : /upload/session/{perceptor}/{parking}
            // const res = await fetch(apiUrl + '/upload/invoices/' + session?.id, {
            const res = await fetch(apiUrl + '/upload/session/'+ session?.account?.id +'/' + session?.parking?.id, {
                'method': 'POST',
                'mode': 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Device-Code': device?.code,
                    // 'User-Account': supervisor?.id
                },
                body: JSON.stringify({
                    invoices : invoicesToSend,
                    missing: session?.missing ? session.missing : 0,
                    invoiceMissing: session?.invoiceMissing ? session?.invoiceMissing : 0
                })
            });

            setCount(2); // Incrémentation après reception des données
            
            if(!res.ok)
                throw new Error('Impossible d\'exécuter la requête');
            
            /* await deleteAll(Table.invoice);
            await deleteAll(Table.allInvoices);
            await deleteAll(Table.sessionParking); */

            setStatus(UploadStatus.finish);
            setCount(3); // Incrémentation après finalisation de l'upload
            setLoading(false);

            return true;
            
        } catch(e) {
            console.log('Echec de l\'envoi des données' + e);
            setStatus(UploadStatus.error);
            setLoading(false);
            throw new Error('Impossible d\'envoyer les données sur le serveur');  
        }
    }

    return { upload, count, status, loading, MAX_STEP };
}

export enum UploadStatus {
    none = 0,
    started = 1,
    finish = 2,
    error = 3
}