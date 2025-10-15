import React, { ReactNode, createContext } from "react";
import { BASE_URL } from '../api/config'; // Utilise BASE_URL qui pointe vers local
import { Data, useDevice } from "../hooks/useDevice";

export const LocalDataContext = createContext<DataContext>({
    apiUrl: BASE_URL,
    device: undefined,
    update: (data: Data) => {}
});

export const Provider: React.FC<{ children: ReactNode }> = (props) => {
    const data = useDevice();

    return (
        <LocalDataContext.Provider 
            value={data}
        >
            {props.children}
        </LocalDataContext.Provider>
    );
};


type DataContext = {
    device?: Device,
    apiUrl?: string,
    update: (data: Data) => void
}


export interface Device {
    id?: string,
    name?: string,
    state?: string,
    code?: string,
    site?: {
        id: string,
        name: string,
        template?: string // Template HTML directement dans le site (comme Symfony)
    }
}
export type { DataContext };