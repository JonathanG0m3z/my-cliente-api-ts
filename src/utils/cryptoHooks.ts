import CryptoJS from 'crypto-js';
const { CRYPTOJS_SECRET_KEY = '' } = process.env;

export const encryptValue = (value: string) => {
    return CryptoJS.AES.encrypt(value, CRYPTOJS_SECRET_KEY).toString();
};

export const decryptValue = (value: string) => {
    const decryptedBytes = CryptoJS.AES.decrypt(value.replace('Bearer ', ''), CRYPTOJS_SECRET_KEY);
    const decryptedValue = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedValue;
};