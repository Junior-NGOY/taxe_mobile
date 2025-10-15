/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
// import { MaterialIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';

import { AuthContext } from '../context/authContext';
import useColorScheme from '../hooks/useColorScheme';
import LoginScreen from '../screens/LoginScreen';
import LogoutScreen from '../screens/LogoutScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import { RootStackParamList } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { LocalDataContext } from '../context/dataContext';
// import { useClear } from '../local-storage/local-storage';
import CheckInvoiceScreen from '../screens/CheckInvoiceScreen';
import ScannerScreen from '../screens/ScannerScreen';
import { IconButton, useTheme } from 'react-native-paper';
import Colors from '../constants/Colors';
// import { useClear } from '../local-storage/local-storage';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
    const colorScheme = useColorScheme();
    const theme = useTheme();
    const { account, mode } = React.useContext(AuthContext);
    const { device } = React.useContext(LocalDataContext);
    // const forceUpdatePassword = account?.password === "0000";
    // const { clear } = useClear();

    // clear();

    return (
        <Stack.Navigator>
            {/* {forceUpdatePassword && <Stack.Screen name="Register" component={UpdatePasswordScreen} options={{ headerShown: false}} />} */}
            {!device && <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false}} /> }
            {(device && !account) && <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />}
            
            {(device && account && mode === 'supervisor') && (
                <Stack.Screen
                    name="TabTwo"
                    component={TabTwoScreen}
                    options={({ navigation }) => ({
                    title: 'Supervision',
                    headerRight: () => (
                        <>
                            <Pressable
                                onPress={() => navigation.navigate('CheckInvoice')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1
                                })}>
                                    <MaterialIcons 
                                        name="receipt" 
                                        size={25} 
                                        style={{ marginRight: 17 }}
                                        color={Colors[colorScheme].text} />
                            </Pressable>
                            <Pressable
                                onPress={() => navigation.navigate('Settings')}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.5 : 1
                                })}>
                                    <MaterialIcons 
                                        name="settings" 
                                        size={25} 
                                        style={{ marginRight: 15 }}
                                        color={Colors[colorScheme].text} />
                            </Pressable>
                            <Pressable
                                onPress={() => navigation.navigate('Logout')}
                                style={({ pressed }) => ({
                                opacity: pressed ? 0.5 : 1,
                                })}>
                                    <MaterialIcons 
                                        name="person" 
                                        size={25} 
                                        style={{ marginRight: 7 }}
                                        color={Colors[colorScheme].text} />
                            </Pressable>
                        </>
                    ),
                    })}
                />
            )}
            
            {(device && account && mode === 'perceptor') && (
                <Stack.Screen 
                    name="TabOne" 
                    component={TabOneScreen}
                    options={({ navigation }) => ({
                    title: 'Perception',
                    headerRight: () => (
                        <>
                            <IconButton
                                icon="qrcode-scan"
                                size={25}
                                style={{ margin: 0 }}
                                onPress={() => {
                                    navigation.navigate('Scanner');
                                }}
                            />
                            <IconButton
                                icon="cog"
                                size={25}
                                style={{ margin: 0 }}
                                onPress={() => navigation.navigate('Settings')}
                            />
                            <IconButton
                                icon="account"
                                size={25}
                                style={{ margin: 0 }}
                                onPress={() => navigation.navigate('Logout')}
                            />
                        </>
                    ),
                })} />
            )}

            {(device && account) && (
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                    <Stack.Screen name="Logout" component={LogoutScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Params'}} />
                    <Stack.Screen name="CheckInvoice" component={CheckInvoiceScreen} options={{ headerShown: false }} />
                </Stack.Group>
            )}
            <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                <Stack.Screen name='Scanner' component={ScannerScreen} options={{ headerShown: false }} />
            </Stack.Group>
        </Stack.Navigator>
    );
}