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
    supervisors: [],
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
        console.log('🔐 [Auth] Démarrage connexion...');
        const startTime = Date.now();
        
        if(mode === 'perceptor') {
            const account = session?.account;
            if(account) {
                console.log('👤 [Auth] Mode percepteur, vérification mot de passe...');
                
                // Optimisation: vérifier d'abord le texte brut avant bcrypt (plus rapide)
                let isPasswordValid = false;
                
                if(account.password.startsWith('$2a$') || account.password.startsWith('$2b$')) {
                    console.log('🔒 [Auth] Mot de passe haché détecté, utilisation bcrypt...');
                    const bcryptStart = Date.now();
                    
                    // Bcrypt comparison uniquement si nécessaire
                    isPasswordValid = await bcrypt.compare(user.password, account.password);
                    
                    const bcryptDuration = Date.now() - bcryptStart;
                    console.log(`⏱️ [Auth] Bcrypt duration: ${bcryptDuration}ms`);
                    
                    if(bcryptDuration > 3000) {
                        console.warn(`⚠️ [Auth] BCRYPT TRÈS LENT! ${bcryptDuration}ms - Considérer migration vers texte brut en local`);
                    }
                } else {
                    console.log('⚡ [Auth] Comparaison directe (rapide)');
                    // Comparaison directe (instantanée)
                    isPasswordValid = account.password === user.password;
                }
                
                if(isPasswordValid) {
                    setAccount(account);
                    const totalDuration = Date.now() - startTime;
                    console.log(`✅ [Auth] Connexion réussie en ${totalDuration}ms`);
                } else {
                    console.log('❌ [Auth] Mot de passe incorrect');
                    throw new Error('Mot de passe incorrecte');
                }
            } else {
                console.log('❌ [Auth] Aucun compte percepteur trouvé');
                throw new Error('Aucun compte percepteur');
            }
        } else if(mode === 'supervisor') {
            console.log('👔 [Auth] Mode superviseur, recherche utilisateur...');
            
            if(!user.login)
                throw new Error('Login incomplet');
            else if(!user.password)
                throw new Error('Mot de passe incomplet');
            else {
                if(users.length === 0) {
                    console.log('❌ [Auth] Aucun superviseur synchronisé');
                    throw Error('Aucun superviseur enregistré, veuillez synchroniser');
                }
                
                console.log(`🔍 [Auth] Recherche parmi ${users.length} superviseurs...`);
                const searchStart = Date.now();
                
                // Recherche optimisée par username
                const supervisor = users.find(item => item.username === user.login);
                
                const searchDuration = Date.now() - searchStart;
                console.log(`⏱️ [Auth] Recherche duration: ${searchDuration}ms`);
                
                if(searchDuration > 1000) {
                    console.warn(`⚠️ [Auth] RECHERCHE LENTE! ${searchDuration}ms avec ${users.length} superviseurs`);
                }
                
                if(!supervisor) {
                    console.log(`❌ [Auth] Utilisateur "${user.login}" non trouvé`);
                    throw new Error("Utilisateur non trouvé");
                }
                
                console.log(`✅ [Auth] Superviseur trouvé: ${supervisor.username}`);
                console.log('🔒 [Auth] Vérification mot de passe...');
                
                // Optimisation: vérifier d'abord le texte brut avant bcrypt (plus rapide)
                let isPasswordValid = false;
                
                if(supervisor.password.startsWith('$2a$') || supervisor.password.startsWith('$2b$')) {
                    console.log('🔒 [Auth] Mot de passe haché détecté, utilisation bcrypt...');
                    const bcryptStart = Date.now();
                    
                    // Bcrypt comparison uniquement si nécessaire
                    isPasswordValid = await bcrypt.compare(user.password, supervisor.password);
                    
                    const bcryptDuration = Date.now() - bcryptStart;
                    console.log(`⏱️ [Auth] Bcrypt duration: ${bcryptDuration}ms`);
                    
                    if(bcryptDuration > 3000) {
                        console.warn(`⚠️ [Auth] BCRYPT TRÈS LENT! ${bcryptDuration}ms - Appareil faible CPU détecté`);
                    }
                } else {
                    console.log('⚡ [Auth] Comparaison directe (rapide)');
                    // Comparaison directe (instantanée)
                    isPasswordValid = supervisor.password === user.password;
                }
                
                if(isPasswordValid) {
                    setAccount(supervisor);
                    const totalDuration = Date.now() - startTime;
                    console.log(`✅ [Auth] Connexion superviseur réussie en ${totalDuration}ms`);
                } else {
                    console.log('❌ [Auth] Mot de passe incorrect');
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
            value={{ account, switchMode, mode, connection, deconnect, update, supervisors: users }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

type ContextData = {
    account?: Account,
    mode: 'perceptor' | 'supervisor',
    supervisors: Account[],
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
