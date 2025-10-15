import React, { useState, useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Dialog, IconButton, MD2Colors, Portal, Button, Text as RNPText } from 'react-native-paper';
import { FeedBackContext } from '../feedback/context';
import { Invoice } from '../crypt/types';
import { decrypt } from '../crypt/crypt';
import { format } from 'date-fns';
import SafeBarcodeScanner from '../components/SafeBarcodeScanner';

export default function ScannerScreen({ navigation }: { navigation: { goBack: Function}}) {
    const [scanned, setScanned] = useState(false);
    const [data, setData] = useState<Invoice>();
    const { communicate } = useContext(FeedBackContext);

    const handleBarCodeScanned = ({ data: codeValue }: { data: string }) => {
        const value = decrypt(codeValue);
        if(value) {
            if(value.number) {
                setData(value);
                setScanned(true);
            } else {
                communicate({content: 'Ce QR code ne contient pas de facture'});
            }
        } else {
            communicate({content: 'Impossible de décoder ce QR code'});
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scanner le QR Code d'une facture</Text>
            <SafeBarcodeScanner
                onBarCodeScanned={handleBarCodeScanned}
                style={styles.scanner}
            />
            {scanned && 
                <Portal>
                    <Dialog visible={scanned} onDismiss={() => setScanned(false)}>
                        <Dialog.Title>Informations de la facture</Dialog.Title>
                        <Dialog.Content>
                            <RNPText variant="titleMedium">Numéro: {data?.number}</RNPText>
                            <RNPText variant="bodyMedium">Montant: {data?.amount} FC</RNPText>
                            <RNPText variant="bodyMedium">Site: {data?.site?.name}</RNPText>
                            <RNPText variant="bodyMedium">Matricule: {data?.plate}</RNPText>
                            <RNPText variant="bodyMedium">Date: {data?.createdAt ? format(new Date(data.createdAt), 'dd/MM/yyyy HH:mm') : ''}</RNPText>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setScanned(false)}>Scanner encore</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            }
            <IconButton 
                icon="arrow-left" 
                iconColor={MD2Colors.white} 
                size={30} 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingBottom: 30,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 50,
    },
    button: {

    },
    text: {
        textAlign: 'center',
        marginVertical: 10,
        color: MD2Colors.grey300,
        backgroundColor: MD2Colors.grey600,
        padding: 3,
        paddingBottom: 5
    },
    scannerContainer: {
        height: 410,
        marginBottom: 30
    },
    scanner: {
        height: 400,
    },
    title: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    }
});
