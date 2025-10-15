import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    Provider, 
    Button, 
    MD2Colors as Colors, 
    TextInput, 
    ProgressBar,
    Title,
    Chip
// @ts-ignore
} from 'react-native-paper';
import { LocalDataContext } from '../context/dataContext';
import { PROD_BASE_URL, TEST_BASE_URL, LOCAL_BASE_URL } from '../api/config';
import { FeedBackContext } from '../feedback/context';
import { useRegisterDevice } from '../hooks/useRegisterDevice';

// TODO: Refaire la méthode d'enregistrement d'une machine
export default function RegisterScreen() {
    const { apiUrl, update } = React.useContext(LocalDataContext);
    const { communicate } = React.useContext(FeedBackContext);
    const [text, setText] = React.useState<string>('');
    const { register, loading } = useRegisterDevice();

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
    }
});

