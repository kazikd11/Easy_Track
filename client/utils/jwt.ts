import * as SecureStore from "expo-secure-store";

export const saveJwt = async (jwt: string) => {
    await SecureStore.setItemAsync('jwt', jwt).catch((e) => {
        console.error("Error saving JWT:", e);
    });
};

export const getJwt = async () => {
    return await SecureStore.getItemAsync('jwt').catch((e) => {
        console.error("Error reading JWT:", e);
        return null;
    });
};

export const deleteJwt = async () => {
    await SecureStore.deleteItemAsync('jwt').catch((e) => {
        console.error("Error deleting JWT:", e);
    });
};

export const saveRefreshToken = async (refreshToken: string) => {
    await SecureStore.setItemAsync('refreshToken', refreshToken).catch((e) => {
        console.error("Error saving refreshToken:", e);
    });
};

export const getRefreshToken = async () => {
    return await SecureStore.getItemAsync('refreshToken').catch((e) => {
        console.error("Error reading refreshToken:", e);
        return null;
    });
};

export const deleteRefreshToken = async () => {
    await SecureStore.deleteItemAsync('refreshToken').catch((e) => {
        console.error("Error deleting refreshToken:", e);
    });
};
