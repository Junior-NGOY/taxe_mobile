import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    Provider, 
    Button, 
    MD2Colors as Colors, 
    TextInput, 
    ProgressBar,
    Title,
    Chip,
    Text,
    Card
// @ts-ignore
} from 'react-native-paper';
import { LocalDataContext } from '../context/dataContext';
import { PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL } from '../api/config';
import { FeedBackContext } from '../feedback/context';
import { useRegisterDevice } from '../hooks/useRegisterDevice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Refaire la méthode d'enregistrement d'une machine
export default function RegisterScreen() {
    const { apiUrl, update } = React.useContext(LocalDataContext);
    const { communicate } = React.useContext(FeedBackContext);
    const [text, setText] = React.useState<string>('');
    const [backupCode, setBackupCode] = React.useState<string | null>(null);
    const [backupTimestamp, setBackupTimestamp] = React.useState<string | null>(null);
    const { register, loading } = useRegisterDevice();

    // Charger le code de backup si disponible
    React.useEffect(() => {
        (async () => {
            try {
                const backupData = await AsyncStorage.getItem('@device_backup');
                if (backupData) {
                    const backup = JSON.parse(backupData);
                    setBackupCode(backup.code);
                    setBackupTimestamp(backup.timestamp);
                    setText(backup.code); // Pré-remplir le champ
                    console.log('📋 [RegisterScreen] Backup trouvé:', backup.code);
                }
            } catch (error) {
                console.error('❌ [RegisterScreen] Erreur lecture backup:', error);
            }
        })();
    }, []);

    const switchApiUrl = () => {
        update({ apiUrl: apiUrl === PROD_BASE_URL ? TEST_BASE_URL : PROD_BASE_URL });
    }

    const handlePress = async () => {
        if(text.length === 0)
            communicate({ content: 'Veuillez entrer le code de la machine' });
        else {
            register(text) // Enregistrement du code de la machine
                .then((device) => {
                    communicate({ content: "Périphérique enregistré"});
                    update({ device });
                })
                .catch((error) => communicate({ content: error.message }));
        }   
    }

    return (
        <Provider>
            <View style={styles.container}>
                <Title style={styles.title}>Enregistrement de la Machine <Chip mode='flat' onPress={switchApiUrl}>{ 
                    apiUrl === PROD_BASE_URL ? 'prod' : 
                    apiUrl === LOCAL_BASE_URL ? 'local' : 'test'
                }</Chip></Title>
                
                {backupCode && (
                    <Card style={styles.warningCard}>
                        <Card.Content>
                            <Text style={styles.warningTitle}>⚠️ Device Perdu</Text>
                            <Text style={styles.warningText}>
                                Un code de récupération a été trouvé : <Text style={styles.code}>{backupCode}</Text>
                            </Text>
                            <Text style={styles.warningSubtext}>
                                Cliquez sur "Valider" pour reconnecter ce device.
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                
                <TextInput 
                    mode='outlined'
                    style={styles.input}
                    onChangeText={(text) => setText(text) }
                    label='Numéro de série'
                    onSubmitEditing={() => {
                        handlePress();
                    }}
                    value={text} />
                <Button onPress={handlePress} style={styles.button}>Valider</Button>
                <ProgressBar visible={loading} indeterminate={true} color={Colors.blue600} style={{height: 5, borderRadius: 2, marginTop: 10, marginHorizontal: 20}} />
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    button: {
        marginTop: 15,
        marginHorizontal: 20
    },
    input: {
        textAlign: 'center',
        marginVertical: 10,
        color: Colors.blue600,
        marginHorizontal: 20
    },
    title: {
        textAlign: 'center',
        fontSize: 25,
        marginBottom: 20,
        color: Colors.blue500,
        marginHorizontal: 20
    },
    warningCard: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: Colors.orange50
    },
    warningTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.orange900,
        marginBottom: 10
    },
    warningText: {
        fontSize: 14,
        color: Colors.orange800,
        marginBottom: 5
    },
    warningSubtext: {
        fontSize: 12,
        color: Colors.orange700,
        fontStyle: 'italic'
    },
    code: {
        fontWeight: 'bold',
        fontFamily: 'monospace',
        fontSize: 16,
        color: Colors.blue800
    }
});

