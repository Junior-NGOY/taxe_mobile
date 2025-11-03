// @ts-nocheck - Disable type checking due to React 19 / react-native-paper compatibility issues
import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Button, MD2Colors as Colors, Card, Text, Portal, Modal, ProgressBar, useTheme } from 'react-native-paper';
import { TextInput } from 'react-native-paper';

import { LocalDataContext } from '../context/dataContext';
import { format } from 'date-fns/format';
import { useUpload } from '../synchronisation/upload';
import Counter from '../components/Counter';
import { WorkSessionContext, Invoice } from '../context/workSession';
import { SessionContext } from '../session/context';
import { useStart } from '../session/start';
import { FeedBackContext } from '../feedback/context';
import { useSynchronise } from '../synchronisation';
import { SessionBlockedModal } from '../components/SessionBlockedModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SelectList } from 'react-native-dropdown-select-list';
import * as Intent from 'expo-intent-launcher';
import useColorScheme from '../hooks/useColorScheme';
import ThemeColors from '../constants/Colors';

export default function TabTwoScreen({ navigation } : { navigation: { navigate: Function}}) {
    const [perceptor, setPerceptor] = React.useState('');
    const [parking, setParking] = React.useState<string>('');
    const [market, setMarket] = React.useState<string>('');
    const { upload, count, MAX_STEP } = useUpload();
    const [loading, setLoading] = React.useState(false);
    const { device } = React.useContext(LocalDataContext);
    const { invoices, parkings, markets, perceptors, reinitialiseCounter, stop, resetInvoices, unlockSession } = React.useContext(WorkSessionContext);
    const { session, addMissing, close, extendSession } = React.useContext(SessionContext);
    const { communicate } = React.useContext(FeedBackContext);
    const { start, remove, loading: startLoading } = useStart();
    // const { update } = useUpdateData();
    const { synchronise, loading: syncLoading } = useSynchronise();
    const [printingLimit, setPrintingLimit] = React.useState(1);
    const [maxDays, setMaxDays] = React.useState(3); // Nombre de jours par défaut

    const colorScheme = useColorScheme();
    const color = ThemeColors[colorScheme];

    const amount = () => {
        let amount = 0;
        invoices?.forEach((invoice: Invoice) => {
            amount += invoice?.tarification?.price;
        })
        return amount;
    };

    // Start Session
    const [visible, setVisible] = React.useState(false);
    const [missing, setMissing] = React.useState(session?.missing ? session.missing : 0); // Missing in session
    const [invoiceMissing, setInvoiceMissing] = React.useState(session?.invoiceMissing ? session.invoiceMissing : 0); // Missing in session
    const [blockedModalVisible, setBlockedModalVisible] = React.useState(false);

    // Afficher le modal de blocage quand stop = true
    React.useEffect(() => {
        if (stop && session) {
            setBlockedModalVisible(true);
        }
    }, [stop, session]);

    const showModal = () => setVisible(true);
    const hideModal = () => {
        setVisible(false);
    };

    const handleMissing = (missing: number, invoiceMissing: number) => {
        addMissing({ missing, invoiceMissing });
        hideModal();
    };

    const handleUpload = async () => {
        setLoading(true);
        try {
            await upload();
            close();
            reinitialiseCounter();

            await synchronise(); // Qu'import l'issue, on tente aussi de synchroniser les données

            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            communicate({ content: error.message });
        }
    };

    const handleExtendSession = (days: number) => {
        extendSession(days);
        unlockSession();
        setBlockedModalVisible(false);
        communicate({ content: `Session prolongée de ${days} jours`, duration: 5000 });
    };

    const handleResetInvoices = async () => {
        try {
            // Créer le contenu du fichier de traçabilité
            const now = new Date();
            const timestamp = format(now, 'yyyy-MM-dd_HH-mm-ss');
            const deviceCode = device?.code || 'UNKNOWN';
            const sessionId = session?.id || 'N/A';
            const perceptorName = session?.account?.person?.name || 'N/A';
            const parkingName = session?.parking?.name || session?.market?.name || 'N/A';
            const invoiceCount = invoices.length;
            
            // Calculer le montant total (avec conversion en nombre)
            const totalAmount = invoices.reduce((sum, inv) => {
                const amount = typeof inv.amount === 'string' ? parseFloat(inv.amount) : inv.amount;
                return sum + (amount || 0);
            }, 0);
            
            // Construire le contenu du fichier
            let fileContent = '========================================\n';
            fileContent += '   TRAÇABILITÉ - SUPPRESSION FACTURES\n';
            fileContent += '========================================\n\n';
            fileContent += `Date de suppression: ${format(now, 'dd/MM/yyyy HH:mm:ss')}\n`;
            fileContent += `Appareil: ${deviceCode}\n`;
            fileContent += `Session ID: ${sessionId}\n`;
            fileContent += `Percepteur: ${perceptorName}\n`;
            fileContent += `Parking/Marché: ${parkingName}\n`;
            fileContent += `Nombre de factures supprimées: ${invoiceCount}\n`;
            fileContent += `Montant total: ${totalAmount} Fc\n\n`;
            fileContent += '========================================\n';
            fileContent += '   DÉTAILS DES FACTURES SUPPRIMÉES\n';
            fileContent += '========================================\n\n';
            
            // Ajouter les détails de chaque facture
            invoices.forEach((invoice, index) => {
                fileContent += `Facture ${index + 1}:\n`;
                fileContent += `  - Numéro: ${invoice.number || 'N/A'}\n`;
                fileContent += `  - Matricule: ${invoice.matricule || 'N/A'}\n`;
                fileContent += `  - Type véhicule: ${invoice.tarification?.name || 'N/A'}\n`;
                fileContent += `  - Montant: ${invoice.amount || 0} Fc\n`;
                fileContent += `  - Date création: ${invoice.createdAt ? format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm:ss') : 'N/A'}\n`;
                fileContent += '\n';
            });
            
            fileContent += '========================================\n';
            fileContent += `Fichier généré par: ${deviceCode}\n`;
            fileContent += '========================================\n';
            
            // Définir la clé de stockage unique
            const fileName = `RESET_${deviceCode}_${timestamp}`;
            
            // Sauvegarder le fichier dans AsyncStorage
            await AsyncStorage.setItem(fileName, fileContent);
            
            // Récupérer la liste des fichiers de traçabilité existants
            const existingFiles = await AsyncStorage.getItem('RESET_TRACE_FILES');
            const filesList = existingFiles ? JSON.parse(existingFiles) : [];
            
            // Ajouter le nouveau fichier à la liste
            filesList.push({
                key: fileName,
                timestamp: now.toISOString(),
                deviceCode,
                invoiceCount,
                totalAmount
            });
            
            // Sauvegarder la liste mise à jour
            await AsyncStorage.setItem('RESET_TRACE_FILES', JSON.stringify(filesList));
            
            // Réinitialiser les factures
            resetInvoices();
            setBlockedModalVisible(false);
            
            communicate({ 
                content: `Factures réinitialisées. Fichier de traçabilité créé: ${fileName}.txt`, 
                duration: 7000 
            });
            
            console.log('Fichier de traçabilité créé dans AsyncStorage:', fileName);
            console.log('Contenu:', fileContent);
        } catch (error: any) {
            console.error('Erreur lors de la création du fichier de traçabilité:', error);
            // Réinitialiser quand même les factures même si le fichier échoue
            resetInvoices();
            setBlockedModalVisible(false);
            communicate({ 
                content: 'Factures réinitialisées (erreur fichier de traçabilité)', 
                duration: 5000 
            });
        }
    };

    return (
        <View style={styles.containerStyle}>
            { !session && (
                <ScrollView>
                    <Title style={styles.title}>Nouvelle session</Title>
                        <View style={styles.selectStyle}>
                            <SelectList 
                                boxStyles={{ borderColor: color.tabIconDefault }}
                                inputStyles={{ color: color.text }}
                                dropdownStyles={{ borderColor: color.tabIconDefault }}
                                dropdownTextStyles={{ color: color.text }}
                                dropdownItemStyles={{ borderColor: color.tabIconDefault }}
                                setSelected={(val: string) => setPerceptor(val)} 
                                data={(perceptors ? perceptors : [])?.map(perceptor => ({ value: perceptor.person?.name ? perceptor.person?.name: '-', key: perceptor.id }))} 
                                save="key"
                                placeholder='Sectionner un percepteur'
                                searchPlaceholder='Rechercher'
                            />
                        </View>
                        <View style={styles.selectStyle}>
                            <SelectList 
                                boxStyles={{ borderColor: color.tabIconDefault }}
                                inputStyles={{ color: color.text }}
                                dropdownStyles={{ borderColor: color.tabIconDefault }}
                                dropdownTextStyles={{ color: color.text }}
                                dropdownItemStyles={{ borderColor: color.tabIconDefault }}
                                setSelected={(val: string) => {
                                    if (device?.site?.type === 'TAXE_MARKET') {
                                        setMarket(val);
                                    } else {
                                        setParking(val);
                                    }
                                }} 
                                data={
                                    device?.site?.type === 'TAXE_MARKET' 
                                        ? (markets ? markets : []).map(market => ({ value: market.name, key: market.id }))
                                        : (parkings ? parkings : []).map(parking => ({ value: parking.name, key: parking.id }))
                                } 
                                save="key"
                                placeholder={device?.site?.type === 'TAXE_MARKET' ? 'Sélectionner un marché' : 'Sélectionner un parking'}
                                searchPlaceholder='Rechercher'
                            />
                        </View>
                        <View style={styles.selectStyle}>
                            <SelectList 
                                boxStyles={{ borderColor: color.tabIconDefault }}
                                inputStyles={{ color: color.text }}
                                dropdownStyles={{ borderColor: color.tabIconDefault }}
                                dropdownTextStyles={{ color: color.text }}
                                dropdownItemStyles={{ borderColor: color.tabIconDefault }}
                                setSelected={(val: number) => setPrintingLimit(val)} 
                                data={[{ value: '1', key: 1 },{ value: '2', key: 2 }, { value: '3', key: 3 }, { value: '4', key: 4 }]} 
                                save="key"
                                placeholder='Selectionner le nombre de tentative'
                                searchPlaceholder='Rechercher'
                            />
                        </View>
                        <View style={styles.selectStyle}>
                            <Text style={{ color: color.text, marginBottom: 8, fontSize: 14 }}>Nombre de jours avant blocage (max: 7)</Text>
                            <TextInput
                                mode="outlined"
                                keyboardType="number-pad"
                                value={maxDays.toString()}
                                onChangeText={(text) => {
                                    // Si le champ est vide, garder l'état vide temporairement
                                    if (text === '' || text === '0') {
                                        setMaxDays(3); // Réinitialiser à 3 si vide ou 0
                                        return;
                                    }
                                    
                                    const days = parseInt(text);
                                    
                                    // Vérifier si c'est un nombre valide
                                    if (isNaN(days)) {
                                        return; // Ignorer les entrées non numériques
                                    }
                                    
                                    // Limiter entre 1 et 7
                                    if (days > 7) {
                                        communicate({ content: 'Le nombre de jours ne peut pas dépasser 7', duration: 3000 });
                                        setMaxDays(7);
                                    } else if (days < 1) {
                                        setMaxDays(1);
                                    } else {
                                        setMaxDays(days);
                                    }
                                }}
                                placeholder="Ex: 3"
                                style={{ backgroundColor: color.background }}
                                outlineColor={color.tabIconDefault}
                                activeOutlineColor={Colors.blue600}
                            />
                        </View>
                        <View>
                            {(startLoading) && (<Text style={{ textAlign: 'center', marginTop: 10 }}>Opération en cours...</Text>)}
                            {<ProgressBar visible={startLoading } indeterminate style={{ height: 5, borderRadius: 2, marginTop: 15, marginHorizontal: 10 }} color={Colors.blue600}/>}
                        </View>
                        
                        <Button onPress={() => Intent.startActivityAsync(Intent.ActivityAction.DATE_SETTINGS)}>Régler la date</Button>
                        <Button 
                            style={styles.startButton} 
                            disabled={startLoading} 
                            onPress={() => start({ 
                                perceptor, 
                                parking: device?.site?.type === 'TAXE_MARKET' ? undefined : parking,
                                market: device?.site?.type === 'TAXE_MARKET' ? market : undefined,
                                printingLimit,
                                maxDays
                            })}
                        >
                            Commencer
                        </Button>
                </ScrollView>
            )}
            {session && (
                <>
                <ScrollView 
                        contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }}
                        showsVerticalScrollIndicator={true}
                    >
                        <Card>
                            <Card.Content>
                                <Title style={styles.title}>Details de la session</Title>
                                <Text style={styles.detail}>Session No. {session?.id}</Text>
                                <Text style={styles.detail}>Percepteur: {session?.account?.person?.name}</Text>
                                <Text style={styles.detail}>
                                    {session?.parking ? 'Parking' : 'Marché'}: {session?.parking?.name || session?.market?.name}
                                </Text>
                                <Text style={styles.detail}>Site: {device?.site?.name}</Text>
                                <Text style={styles.detail}>Montant: {(() => amount())()} Fc</Text>
                                <Text style={styles.detail}>Manquant: {session?.missing ? session.missing : 0} Fc</Text>
                                <Text style={styles.detail}>Factures ratés: {session?.invoiceMissing ? session.invoiceMissing : 0} Fc</Text>
                                <Text style={styles.detail}>Nombre de facture: {invoices?.length ? invoices.length : 0}</Text>
                                <Text style={styles.detail}>Début: {session?.startAt ? format(new Date(session?.startAt), 'dd/MM/yyy HH:mm:ss'): format(new Date(), 'dd/MM/yyy HH:mm:ss')}</Text>
                                <Text style={styles.detail}>Nombre d'essai: {session.printingLimit}</Text>
                                <Text style={styles.detail}>Véhicules:</Text>
                                <Counter />
                            </Card.Content>
                            <Card.Content>
                                {(loading) && (<Text style={{ textAlign: 'center' }}>Upload en cours...</Text>)}
                                {(syncLoading) && (<Text style={{ textAlign: 'center' }}>Synchronisation en cours...</Text>)}
                                {<ProgressBar visible={loading || syncLoading} indeterminate style={{ height: 5, borderRadius: 2, marginTop: 20 }} color={Colors.blue600}/>}
                            </Card.Content>
                            <Card.Content>
                                <View>
                                    {(startLoading) && (<Text style={{ textAlign: 'center', marginTop: 10 }}>Opération en cours...</Text>)}
                                    {<ProgressBar visible={startLoading } indeterminate style={{ height: 5, borderRadius: 2, marginTop: 15, marginHorizontal: 10 }} color={Colors.blue600}/>}
                                </View>
                                <Button onPress={showModal}>Ajouter manquant</Button>
                                <Button 
                                    disabled={loading} 
                                    onPress={() => handleUpload()}
                                    style={{ marginBottom: 10 }}
                                >
                                    Cloturer la session
                                </Button>
                                <Button disabled={Boolean(invoices.length) || startLoading} onPress={() => remove()}>Redemarer la session</Button>
                            </Card.Content>
                        </Card>
                    </ScrollView>
                    
                    <Portal>
                        <Modal 
                            visible={visible} 
                            contentContainerStyle={styles.modal}
                            onDismiss={hideModal}>
                            {session && (
                                <Card>
                                    <Card.Title title={'Manquant (Fc)'}/>
                                    <Card.Content>
                                        <TextInput
                                            value={missing + ''}
                                            keyboardType={'numeric'}
                                            onChangeText={(text) => {
                                                let missing = parseFloat(text);
                                                if(missing) setMissing(missing);
                                                else {
                                                    setMissing(0);
                                                }
                                            }}
                                            mode={'outlined'}
                                            autoFocus={true}
                                            label='Manquant'
                                            style={{marginBottom: 15}}
                                            />
                                        <TextInput
                                            value={invoiceMissing+''}
                                            keyboardType={'numeric'}
                                            onChangeText={(text) => {
                                                let missing = parseFloat(text);
                                                if(missing) setInvoiceMissing(missing);
                                                else {
                                                    setInvoiceMissing(0);
                                                }
                                            }}
                                            mode={'outlined'}
                                            label='Factures ratés'
                                            />
                                    </Card.Content>
                                    <Card.Actions style={{justifyContent: 'flex-end'}}>
                                        <Button onPress={() => hideModal()}>Annuler</Button>
                                        <Button onPress={() => handleMissing(missing, invoiceMissing)}>Valider</Button>
                                    </Card.Actions>
                                </Card>
                            )}
                        </Modal>
                    </Portal>
                    
                    <SessionBlockedModal
                        visible={blockedModalVisible}
                        onDismiss={() => setBlockedModalVisible(false)}
                        onExtend={handleExtendSession}
                        onReset={handleResetInvoices}
                        currentMaxDays={session?.maxDays ?? 2}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
    },
    selectStyle: {
        marginBottom: 15,
        marginHorizontal: 10
    },
    title: {
        textAlign: 'center',
        marginVertical: 5,
        color: Colors.blue600
    },
    startButton: {
        marginHorizontal: 10,
        marginBottom: 50,
        color: Colors.blue600
    },
    detail: {
        textAlign: 'center',
        fontSize: 17,
        marginVertical: 5
    },
    modal: {
        marginHorizontal: 20
    }
});

