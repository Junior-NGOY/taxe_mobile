import { useState } from "react"
import * as Print from 'expo-print';
import { html } from "./invoice";

export const usePrint = () => {
    const [loading, setLoading] = useState(false);

    const print = async (invoice?: string) => {
        setLoading(true);
        try {
            await Print.printAsync({
                html: invoice ? invoice : html,
                width: 270
            });
        } catch (error) {
            setLoading(false);
            throw error;
        } 
        setLoading(false);
    };

    return { loading, print };
}