import './expo-modules-setup';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
// Local context
import { LocalDataContext} from './context/dataContext';
// Custom contexts
import { Provider as AuthContextProvider } from './context/authContext';
import { Provider as FeedBackProvider,  } from './feedback/context';
import { Provider as SessionProvider } from './session/context';
import { Provider as WorkSessionProvider } from './context/workSession';
import { MySnackbar } from './feedback/Snackbar';
import { Provider, DefaultTheme } from 'react-native-paper';
import { OperationStatus, useDevice } from './hooks/useDevice';
import Colors from './constants/Colors';
// @ts-ignore - Icon library type issue
import MaterialCommunityIcons from '@svgr-iconkit/material-community';


export default function App() {
    const isLoadingComplete = useCachedResources();
    const colorScheme = useColorScheme();

    const localData = useDevice();

    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            text: Colors[colorScheme].text
        }
    };

    if (!isLoadingComplete || (localData.status !== OperationStatus.finish && localData.status !== OperationStatus.error)) {
        return null;
    } else {
        return (
            <SafeAreaProvider>
                {/* @ts-ignore - Provider children prop type issue with react-native-paper v5 */}
                <Provider 
                    settings={{
                        icon: ({name, ...props}: { name: any }) => <MaterialCommunityIcons name={name} {...props} />,
                    }}
                    theme={theme}>
                    <FeedBackProvider>
                        <SessionProvider>
                            <WorkSessionProvider>
                                <AuthContextProvider>
                                    <LocalDataContext.Provider value={localData}>
                                        <Navigation colorScheme={colorScheme} />
                                    </LocalDataContext.Provider>
                                    <StatusBar />
                                    <MySnackbar />
                                </AuthContextProvider>
                            </WorkSessionProvider>
                        </SessionProvider>
                    </FeedBackProvider>
                </Provider>
            </SafeAreaProvider>
        );
    }
}
