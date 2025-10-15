import { useContext } from "react";
import { StyleSheet } from "react-native";
import { Provider, Title, Button, MD2Colors as Colors, Card, Text } from 'react-native-paper';
import { View } from "../components/Themed";
import { AuthContext } from "../context/authContext";


export default function LogoutScreen({navigation} : { navigation: { navigate: Function}}) {
    const { account, deconnect } = useContext(AuthContext);

    return (
        <Provider>
            <View style={styles.containerStyle}>

                <Card style={{flex: 1}}>
                        <Card.Content>
                            <Title style={styles.title}>Compte</Title>
                            <Text style={styles.detail}>Nom : {account? account.person?.name : 'Aucun compte'}</Text>
                            {/* <Text style={styles.detail}>Login : {account? account.userIdentifier : 'Aucun compte'}</Text> */}
                        </Card.Content>
                        <Card.Content>
                            <Button mode='contained-tonal' style={{ marginVertical: 10 }} onPress={deconnect}>Deconnexion</Button>
                        </Card.Content>

                    </Card> 

            </View>
        </Provider>
    )
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
        marginTop: 'auto',
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