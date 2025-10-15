import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Themed';
// Import icons from Owner repository
import { MaterialCommunityIcons, FontAwesome, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';

import { Card } from 'react-native-paper';
import Grid from './Grid';
import { WorkSessionContext } from '../context/workSession';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

export interface VehicleType {
    name: string,
    price: number,
    icon: JSX.Element
};

const Vehicles = ({handlePress} : {handlePress : (tarification: {id: string, price: number, name: string}) => void}) => {
    const { tarifications } = React.useContext(WorkSessionContext);
    const onPress= (tarification: {id: string, price: number, name: string}) => {
        handlePress(tarification);
    };

    if(!tarifications) return null;

    return (
        <Grid column={3}>
            {tarifications.map((tarification : { id: string, name: string, price: number, vehicleType: {icon: string}}, index) => (
                <Vehicle 
                    key={index.toString()} 
                    handlePress={() => onPress(tarification)}
                    tarification={tarification} />
            ))}
        </Grid>
    );
};

const generateIcon = (icon: string, color?: string) => {
    const [type, name]: any = icon ? icon.split('+') : [null, null];
    
    const colorScheme = useColorScheme();
    const iconColor = color ? color : Colors[colorScheme].text;

    if(type && name){
        switch(type) {
            case 'fa': return <FontAwesome name={name} size={24} color={iconColor} />; break;
            case 'fa5': return <FontAwesome5 name={name} size={24} color={iconColor} />; break;
            case 'io': return <Ionicons name={name} size={24} color={iconColor} />; break;
            case 'mi': return <MaterialIcons name={name} size={24} color={iconColor} />; break;
            case 'mci': return <MaterialCommunityIcons name={name} size={24} color={iconColor} />; break;
            default: return null;
        }
    }

    return null;
}


const Vehicle = ({
    tarification,
    handlePress
    }: { 
        tarification: { name: string, price: number, vehicleType: { icon: string }}, 
        handlePress?: () => void
    }) => {
        return (
            <Card 
                onPress={handlePress} 
                elevation={2}
                style={{ marginBottom: 2 }} 
                mode={'elevated'}>
                <Card.Content style={styles.container}>
                    <View style={styles.icon}>{generateIcon(tarification?.vehicleType?.icon)}</View>
                    <Text style={styles.title} numberOfLines={1}>{tarification.name}</Text>
                </Card.Content>
            </Card>
        );
    }

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        textAlign: 'center',
        marginVertical: 2
    },
    icon: {
        alignItems: 'center',
        marginVertical: 2
    }
});

export default Vehicles;
