import React, { ReactNode } from "react";

// export const AuthContext = createContext({
    // supervisor: <Account|undefined> undefined,
    // perceptor: <Account|undefined> undefined,
    // addPerceptor: (perceptor?: Account): void => {},
    // addSupervisor: (perceptor?: Account): void => {},
    // setDevice: (device: any): void => {},
    // TODO : Suppression du champ location sur le type device
    // device: <{id: string, code: string, location?: { name: string }, site: {id: string, name: string} }|undefined> undefined
// });

export const FeedBackContext = React.createContext<ContextData>({
    message: undefined,
    reset: () => {},
    communicate: (message: Message) => {},
    duration: 5000
});

export const Provider: React.FC<{ children: ReactNode }> = (props) => {
    const [message, setMessage] = React.useState<Message>();

    const reset = async () => {
        setMessage(undefined);
    };

    const communicate = async (message: Message) => {
        setMessage(message);
    };

    return (
        <FeedBackContext.Provider 
            value={{ message, communicate, reset }}
        >
            {props.children}
        </FeedBackContext.Provider>
    );
};

type ContextData = {
    message?: Message, 
    communicate: (message: Message) => void,
    reset: () => void,
    duration?: number
};

export type Message = {
    content: string;
    duration?: number
};
