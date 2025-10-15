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
import { Alert } from 'react-native';
// @ts-ignore - Icon library type issue
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { communicate } = React.useContext(FeedBackContext);
    const { synchronise, loading } = useSynchronise();
    const { apiUrl, device } = React.useContext(LocalDataContext);
    const { print } = usePrint();

    const handleClearData = () => {
        Alert.alert(
            '🗑️ Réinitialiser les données',
            'Voulez-vous supprimer toutes les données synchronisées ? (Le code device sera conservé)',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Supprimer les données',
                    onPress: async () => {
                        try {
                            await clearDataOnly();
                            communicate({ content: '✅ Données supprimées ! Veuillez resynchroniser.', duration: 5000 });
                        } catch (error: any) {
                            communicate({ content: '❌ Erreur: ' + error.message, duration: 5000 });
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    const handleResetApp = () => {
        Alert.alert(
            '⚠️ RESET COMPLET',
            'Voulez-vous TOUT supprimer (y compris le code device) ? L\'app sera comme neuve.',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: '🔥 TOUT SUPPRIMER',
                    onPress: async () => {
                        try {
                            await clearAllStorage();
                            communicate({ content: '✅ App réinitialisée ! Redémarrez l\'application.', duration: 5000 });
                            // Optionnel: forcer le reload de l'app
                            // Updates.reloadAsync();
                        } catch (error: any) {
                            communicate({ content: '❌ Erreur: ' + error.message, duration: 5000 });
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
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
                            iconColor={Colors.orange600}
                            size={30}
                            onPress={handleClearData}
                        />
                        <IconButton
                            icon={(props) => <MaterialCommunityIcons name='delete-forever' {...props} />}
                            iconColor={Colors.red600}
                            size={30}
                            onPress={handleResetApp}
                        />
                    </Card.Content>
                    <Card.Content>
                        <ProgressBar visible={loading} indeterminate={true} color={Colors.blue600} style={{height: 5, borderRadius: 2, marginTop: 2}} />
                    </Card.Content>
                </Card>
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
