import React, { ReactNode } from "react";
import { useLocalStorage } from "../local-storage/local-storage";
import { Table } from "../local-storage";
import { SessionContext } from "../session/context";
import { usePersist } from "../local-storage/local-storage-2";
import bcrypt from "bcryptjs";

// export const AuthContext = createContext({
    // supervisor: <Account|undefined> undefined,
    // perceptor: <Account|undefined> undefined,
    // addPerceptor: (perceptor?: Account): void => {},
    // addSupervisor: (perceptor?: Account): void => {},
    // setDevice: (device: any): void => {},
    // TODO : Suppression du champ location sur le type device
    // device: <{id: string, code: string, location?: { name: string }, site: {id: string, name: string} }|undefined> undefined
// });

export const AuthContext = React.createContext<ContextData>({
    account: undefined,
    mode: 'perceptor',
    switchMode: () => {},
    connection: async (user: { login?: string, password: string }) => {},
    deconnect: () => {},
    update: (users: Account[]) => {}
});

export const Provider: React.FC<{ children: ReactNode }> = (props) => {
    const [mode, setMode] = React.useState<'perceptor'|'supervisor'>('perceptor');
    const [account, setAccount] = React.useState<Account>();
    const [users, setUsers] = React.useState<Account[]>([]); // Liste des comptes selon le mode
    /** Context des données local, vérification de la mise à jour via la varibale "syncrhonisation" */
    const { session } = React.useContext(SessionContext);
    const { localStorage } = useLocalStorage();
    const { persist } = usePersist();

    const switchMode = () => {
        setMode(mode === 'perceptor' ? 'supervisor' : 'perceptor');
    };

    const update = (users: Account[]) => {
        setUsers(users);
    }

    const connection = async (user: { login?: string, password: string }) => { 
        if(mode === 'perceptor') {
            const account = session?.account;
            if(account) {
                // Compare password using bcrypt (supports both plain text and hashed passwords)
                let isPasswordValid = false;
                
                if(account.password.startsWith('$2a$') || account.password.startsWith('$2b$')) {
                    // Async bcrypt comparison (non-blocking)
                    isPasswordValid = await bcrypt.compare(user.password, account.password);
                } else {
                    // Plain text comparison (instant)
                    isPasswordValid = account.password === user.password;
                }
                
                if(isPasswordValid) {
                    setAccount(account);
                } else {
                    throw new Error('Mot de passe incorrecte');
                }
            } else {
                throw new Error('Aucun compte percepteur');
            }
        } else if(mode === 'supervisor') {
            if(!user.login)
                throw new Error('Login incomplet');
            else if(!user.password)
                throw new Error('Mot de passe incomplet');
            else {
                if(users.length === 0)
                    throw Error('Aucun superviseur enregistré, veuillez synchroniser');
                
                // Find supervisor by username
                const supervisor = users.find(item => item.username === user.login);
                
                if(!supervisor) {
                    throw new Error("Utilisateur non trouvé");
                }
                
                // Compare password using bcrypt (supports both plain text and hashed passwords)
                let isPasswordValid = false;
                
                if(supervisor.password.startsWith('$2a$') || supervisor.password.startsWith('$2b$')) {
                    // Async bcrypt comparison (non-blocking)
                    isPasswordValid = await bcrypt.compare(user.password, supervisor.password);
                } else {
                    // Plain text comparison (instant)
                    isPasswordValid = supervisor.password === user.password;
                }
                
                if(isPasswordValid) {
                    setAccount(supervisor);
                } else {
                    throw new Error("Échec d'authentification");
                }
            }
        }
    };

    const deconnect = () => {
        setAccount(undefined);
    }

    React.useEffect(() => {
        localStorage(Table.supervisors)
            .then(value => setUsers(value))
            .catch(e => console.log('Local Strorage => supervisors =>', e));
    }, []);

    React.useEffect(() => {
        if(users) {
            persist<Account[]>({ value: users, table: Table.supervisors })
                .catch((error) => {
                    throw error;
                });
        }
    }, [users]);

    return (
        <AuthContext.Provider 
            value={{ account, switchMode, mode, connection, deconnect, update }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

type ContextData = {
    account?: Account,
    mode: 'perceptor' | 'supervisor',
    switchMode: () => void,
    connection: (user: { login?: string, password: string }) => Promise<void>,
    deconnect: () => void,
    update: (users: Account[]) => void
};

export interface Account {
    id: string,
    username?: string,
    userIdentifier: string,
    password: string,
    person?: {
        id?: string,
        name: string
    }
};
