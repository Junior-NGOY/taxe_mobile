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

    const upload = async (retryCount = 0) => {
        const MAX_RETRIES = 3;
        
        setCount(0);
        setLoading(true);
        setStatus(UploadStatus.started);

        try {
            // Préparation des données
            const invoicesToSend = invoices.map((invoice : any) => ({
                amount: invoice?.amount,
                tarification: '/api/tarifications/' + invoice?.tarification?.id,
                code: invoice?.number,
                matricule: invoice?.matricule,
            }));

            setCount(1);
            
            // Déterminer l'endpoint selon le type de session (parking ou market)
            let uploadUrl;
            if (session?.parking) {
                // Session de parking
                uploadUrl = apiUrl + '/upload/session/'+ session?.account?.id +'/' + session?.parking?.id;
            } else if (session?.market) {
                // Session de market
                uploadUrl = apiUrl + '/upload/session/'+ session?.account?.id +'/market/' + session?.market?.id;
            } else {
                throw new Error('Session invalide: ni parking ni market défini');
            }
            
            // Upload avec timeout de 30s (connexions lentes)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout pour connexions lentes
            
            if (__DEV__) console.log(`📤 Upload tentative ${retryCount + 1}/${MAX_RETRIES}:`, uploadUrl);
            
            const res = await fetch(uploadUrl, {
                method: 'POST',
                mode: 'cors',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Device-Code': device?.code,
                },
                body: JSON.stringify({
                    invoices : invoicesToSend,
                    missing: session?.missing || 0,
                    invoiceMissing: session?.invoiceMissing || 0
                })
            });

            clearTimeout(timeoutId);
            setCount(2);
            
            if(!res.ok) {
                const errorText = await res.text().catch(() => 'Erreur serveur');
                if (__DEV__) console.log('❌ Réponse serveur:', res.status, errorText);
                throw new Error(`Erreur serveur (${res.status}): ${errorText}`);
            }

            if (__DEV__) console.log('✅ Upload réussi');
            setStatus(UploadStatus.finish);
            setCount(3);
            setLoading(false);

            return true;
            
        } catch(e: any) {
            if (__DEV__) console.log('❌ Echec upload:', e.name, e.message);
            
            // Retry automatique sur timeout ou erreur réseau
            if (retryCount < MAX_RETRIES - 1) {
                const isNetworkError = e.name === 'AbortError' || e.name === 'TypeError' || e.message.includes('Network');
                
                if (isNetworkError) {
                    if (__DEV__) console.log(`🔄 Retry ${retryCount + 1}/${MAX_RETRIES - 1}...`);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s avant retry
                    return upload(retryCount + 1); // Retry récursif
                }
            }
            
            setStatus(UploadStatus.error);
            setLoading(false);
            
            // Message d'erreur détaillé
            let errorMessage = 'Impossible d\'envoyer les données sur le serveur';
            if (e.name === 'AbortError') {
                errorMessage = 'Timeout: connexion trop lente. Vérifiez votre réseau';
            } else if (e.name === 'TypeError') {
                errorMessage = 'Erreur réseau: vérifiez votre connexion internet';
            } else if (e.message) {
                errorMessage = e.message;
            }
            
            throw new Error(errorMessage);  
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