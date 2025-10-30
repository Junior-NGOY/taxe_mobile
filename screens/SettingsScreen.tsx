import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    Provider, 
    Title, 
    MD2Colors as Colors, 
    Card, 
    IconButton, 
    ProgressBar,
    Chip
// @ts-ignore
} from 'react-native-paper';
import { useSynchronise } from '../synchronisation';
import { LocalDataContext } from '../context/dataContext';
import { PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL } from '../api/config';
import { FeedBackContext } from '../feedback/context';
import { usePrint } from '../invoice-templates/usePrint';
import { clearAllStorage, clearDataOnly } from '../local-storage';
import { AuthContext } from '../context/authContext';
import { SupervisorPasswordModal } from '../components/SupervisorPasswordModal';
// @ts-ignore - Icon library type issue
import MaterialCommunityIcons from '@svgr-iconkit/material-community';
import * as Updates from 'expo-updates';

export default function SettingsScreen() {
    const { communicate } = React.useContext(FeedBackContext);
    const { synchronise, loading } = useSynchronise();
    const { apiUrl, device } = React.useContext(LocalDataContext);
    const { print } = usePrint();
    const { mode, supervisors } = React.useContext(AuthContext);

    // États pour les modals de confirmation
    const [clearDataModalVisible, setClearDataModalVisible] = React.useState(false);
    const [resetAppModalVisible, setResetAppModalVisible] = React.useState(false);

    const handleClearData = () => {
        // Vérifier si on est en mode superviseur
        if (mode !== 'supervisor') {
            communicate({ 
                content: '🔒 Action réservée aux superviseurs uniquement', 
                duration: 3000 
            });
            return;
        }

        // Vérifier qu'il y a des superviseurs enregistrés
        if (supervisors.length === 0) {
            communicate({ 
                content: '⚠️ Aucun superviseur enregistré. Veuillez synchroniser d\'abord.', 
                duration: 4000 
            });
            return;
        }

        // Ouvrir le modal de confirmation avec mot de passe
        setClearDataModalVisible(true);
    };

    const handleResetApp = () => {
        // Vérifier si on est en mode superviseur
        if (mode !== 'supervisor') {
            communicate({ 
                content: '🔒 Action réservée aux superviseurs uniquement', 
                duration: 3000 
            });
            return;
        }

        // Vérifier qu'il y a des superviseurs enregistrés
        if (supervisors.length === 0) {
            communicate({ 
                content: '⚠️ Aucun superviseur enregistré. Veuillez synchroniser d\'abord.', 
                duration: 4000 
            });
            return;
        }

        // Ouvrir le modal de confirmation avec mot de passe
        setResetAppModalVisible(true);
    };

    // Fonction exécutée après validation du mot de passe pour clearData
    const executeClearData = async () => {
        try {
            await clearDataOnly();
            communicate({ 
                content: '✅ Données supprimées ! Redémarrage...', 
                duration: 3000 
            });
            
            // Redémarrer l'app après 2 secondes
            setTimeout(async () => {
                await Updates.reloadAsync();
            }, 2000);
        } catch (error: any) {
            communicate({ 
                content: '❌ Erreur: ' + error.message, 
                duration: 5000 
            });
        }
    };

    // Fonction exécutée après validation du mot de passe pour resetApp
    const executeResetApp = async () => {
        try {
            await clearAllStorage();
            communicate({ 
                content: '✅ App réinitialisée ! Redémarrage...', 
                duration: 3000 
            });
            
            // Redémarrer l'app après 2 secondes
            setTimeout(async () => {
                await Updates.reloadAsync();
            }, 2000);
        } catch (error: any) {
            communicate({ 
                content: '❌ Erreur: ' + error.message, 
                duration: 5000 
            });
        }
    };

    return (
        <View style={styles.containerStyle}>
            <Provider>
                <Card style={{flex: 1}}>
                    <Card.Content>
                        <Title style={styles.title}>Details du terminal</Title>
                        <View style={styles.detail}>
                            <Chip>Serie: {device?.code}</Chip>
                        </View>
                        <View style={styles.detail}>
                            <Chip>Site: {device?.site?.name}</Chip>
                        </View>
                        <View style={styles.detail}>
                            <Chip>Mode: { 
                                apiUrl === PROD_BASE_URL ? 'Production' : 
                                apiUrl === LOCAL_BASE_URL ? 'Local' : 'Test'
                            }</Chip>
                        </View>
                    </Card.Content>
                    <Card.Content style={styles.actions}>
                        <IconButton
                            icon={(props) => <MaterialCommunityIcons name='refresh' {...props} />}
                            size={30}
                            onPress={() => {
                                synchronise()
                                    .then(() => {
                                        communicate({ content: 'Synchronisation effectuée !', duration: 5000 });
                                    })
                                    .catch((e) => {
                                        console.log(e);
                                        communicate({ content: 'Impossible de synchroniser la machine!', duration: 5000 });
                                    });
                            }}
                        />
                        <IconButton
                            icon={(props) => <MaterialCommunityIcons name='printer' {...props} />}
                            size={30}
                            onPress={() => {
                                print(device?.site?.template)
                                    .then(() => communicate({ content: "Imprimante fonctionnelle"}))
                                    .catch((error) => communicate({ content: 'Imprimante non fonctionnelle: ' + error.message }));
                            }}
                        />
                        <IconButton
                            icon={(props) => <MaterialCommunityIcons name='delete-sweep' {...props} />}
                            iconColor={mode === 'supervisor' ? Colors.orange600 : Colors.grey400}
                            size={30}
                            onPress={handleClearData}
                            disabled={mode !== 'supervisor'}
                        />
                        <IconButton
                            icon={(props) => <MaterialCommunityIcons name='delete-forever' {...props} />}
                            iconColor={mode === 'supervisor' ? Colors.red600 : Colors.grey400}
                            size={30}
                            onPress={handleResetApp}
                            disabled={mode !== 'supervisor'}
                        />
                    </Card.Content>
                    <Card.Content>
                        <ProgressBar visible={loading} indeterminate={true} color={Colors.blue600} style={{height: 5, borderRadius: 2, marginTop: 2}} />
                    </Card.Content>
                </Card>

                {/* Modal de confirmation pour suppression des données */}
                <SupervisorPasswordModal
                    visible={clearDataModalVisible}
                    onDismiss={() => setClearDataModalVisible(false)}
                    onConfirm={executeClearData}
                    title="🗑️ Réinitialiser les données"
                    message="Confirmez avec votre mot de passe superviseur pour supprimer toutes les données synchronisées. Le code device sera conservé."
                    confirmButtonText="Supprimer les données"
                    supervisors={supervisors}
                />

                {/* Modal de confirmation pour reset complet */}
                <SupervisorPasswordModal
                    visible={resetAppModalVisible}
                    onDismiss={() => setResetAppModalVisible(false)}
                    onConfirm={executeResetApp}
                    title="⚠️ RESET COMPLET"
                    message="⚠️ ATTENTION : Cette action supprimera TOUT (y compris le code device). L'app sera comme neuve. Confirmez avec votre mot de passe superviseur."
                    confirmButtonText="🔥 TOUT SUPPRIMER"
                    supervisors={supervisors}
                />
            </Provider>
        </View>
    );
}

const styles = StyleSheet.create({
    containerStyle: {
        flex: 1
    },
    button: {
        marginTop: 15,
        marginHorizontal: 10
    },
    input: {
        textAlign: 'center',
        marginVertical: 10,
        color: Colors.blue600,
        marginHorizontal: 10
    },
    title: {
        textAlign: 'center',
        marginVertical: 10,
        color: Colors.blue600
    },
    detail: {
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 5
    }, 
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    }
});
