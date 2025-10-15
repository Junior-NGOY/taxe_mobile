import { Snackbar } from 'react-native-paper';
import { FeedBackContext } from './context';
import React from 'react';


export const MySnackbar: React.FC = () => {
    const { message, reset: clear } = React.useContext(FeedBackContext);
    
    return (
        <Snackbar
            visible={Boolean(message)}
            // style={styles.snackbar}
            duration={message?.duration ? message.duration : 5000}
            onDismiss={() => clear()}
            action={{
                label: 'Ok',
                onPress: () => {
                    clear()
                },
         }}>
            {message?.content}
        </Snackbar>
    )
}