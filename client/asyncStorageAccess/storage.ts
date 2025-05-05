import AsyncStorage from '@react-native-async-storage/async-storage';
import Entry from '@/types/entry';

export const getEntriesFromStorage = async (): Promise<Entry[]> => {
    try {
        const data = await AsyncStorage.getItem('entries');
        if (data) {
            return JSON.parse(data);
        }
        return [];
    } catch (e) {
        console.error("getEntriesFromStorage error", e);
        return [];
    }
};

export const saveEntriesToStorage = async (entries: Entry[]): Promise<void> => {
    try {
        await AsyncStorage.setItem('entries', JSON.stringify(entries));
    } catch (e) {
        console.error("saveEntriesToStorage error:", e);
        throw new Error('Failed to save entries');
    }
};

export const clearEntriesInStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('entries');
    } catch (e) {
        console.error("clearEntriesInStorage error:", e);
        throw new Error('Failed to clear entries');
    }
};
