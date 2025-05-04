import * as SecureStore from "expo-secure-store";

export const saveJwt = async (jwt: string) => {
    try {
        await SecureStore.setItemAsync('jwt', jwt);
    } catch (e) {
        console.error("saveJwt error:", e);
        throw new Error("Failed to save JWT");
    }
};

export const getJwt = async () => {
    try {
        return await SecureStore.getItemAsync('jwt');
    } catch (e) {
        console.error("getJwt error:", e);
        throw new Error("Failed to read JWT");
    }
};

export const deleteJwt = async () => {
    try {
        await SecureStore.deleteItemAsync('jwt');
    } catch (e) {
        console.error("deleteJwt error:", e);
        throw new Error("Failed to delete JWT");
    }
};

export const saveRefreshToken = async (refreshToken: string) => {
    try {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    } catch (e) {
        console.error("saveRefreshToken error:", e);
        throw new Error("Failed to save refresh token");
    }
};

export const getRefreshToken = async () => {
    try {
        return await SecureStore.getItemAsync('refreshToken');
    } catch (e) {
        console.error("getRefreshToken error:", e);
        throw new Error("Failed to read refresh token");
    }
};

export const deleteRefreshToken = async () => {
    try {
        await SecureStore.deleteItemAsync('refreshToken');
    } catch (e) {
        console.error("deleteRefreshToken error:", e);
        throw new Error("Failed to delete refresh token");
    }
};
