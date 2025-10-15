import { string } from 'prop-types';
import * as React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import { Chip } from 'react-native-paper';
import { WorkSessionContext } from '../context/workSession';
import { useLocalStorage } from '../local-storage/local-storage';
import { Table } from '../local-storage';

const Counter = () => {
    const [list, setList] = React.useState<any>([]);
    const { invoices } = React.useContext(WorkSessionContext);
    const [tarifications, setTarifications] = React.useState<{id: string, name: string, price: number}[]>([])
    const { localStorage } = useLocalStorage();
    const filter = (tarification: {id: number | string, name: string}) => {
        return invoices?.filter((invoice: { tarification : { id : string}}) => invoice?.tarification?.id === tarification?.id)?.length;
    }

    const counter= () => {
        const count = tarifications.map((tarification : { id: string | number, name: string, price: number}) => ({name: tarification?.name, count: filter(tarification)}));
        
        return count;
    }

    React.useEffect(() => {
        setList(counter());
    }, [invoices, tarifications]);

    React.useEffect(() => {
        localStorage(Table.tarification, true)
            .then((values) => setTarifications(values))
            .catch((e) => console.log('Impossible de récuperer les tarifications'));
    }, []);


    return (
        <ScrollView 
            style={{ marginHorizontal: 3, paddingVertical: 9 }}
            horizontal={true}>
            {
                list?.map((item: { name: string, count: number}, index: number) => (
                    <Chip 
                        icon="counter" 
                        key={index.toString()}
                        mode={'outlined'}
                        style={styles.item}
                        onPress={() => alert(item.count)}>{item.name}: {item?.count ? item.count : 0}</Chip>
                ))
            }
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    item: {
        marginHorizontal: 1,
        borderRadius: 10
    }
})

export default Counter;