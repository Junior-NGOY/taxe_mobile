import * as React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';

// import { View } from '../components/Themed';
import Vehicles from '../components/Vehicles';
import WorkState from '../components/WorkState';
import { RootTabScreenProps } from '../types';
import { Modal, Portal, Button, Provider, Card, TextInput, Text, MD2Colors as Colors, ProgressBar, HelperText } from 'react-native-paper';

// HTML TEMPLATE IMPORT AND PRINT FUNCTION
import { html, Invoice as InvoicePrint } from '../invoice-templates/invoice';
import { LocalDataContext } from '../context/dataContext';

// import QRCode from 'react-native-qrcode-svg';
import { AntDesign } from '@expo/vector-icons';
import { replace } from '../invoice-templates/replace';
import { format } from 'date-fns';
import { WorkSessionContext, Invoice  } from '../context/workSession';
import { SessionContext } from '../session/context';
import { FeedBackContext } from '../feedback/context';
import { usePrint } from '../invoice-templates/usePrint';
import QR from 'qrcode-base64-size';
import { encrypt } from '../crypt/crypt';

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {

    // Modal show and hide
    const [visible, setVisible] = React.useState(false);
    const [printModal, setPrintModal] = React.useState(false); // Modal before printing

    const [matricule, setMatricule] = React.useState(""); // Matricule of vehicle
    const [street, setStreet] = React.useState("");

    // Current tarfification...
    const [tarification, setTarification] = React.useState<{id: string, price: number, name: string, code?: string}>();
    // Invoice Context 
    const { device } = React.useContext(LocalDataContext);
    const { addInvoice, stop: stopToPrint } = React.useContext(WorkSessionContext);
    const { session } = React.useContext(SessionContext);
    const { communicate } = React.useContext(FeedBackContext);
    const [loading, setLoading] = React.useState(false);
    const [duplicate, setDuplicate] = React.useState(false);
    const [printingLimit, setPrintingLimit] = React.useState(session?.printingLimit ? session.printingLimit : 2);

    const { print, loading: printLoading } = usePrint();

    const showModal = () => {
        if (stopToPrint) {
            communicate({ content: 'Session bloquée. Veuillez prolonger ou réinitialiser la session.', duration: 5000 });
            return;
        }
        if (!session) {
            communicate({ content: 'Veuillez démarrer une session avant de créer une facture.', duration: 3000 });
            return;
        }
        setVisible(true);
    };
    const hidePrintingModal = () => {
        setVisible(false);
        setPrintModal(false);
        setMatricule('');
        setLoading(false);
        setDuplicate(false);
        setPrintingLimit(session?.printingLimit ? session.printingLimit : 2);
        // setVehicle(null);
    };

    const getQRCode = (text: string) => {
        const base64 = QR.drawImg(text, {
            typeNumber: 4,
            errorCorrectLevel: 'M',
            size: 400
          });

        return base64;
    }

    const handlePrint = async (data: InvoicePrint) => {
        setLoading(true);
        const date = new Date();
        // Utiliser le template du site (site.template) comme dans Symfony, sinon template par défaut
        let newInvoice = replace(device?.site?.template ? device.site.template : html, { 
            title: 'TAXE PARKING',
            matricule: data?.matricule?.toUpperCase(),
            site: device?.site?.name,
            date: format(date, 'dd/MM/yyyy'),
            hour: format(date, 'hh:mm'),
            number: date.getTime() + '',
            price: data.tarification.price.toString(),
            vehicleType: data.tarification.name.toUpperCase(),
            perceptor: session?.account?.person?.name?.toUpperCase(),
            place: session?.parking?.name,
            street: street,
            // qrCode: getQRCode(encrypt(data.matricule + ' ' + date.getTime()))
            qrCode: getQRCode(encrypt({ number: date.getTime() + '', name: data?.matricule?.toUpperCase(), date }))
        });
        // Facture à conserver localement
        const invoice: Invoice = { 
            matricule: data.matricule + ' - ' + street, 
            tarification: { name: data.tarification.name, price: data.tarification.price, id: data.tarification?.id},
            createdAt: new Date(),
            amount: data?.tarification?.price,
            number : data?.number
        };
        
        try {
            await print(newInvoice);
            addInvoice(invoice, duplicate);
            setDuplicate(true); // On marque la facture comme déjà imprimée
            setPrintingLimit(printingLimit - 1);
            
            communicate({ content: "Facture enregistrée", duration: 500 });
            // hidePrintingModal();
        } catch (error: any) {
            communicate({ content: error.message });
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if(printingLimit < 1) hidePrintingModal();
    }, [printingLimit])

    return (
        <ScrollView contentContainerStyle={{ height: '100%'}}>
            <Provider>
                <WorkState />
                <ScrollView>
                    <Vehicles handlePress={(tarification: {id: string, price: number, name: string}) => {
                        showModal();
                        setTarification(tarification);
                    }} />
                </ScrollView>
                <Portal>
                    <Modal
                        visible={printModal} 
                        contentContainerStyle={styles.modal}
                        dismissable={false}
                        >
                        <Card>
                            <Card.Content>
                                <Text style={{ textAlign: 'center' }}>Identifiant / Nom</Text>
                                <Text style={styles.matricule}>{matricule}</Text>
                                <HelperText type='info' style={{ textAlign: 'center' }}>{printingLimit} essai{printingLimit > 1 ? 's' : ''} possible</HelperText>
                            </Card.Content>
                            <Card.Content style={styles.actions}>
                                <Button style={{ margin: 10 }} mode='outlined' onPress={hidePrintingModal}>
                                    Retour
                                </Button>
                                <Button style={{ margin: 10 }}  mode='outlined' disabled={loading || matricule.length === 0} onPress={() => { if(tarification)  handlePrint({ matricule, tarification, number: Date.now() + '' })}}>
                                    Imprimer
                                </Button>
                            </Card.Content>
                            <Card.Content>
                                <ProgressBar visible={loading} indeterminate color={Colors.blue500} />
                            </Card.Content>
                        </Card>
                    </Modal>
                    <Modal 
                        visible={visible} 
                        contentContainerStyle={styles.modal}
                        onDismiss={() => {
                            setVisible(false);
                            setMatricule('');
                        }}>
                        {(session && !stopToPrint) && (
                            <Card>
                                <Card.Title title={tarification?.name + ' - ' + tarification?.price + ' Fc'}/>
                                <Card.Content>
                                    <TextInput
                                        label="Identifiant / Nom"
                                        value={matricule}
                                        onChangeText={text => setMatricule(text)}
                                        mode={'outlined'}
                                        autoFocus={true}
                                        onSubmitEditing={() => {
                                            if(matricule) {
                                                setPrintModal(true);
                                                setVisible(false);
                                            }
                                        }}
                                        />
                                    <TextInput
                                        label="Avenue"
                                        value={street}
                                        onChangeText={text => setStreet(text)}
                                        mode={'outlined'}
                                        // autoFocus={true}
                                        />
                                </Card.Content>
                                <Card.Actions style={{justifyContent: 'flex-end'}}>
                                    <Button onPress={() => {
                                            setVisible(false);
                                            setMatricule('');
                                        }}>
                                        Annuler
                                    </Button>
                                    <Button disabled={Boolean(!matricule)} onPress={() => {
                                        setPrintModal(true);
                                        setVisible(false);
                                    }}>
                                        Valider
                                    </Button>
                                </Card.Actions>
                            </Card>
                        )}
                        {(!session || stopToPrint) && (
                            <Card>
                                <Card.Content style={{alignItems: 'center', margin: 10}}>
                                    <AntDesign name="warning" size={40} color={Colors.orange700} />
                                    <Text style={{textAlign: 'center', fontSize: 17, color: Colors.red900, marginTop: 20 }}>{stopToPrint ? 'La session a expirée, veuillez en démarrer une nouvelle !': 'Veuillez démarrer une nouvelle session !'}</Text>
                                </Card.Content>
                                <Card.Actions style={{flexDirection: 'column'}}>
                                    <Button style={{width: '100%'}} color={Colors.blue700} onPress={() => setVisible(false)}>Retour</Button>
                                </Card.Actions>
                            </Card>
                        )}
                    </Modal>
                </Portal>
            </Provider>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    modal: {
        marginHorizontal: 20,
        padding: 10
    },
    matricule: {
        textAlign: 'center',
        fontSize: 60
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 10
    }
});
