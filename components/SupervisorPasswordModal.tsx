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
import bcrypt from 'bcryptjs';

interface SupervisorPasswordModalProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmButtonText?: string;
    supervisors: Array<{
        id: string;
        username?: string;
        password: string;
        person?: { name: string };
    }>;
}

/**
 * Modal de confirmation avec vérification du mot de passe superviseur
 * Pour protéger les actions sensibles (suppression, réinitialisation)
 */
export const SupervisorPasswordModal: React.FC<SupervisorPasswordModalProps> = ({
    visible,
    onDismiss,
    onConfirm,
    title,
    message,
    confirmButtonText = 'Confirmer',
    supervisors
}) => {
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleConfirm = async () => {
        setError('');
        
        if (!username.trim()) {
            setError('Veuillez entrer votre nom d\'utilisateur');
            return;
        }

        if (!password.trim()) {
            setError('Veuillez entrer votre mot de passe');
            return;
        }

        if (!supervisors || supervisors.length === 0) {
            setError('Aucun superviseur enregistré');
            return;
        }

        setLoading(true);

        try {
            // Chercher le superviseur par username
            const supervisor = supervisors.find(s => s.username === username.trim());

            if (!supervisor) {
                setError('Utilisateur non trouvé');
                setLoading(false);
                return;
            }

            // Vérifier le mot de passe (supporte texte brut et bcrypt)
            let isPasswordValid = false;

            if (supervisor.password.startsWith('$2a$') || supervisor.password.startsWith('$2b$')) {
                // Mot de passe hashé avec bcrypt
                isPasswordValid = await bcrypt.compare(password, supervisor.password);
            } else {
                // Mot de passe en texte brut
                isPasswordValid = supervisor.password === password;
            }

            if (!isPasswordValid) {
                setError('Mot de passe incorrect');
                setLoading(false);
                return;
            }

            // Mot de passe correct, exécuter l'action
            await onConfirm();
            
            // Réinitialiser et fermer
            setPassword('');
            setUsername('');
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
        setUsername('');
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
                        
                        <TextInput
                            label="Nom d'utilisateur superviseur"
                            value={username}
                            onChangeText={setUsername}
                            mode="outlined"
                            autoCapitalize="none"
                            disabled={loading}
                            style={styles.input}
                        />

                        <TextInput
                            label="Mot de passe superviseur"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!showPassword}
                            disabled={loading}
                            right={
                                <TextInput.Icon 
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                            style={styles.input}
                            onSubmitEditing={handleConfirm}
                        />

                        {error ? (
                            <Text style={styles.error}>{error}</Text>
                        ) : null}
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
                            loading={loading}
                            disabled={loading}
                            buttonColor={MD2Colors.red600}
                        >
                            {confirmButtonText}
                        </Button>
                    </Card.Actions>

                    {loading && (
                        <ProgressBar 
                            indeterminate 
                            color={MD2Colors.red600} 
                            style={styles.progress}
                        />
                    )}
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
        fontSize: 20,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        color: MD2Colors.grey800,
    },
    input: {
        marginBottom: 12,
    },
    error: {
        color: MD2Colors.red600,
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    actions: {
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    progress: {
        height: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
});
