import AsyncStorage from '@react-native-async-storage/async-storage';

// Liste des tables disponibles dnas l'application
export enum Table {
    invoice = 'invoice',
    allInvoices = 'all-invoices',
    city= 'city',
    sessionParking = 'session-parking',
    device = 'device',
    parking = 'parking',
    account = 'account',
    tarification = 'tarification',
    site = 'site',
    mode= 'mode',
    perceptors = 'perceptors',
    supervisors = 'supervisors',
    template = 'template' // Template pour l'impression des factures
}


// Récpération d'un item en fonction de son identifiant
export async function getItemAsync(id: string) : Promise<any> 
{
    try {
        const value = await AsyncStorage.getItem(id);
        if(value !== null) {
            return JSON.parse(value);
        }
    } catch(e) {
        
    }

    return null;
}

export async function setItemAsync(table: Table, data: any, multiple: boolean = false)
{
    try {
        if(multiple){
            const items = await getItemAsync(table);
            if(Array.isArray(items))
                await AsyncStorage.setItem(table, JSON.stringify([...items, data]));
            else
                await AsyncStorage.setItem(table, JSON.stringify([data]));


        } else {
            await AsyncStorage.setItem(table, JSON.stringify(data));
        }
    } catch (e) {
        throw new Error('Impossible de persister les données');
    }
}

export async function deleteItemAsync(table: Table, index?: string | number)
{
    try {
        await AsyncStorage.removeItem(table);

    } catch(e) {
        throw new Error('Suppression des données impossible');
    }
}

export async function deleteAll(table: Table)
{
    try {
        await AsyncStorage.removeItem(table);

    } catch(e) {
        throw new Error('Suppression des données impossible');
    }
}

// Fonction pour TOUT vider (RESET COMPLET de l'app)
export async function clearAllStorage()
{
    try {
        console.log('🗑️ Suppression de toutes les données locales...');
        await AsyncStorage.clear();
        console.log('✅ Toutes les données locales ont été supprimées');
    } catch(e) {
        console.error('❌ Erreur lors de la suppression:', e);
        throw new Error('Impossible de vider le stockage');
    }
}

// Fonction pour vider toutes les tables de données (mais garder les paramètres)
export async function clearDataOnly()
{
    try {
        console.log('🗑️ Suppression des données synchronisées...');
        const tablesToClear = [
            Table.invoice,
            Table.allInvoices,
            Table.sessionParking,
            Table.site,
            Table.parking,
            Table.account,
            Table.tarification,
            Table.perceptors,
            Table.supervisors,
            Table.template
        ];
        
        for (const table of tablesToClear) {
            await AsyncStorage.removeItem(table);
        }
        
        console.log('✅ Données synchronisées supprimées (device et mode conservés)');
    } catch(e) {
        console.error('❌ Erreur lors de la suppression:', e);
        throw new Error('Impossible de vider les données');
    }
}