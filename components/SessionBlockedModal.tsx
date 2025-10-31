import React, { useState, useEffect } from 'react';
import { Modal, Portal, Button, TextInput, Text, Dialog, Paragraph } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { useLocalStorage } from '../local-storage/local-storage';
import { Table } from '../local-storage';
import bcrypt from 'bcryptjs';

interface Account {
    id: string;
    username?: string;
    userIdentifier: string;
    password: string;
    person?: {
        id?: string;
        name: string;
    };
}

interface SessionBlockedModalProps {
    visible: boolean;
    onDismiss: () => void;
    onExtend: (days: number) => void;
    onReset: () => void;
    currentMaxDays: number;
}

// Admin credentials en dur (comparaison directe - pas de hash)
const ADMIN_EMAIL = 'sidpaie01@gmail.com';
const ADMIN_PASSWORD = 's@&paie#01';

export const SessionBlockedModal: React.FC<SessionBlockedModalProps> = ({
    visible,
    onDismiss,
    onExtend,
    onReset,
    currentMaxDays
}) => {
    const [step, setStep] = useState<'choice' | 'extend' | 'reset'>('choice');
    const [supervisorLogin, setSupervisorLogin] = useState('');
    const [supervisorPassword, setSupervisorPassword] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [extendDays, setExtendDays] = useState('');
    const [error, setError] = useState('');
    const [supervisors, setSupervisors] = useState<Account[]>([]);
    const { localStorage } = useLocalStorage();

    // Charger les superviseurs synchronisés
    useEffect(() => {
        localStorage(Table.supervisors)
            .then(value => setSupervisors(value || []))
            .catch(e => console.log('Erreur chargement superviseurs:', e));
    }, []);

    const handleExtendSubmit = async () => {
        if (!supervisorLogin) {
            setError('Veuillez entrer le login superviseur');
            return;
        }

        if (!supervisorPassword) {
            setError('Veuillez entrer le mot de passe superviseur');
            return;
        }
        
        const days = parseInt(extendDays);
        if (!days || days < 1) {
            setError('Veuillez entrer un nombre de jours valide (minimum 1)');
            return;
        }

        if (days > 7) {
            setError('Le nombre de jours ne peut pas dépasser 7');
            return;
        }

        // Vérifier le superviseur avec les données synchronisées
        if (supervisors.length === 0) {
            setError('Aucun superviseur enregistré. Veuillez synchroniser d\'abord.');
            return;
        }

        const supervisor = supervisors.find(s => s.username === supervisorLogin);
        if (!supervisor) {
            setError('Login superviseur incorrect');
            return;
        }

        // Comparaison du mot de passe (haché ou texte brut)
        let isPasswordValid = false;
        
        if (supervisor.password.startsWith('$2a$') || supervisor.password.startsWith('$2b$')) {
            // Bcrypt comparison si le mot de passe est haché
            try {
                isPasswordValid = await bcrypt.compare(supervisorPassword, supervisor.password);
            } catch (err) {
                setError('Erreur lors de la vérification du mot de passe');
                return;
            }
        } else {
            // Comparaison directe si le mot de passe n'est pas haché
            isPasswordValid = supervisor.password === supervisorPassword;
        }

        if (!isPasswordValid) {
            setError('Mot de passe superviseur incorrect');
            return;
        }

        // Mot de passe valide, prolonger la session
        onExtend(days);
        resetModal();
    };

    const handleResetSubmit = () => {
        // Admin: comparaison directe (pas de hash)
        if (adminEmail !== ADMIN_EMAIL) {
            setError('Email administrateur incorrect');
            return;
        }

        if (adminPassword !== ADMIN_PASSWORD) {
            setError('Mot de passe administrateur incorrect');
            return;
        }

        onReset();
        resetModal();
    };

    const resetModal = () => {
        setStep('choice');
        setSupervisorLogin('');
        setSupervisorPassword('');
        setAdminEmail('');
        setAdminPassword('');
        setExtendDays('');
        setError('');
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={resetModal}
                contentContainerStyle={styles.modal}
            >
                {step === 'choice' && (
                    <View>
                        <Text style={styles.title}>⚠️ Session Bloquée</Text>
                        <Text style={styles.message}>
                            La session a dépassé la limite de {currentMaxDays} jours sans synchronisation.
                        </Text>
                        <Text style={styles.subtitle}>Que souhaitez-vous faire ?</Text>

                        <Button
                            mode="contained"
                            onPress={() => setStep('extend')}
                            style={styles.button}
                        >
                            Prolonger la session (Superviseur)
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={() => setStep('reset')}
                            style={styles.button}
                        >
                            Réinitialiser les factures (Administrateur)
                        </Button>

                        <Button
                            mode="text"
                            onPress={resetModal}
                            style={styles.button}
                        >
                            Annuler
                        </Button>
                    </View>
                )}

                {step === 'extend' && (
                    <View>
                        <Text style={styles.title}>Prolonger la session</Text>
                        
                        <TextInput
                            label="Nombre de jours supplémentaires"
                            value={extendDays}
                            onChangeText={setExtendDays}
                            keyboardType="number-pad"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Login superviseur"
                            value={supervisorLogin}
                            onChangeText={setSupervisorLogin}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="none"
                        />

                        <TextInput
                            label="Mot de passe superviseur"
                            value={supervisorPassword}
                            onChangeText={setSupervisorPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <View style={styles.buttonRow}>
                            <Button
                                mode="text"
                                onPress={() => {
                                    setStep('choice');
                                    setError('');
                                }}
                                style={styles.halfButton}
                            >
                                Retour
                            </Button>

                            <Button
                                mode="contained"
                                onPress={handleExtendSubmit}
                                style={styles.halfButton}
                            >
                                Prolonger
                            </Button>
                        </View>
                    </View>
                )}

                {step === 'reset' && (
                    <View>
                        <Text style={styles.title}>⚠️ Réinitialiser les factures</Text>
                        <Text style={styles.warning}>
                            ATTENTION : Cette action effacera toutes les factures non synchronisées.
                            Les informations de session (percepteur, parking, etc.) seront conservées.
                        </Text>

                        <TextInput
                            label="Email administrateur"
                            value={adminEmail}
                            onChangeText={setAdminEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            mode="outlined"
                            style={styles.input}
                        />

                        <TextInput
                            label="Mot de passe administrateur"
                            value={adminPassword}
                            onChangeText={setAdminPassword}
                            secureTextEntry
                            mode="outlined"
                            style={styles.input}
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <View style={styles.buttonRow}>
                            <Button
                                mode="text"
                                onPress={() => {
                                    setStep('choice');
                                    setError('');
                                }}
                                style={styles.halfButton}
                            >
                                Retour
                            </Button>

                            <Button
                                mode="contained"
                                onPress={handleResetSubmit}
                                style={[styles.halfButton, styles.dangerButton]}
                                buttonColor="#d32f2f"
                            >
                                Réinitialiser
                            </Button>
                        </View>
                    </View>
                )}
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
    },
    warning: {
        fontSize: 14,
        color: '#d32f2f',
        marginBottom: 16,
        backgroundColor: '#ffebee',
        padding: 12,
        borderRadius: 4,
    },
    input: {
        marginBottom: 12,
    },
    button: {
        marginVertical: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    halfButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    dangerButton: {
        backgroundColor: '#d32f2f',
    },
    error: {
        color: '#d32f2f',
        marginBottom: 12,
        textAlign: 'center',
    },
});
