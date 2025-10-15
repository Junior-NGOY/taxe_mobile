import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    Provider, 
    Button, 
    MD2Colors as Colors, 
    TextInput, 
    Snackbar, 
    Title
} from 'react-native-paper';

export default function UpdatePasswordScreen() {
    const [text, setText] = React.useState<string>('');
    const [message, setMessage] = React.useState<string>();
    // const {supervisor, perceptor, addPerceptor, addSupervisor} = React.useContext(AuthContext);
    // const {session, addSession } = React.useContext(DataContext);
    // const account = perceptor ? perceptor : supervisor;
    // const [updatePassord, {data, error, loading}] = useMutation(UPDATE_PASSWORD);


    const handlePress = () => {
        if(text.length >= 4 && text != "0000"){
            // updatePassord({ variables: { id: "/api/accounts/" + account?.id, password: text}});
        } else {
            setMessage('Le mot de passe doit avoir au moins 4 caractères');
        }
    }

    /* React.useEffect(() => {
        if(error)
            setMessage('Impossible de modifier le mot de passe');
            
        if(data){
            const newAccount = {...account, password: text, status: true};
            setItemAsync(Table.sessionParking, perceptor ? {...session, account: newAccount} : session)
                .then(() => {
                    if(perceptor){
                        addPerceptor(newAccount);
                        addSession({...session, account: newAccount});
                    }
                    if(supervisor)
                        addSupervisor(newAccount);
                });
        }
    }, [data, error]);*/
        

    const onDismissSnackBar = () => setMessage(undefined);

    return (
        <Provider>
            <View style={styles.container}>
                <Title style={styles.title}>Nouveau mot de passe</Title>
                <TextInput 
                    mode='outlined'
                    style={styles.input}
                    onChangeText={(text) => setText(text) }
                    label='Mot de passe'
                    keyboardType='numeric'
                    onSubmitEditing={() => {
                        handlePress();
                    }}
                    value={text} />
                <Button onPress={handlePress} style={styles.button}>Valider</Button>
                {/* <ProgressBar visible={loading && !error} indeterminate={true} color={Colors.blue600} style={{height: 5, borderRadius: 2, marginTop: 10}} /> */}
                <Snackbar
                    visible={Boolean(message)}
                    onDismiss={onDismissSnackBar}
                    duration={6000}
                    action={{
                        label: 'Ok',
                        onPress: () => {
                            onDismissSnackBar();
                        }
                    }}>
                        {message}
                </Snackbar>
            </View>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
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
        fontSize: 25,
        marginBottom: 20,
        color: Colors.blue500,
        marginHorizontal: 20
    }
});

