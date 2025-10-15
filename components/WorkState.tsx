import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { Octicons } from '@expo/vector-icons';
import { WorkSessionContext } from '../context/workSession';
import { SessionContext } from '../session/context';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

const WorkState = () => {
    const colorScheme = useColorScheme();
    const color = Colors[colorScheme].text;
    const { invoices } = React.useContext(WorkSessionContext);
    const { session } = React.useContext(SessionContext);

    const [date] = React.useState<Date>(session?.startAt ? new Date(session.startAt) : new Date());
    const amount = () => {
        let amount = 0;
        invoices?.forEach((invoice) => {
            amount += invoice?.tarification?.price ? invoice?.tarification?.price : 0;
        });
        return amount;
    }
    
    return (
        <Card style={styles.container}>
            <Card.Content>
                <View style={{ flexDirection: 'row'}}>
                    <Title style={styles.date}>
                        <Octicons name='calendar' size={20} color={color} /> {date && format( date, 'dd/MM/yyyy')}
                    </Title>
                    <Title style={styles.parking}><Octicons name='location' size={20} color={color} /> {session?.parking?.name}</Title>
                </View>
                <Paragraph style={styles.amount}>Fc {(() => amount())()}</Paragraph>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 7,
        marginBottom: 7
    },
    date: {
        flex: 1,
        textAlign: 'left',
        fontSize: 18
    },
    parking: {
        flex: 1,
        textAlign: 'center'
    },
    amount: {
        fontSize: 20,
        padding: 5
    },
})

export default WorkState;