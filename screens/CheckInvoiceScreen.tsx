// @ts-nocheck - Disable type checking due to React 19 / React Native compatibility issues
import { Avatar, MD2Colors as Colors, List, Searchbar, Text } from "react-native-paper";
import { View } from "../components/Themed";
import { FlatList, StyleSheet } from "react-native";
import { useContext, useState } from "react";
import { WorkSessionContext } from "../context/workSession";
import { format } from "date-fns";
import { RootTabScreenProps } from "../types";

export default function CheckInvoiceScreen ({ navigation }: RootTabScreenProps<'CheckInvoice'>) {
    const [search, setSearch] = useState('');
    const { tracedInvoices } = useContext(WorkSessionContext);

    const sort = (a: number, b:number) => {
        if(a < b) return 1;
        else if(a > b) return -1;

        return 0;
    };

    return (
        <View style={styles.container}>
            <Searchbar 
                icon={'arrow-left'}
                onIconPress={() => navigation.goBack()}
                placeholder="Rechercher matricule..."
                autoFocus
                style={styles.search} 
                value={search}
                onChangeText={setSearch}
                />
            <Text style={styles.doublon}>Total: {tracedInvoices.length} facture{tracedInvoices.length > 1 ? 's' : null}</Text>
            {/* @ts-ignore - FlatList type compatibility with React 19 */}
            <FlatList 
                data={tracedInvoices
                    .sort((a, b) => sort(a.count, b.count))
                    .filter(item => item.matricule.toLocaleLowerCase()
                    .includes(search.toLocaleLowerCase()))} 
                renderItem={({ item }) => (
                    <List.Item
                        style={styles.card}
                        title={item.matricule + (item.count > 1 ? ' - ' + item.count + ' impressions' : '')}
                        titleStyle={{ color: Colors.blue600, fontWeight: 'bold'}}
                        description={
                            (item.amount ? `Montant: ${item.amount.toLocaleString()} CDF\n` : '') +
                            item.times?.map(time => format(new Date(time), 'dd/MM/yyyy - hh:mm:ss')).join(', ')
                        }
                        left={() => <Avatar.Icon style={styles.icon} size={45} icon={'receipt'} />}
                        right={() => item.amount ? (
                            <View style={styles.amountContainer}>
                                <Text style={styles.amountText}>{item.amount.toLocaleString()}</Text>
                                <Text style={styles.currencyText}>CDF</Text>
                            </View>
                        ) : null}
                    />
                )} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 27
    },
    card: {
        marginVertical: 2,
        marginHorizontal: 7,
        borderRadius: 5,
        backgroundColor: Colors.white
    },
    search: {
        height: 60,
        marginTop: 4,
        marginBottom: 2,
        marginHorizontal: 5,
        borderRadius: 10,
        padding: 5
    },
    icon: {
        backgroundColor: Colors.blueGrey100,
        color: Colors.blue800,
        marginRight: 12
    },
    doublon: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 2
    },
    amountContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginRight: 16,
        backgroundColor: 'transparent'
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.green700
    },
    currencyText: {
        fontSize: 11,
        color: Colors.grey700,
        marginTop: -2
    }
});