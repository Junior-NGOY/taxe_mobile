import { useContext, useState } from "react";
import { LocalDataContext } from "../context/dataContext";
import { SessionContext } from "../session/context";
import { WorkSessionContext } from "../context/workSession";


/**
 * 
 * Envoi OPTIMISÉ du résumé de session sur le serveur web
 * 
 * NOUVELLE VERSION : N'envoie plus toutes les factures individuellement
 * Envoie seulement : montant total + nombre de factures + manquants
 * 
 * Avantages :
 * - Payload 100x plus léger (< 1KB vs 50-100KB)
 * - Temps de réponse < 1s (vs 10-30s pour 200 factures)
 * - Plus de problèmes de timeout
 * - Moins de charge serveur
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
            // ✅ NOUVELLE LOGIQUE : Calculer le résumé au lieu d'envoyer toutes les factures
            const totalAmount = invoices.reduce((sum, invoice: any) => {
                return sum + (invoice?.amount || 0);
            }, 0);
            
            const invoiceCount = invoices.length;

            setCount(1);
            
            // Déterminer l'endpoint selon le type de session (parking ou market)
            let uploadUrl;
            if (session?.parking) {
                // Session de parking - NOUVEAU ENDPOINT /summary
                uploadUrl = apiUrl + '/upload/session/summary/'+ session?.account?.id +'/' + session?.parking?.id;
            } else if (session?.market) {
                // Session de market - NOUVEAU ENDPOINT /summary
                uploadUrl = apiUrl + '/upload/session/summary/'+ session?.account?.id +'/market/' + session?.market?.id;
            } else {
                throw new Error('Session invalide: ni parking ni market défini');
            }
            
            // Upload avec timeout réduit (10s suffit maintenant)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s au lieu de 30s
            
            if (__DEV__) console.log(`📤 Upload SUMMARY tentative ${retryCount + 1}/${MAX_RETRIES}:`, uploadUrl);
            if (__DEV__) console.log(`💰 Montant total: ${totalAmount} Fc`);
            if (__DEV__) console.log(`📊 Nombre de factures: ${invoiceCount}`);
            if (__DEV__) console.log(`⚠️ Manquant: ${session?.missing || 0} Fc`);
            if (__DEV__) console.log(`🎫 Factures ratées: ${session?.invoiceMissing || 0} Fc`);
            
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
                    totalAmount: totalAmount,
                    invoiceCount: invoiceCount,
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

            if (__DEV__) console.log('✅ Upload SUMMARY réussi');
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