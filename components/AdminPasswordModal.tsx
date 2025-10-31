// @ts-nocheck - Disable type checking due to React 19 compatibility
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
    Modal, 
    Portal, 
    Card, 
    TextInput, 
    Button, 
    Text, 
    MD2Colors,
    ProgressBar 
} from 'react-native-paper';

interface AdminPasswordModalProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmButtonText?: string;
}

// Credentials admin hardcodés
const ADMIN_EMAIL = 'sidpaie02@gmail.com';
const ADMIN_PASSWORD = 's@&paie#02';

/**
 * Modal de confirmation avec authentification administrateur
 * Pour les actions critiques de réinitialisation (réservées à l'admin uniquement)
 */
export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
    visible,
    onDismiss,
    onConfirm,
    title,
    message,
    confirmButtonText = 'Confirmer'
}) => {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleConfirm = async () => {
        setError('');
        
        if (!email.trim()) {
            setError('Veuillez entrer l\'email administrateur');
            return;
        }

        if (!password.trim()) {
            setError('Veuillez entrer le mot de passe');
            return;
        }

        setLoading(true);

        try {
            // Vérifier les credentials admin (comparaison en texte brut)
            if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
                setError('Email ou mot de passe administrateur incorrect');
                setLoading(false);
                return;
            }

            // Credentials corrects, exécuter l'action
            await onConfirm();
            
            // Réinitialiser et fermer
            setPassword('');
            setEmail('');
            setError('');
            setLoading(false);
            onDismiss();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la vérification');
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setPassword('');
        setEmail('');
        setError('');
        setLoading(false);
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={handleCancel}
                contentContainerStyle={styles.modal}
            >
                <Card>
                    <Card.Title title={title} titleStyle={styles.title} />
                    <Card.Content>
                        <Text style={styles.message}>{message}</Text>
                        
                        <Text style={styles.adminLabel}>
                            🔐 Authentification Administrateur
                        </Text>

                        <TextInput
                            label="Email administrateur"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            disabled={loading}
                            style={styles.input}
                        />

                        <TextInput
                            label="Mot de passe administrateur"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            disabled={loading}
                            right={
                                <TextInput.Icon 
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            style={styles.input}
                        />

                        {error ? (
                            <Text style={styles.error}>❌ {error}</Text>
                        ) : null}

                        {loading && (
                            <ProgressBar 
                                indeterminate 
                                color={MD2Colors.red600}
                                style={styles.progress}
                            />
                        )}
                    </Card.Content>

                    <Card.Actions style={styles.actions}>
                        <Button 
                            mode="outlined" 
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button 
                            mode="contained" 
                            onPress={handleConfirm}
                            disabled={loading}
                            buttonColor={MD2Colors.red700}
                        >
                            {confirmButtonText}
                        </Button>
                    </Card.Actions>
                </Card>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        padding: 20,
    },
    title: {
        color: MD2Colors.red700,
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 15,
        marginBottom: 20,
        color: MD2Colors.grey800,
        lineHeight: 22,
    },
    adminLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: MD2Colors.red700,
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
    },
    error: {
        color: MD2Colors.red600,
        marginTop: 10,
        fontSize: 14,
    },
    progress: {
        marginTop: 10,
    },
    actions: {
        justifyContent: 'flex-end',
        paddingTop: 10,
    },
});
