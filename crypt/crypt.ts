import CryptoES from 'crypto-es';
import { Invoice } from './types';

const sha256 = '1613344fe8558d8445a32ebf02e15d09fcade85ef8684b2c178a297ecac04e7f';

export const encrypt = (invoice: Invoice): string => {
    const text = JSON.stringify(invoice); // Conversion de la facture en chaine
    const encrypted = CryptoES.AES.encrypt(text, sha256);

    return encrypted.toString();
};

export const decrypt = (encrypted: string): Invoice|undefined => {
    try {
        const content = CryptoES.AES.decrypt(encrypted, sha256);
        const invoice: Invoice = JSON.parse(content.toString(CryptoES.enc.Utf8));
        return invoice;
    } catch (error) {
        return undefined;
    }
}