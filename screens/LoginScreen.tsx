// @ts-nocheck - Disable type checking due to React 19 / React Native compatibility issues
import { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableNativeFeedback } from "react-native";
import { Button, IconButton, Provider, TextInput, Title, useTheme, ProgressBar, Chip, Text, MD2Colors, Checkbox } from "react-native-paper";
import { PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL } from "../api/config";
import { View } from "../components/Themed";
import { AuthContext } from "../context/authContext";
import { LocalDataContext } from "../context/dataContext";
import { useSynchronise } from "../synchronisation";
import { SessionContext } from "../session/context";
import { FeedBackContext } from "../feedback/context";
import { usePrint } from "../invoice-templates/usePrint";
// @ts-ignore - Icon library type issue
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: { navigation: { navigate: Function}}) {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    const { mode, switchMode, connection} = useContext(AuthContext);
    const { session } = useContext(SessionContext);
    const { communicate } = useContext(FeedBackContext);
    const { apiUrl, device } =  useContext(LocalDataContext);
    // const { session } =  useContext(SessionContext);
    const [limit, setLimit] = useState(false); // Limitation du nombre d'essaie
    const { synchronise, loading } = useSynchronise(); // Hook de synchronisation avec l'API
    const theme = useTheme();

    const { print } = usePrint();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handlePress = async () => {
        if (isLoggingIn) return; // Éviter les clics multiples
        
        try {
            setIsLoggingIn(true);
            await connection({ login, password });
            communicate({ content: 'Connexion réussie'});
        } catch (error: any) {
            communicate({ content: error.message });
        } finally {
            setIsLoggingIn(false);
        }
    };

    useEffect(() => {
        if(!session && mode === 'perceptor') {
            switchMode();
        }
        else if(session && mode === 'supervisor') {
            switchMode();
        }
    }, [session])

    return (
        <Provider>
            <View style={styles.container}>
                <Title style={styles.title}>Authentification {device?.site?.name} </Title>
                <View style={styles.tags}>
                    { mode === 'supervisor' && <Chip mode='flat' style={styles.tag}>
                        { apiUrl === PROD_BASE_URL ? 'prod' : 
                          apiUrl === LOCAL_BASE_URL ? 'local' : 'test'
                        } : {device?.code}
                    </Chip>}
                    { mode === 'perceptor' && (<Chip mode='flat' style={styles.tag}>{session?.account ? session.account.person?.name : 'Aucun compte'}</Chip>)}
                </View>
                {mode === 'supervisor' && (
                    <TextInput 
                        style={styles.input}
                        mode='outlined' 
                        value={login} 
                        onChangeText={(text) => setLogin(text)}
                        // autoFocus
                        label={'Login'} />
                )}
                <TextInput 
                    mode='outlined'
                    style={styles.input} 
                    value={password} 
                    secureTextEntry={!showPassword}
                    onChangeText={(text) => setPassword(text)}
                    onSubmitEditing={() => {
                        handlePress();
                    }}
                    label={'Mot de passe'} />
                {/* @ts-ignore - TouchableNativeFeedback type compatibility with React 19 */}
                <TouchableNativeFeedback onPress={() => setShowPassword(!showPassword)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, padding: 8, borderRadius: 5 }}>
                        <Checkbox
                            status={showPassword ? 'checked' : 'unchecked'}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                        <Text style={{ fontSize: 15, color: MD2Colors.grey900 }}> Afficher mot de passe</Text>
                    </View>
                </TouchableNativeFeedback>
                <Button 
                    mode='contained-tonal' 
                    style={styles.button} 
                    onPress={handlePress}
                    disabled={isLoggingIn}
                    loading={isLoggingIn}
                >
                    {isLoggingIn ? 'Connexion...' : 'Valider'}
                </Button>
                <ProgressBar visible={loading || isLoggingIn} indeterminate={true} color={MD2Colors.blue600} style={{height: 5, borderRadius: 2, marginTop: 2}} />

                <IconButton
                    icon={(props) => <MaterialCommunityIcons name='refresh' {...props} />}
                    size={25}
                    style={{position: "absolute", top: 30, right: 15}}
                    onPress={() => {
                        synchronise()
                            .then(() => {
                                communicate({ content: 'Synchronisation effectuée', duration: 3000 });
                            })
                            .catch(() => communicate({ content: 'Synchronisation impossible', duration: 3000 }));
                    }}
                />
                <IconButton
                    icon={(props) => <MaterialCommunityIcons name={mode === 'perceptor' ? "account": "account-tie"} {...props} />}
                    size={25}
                    style={{position: "absolute", top: 30, right: 58}}
                    onPress={() => {
                        switchMode();
                        communicate({ content: 'Mode ' + (mode === 'perceptor' ? 'Superviseur' : 'Percepteur'), duration: 1000 });
                    }}
                />

                <IconButton
                    icon={(props) => <MaterialCommunityIcons name='printer' {...props} />}
                    size={25}
                    style={{ position: "absolute", top: 30, right: 103 }}
                    onPress={() => {
                        print(device?.site?.template)
                            .then(() => communicate({ content: "Imprimante fonctionnelle"}))
                            .catch((error) => communicate({ content: 'Imprimante non fonctionnelle: ' + error.message}));
                    }}
                />

                <IconButton
                    icon={(props) => <MaterialCommunityIcons name='qrcode-scan' {...props} />}
                    size={25}
                    style={{ position: "absolute", top: 30, right: 150 }}
                    onPress={() => {
                        navigation.navigate('Scanner');
                    }}
                />
            </View>
        </Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    tags: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5
    },
    tag: {
        marginHorizontal: 5
    },
    title: {
        textAlign: 'center',
        fontSize: 25,
        marginBottom: 20,
        color: MD2Colors.blue500,
        marginHorizontal: 20
    },
    input: {
        marginBottom: 10
    },
    button: {
        marginVertical: 15,
    }
});