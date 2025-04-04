import React, {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entry from "@/types/entry";
import {Alert} from "react-native";

interface EntriesContextType {
    entries: Entry[];
    saveEntry: (entry: Entry) => Promise<void>;
    clearEntries: () => Promise<void>;
    deleteEntry: (date: string) => Promise<void>;
    setEntries: (entries: Entry[]) => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export const EntriesProvider = ({ children } : {children: React.ReactNode}) => {
    const [entries, setEntries] = useState<Entry[]>([]);

    const sortEntries = (entries: Entry[]) => {
        return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const data = await AsyncStorage.getItem("entries");
                if (data) {
                    const parsedData: Entry[] = JSON.parse(data);
                    setEntries(sortEntries(parsedData))
                    // console.log(sortEntries(parsedData));
                }
            } catch (e) {
                console.error("Get error", e);
            }
        };
        fetchEntries().then();
    }, []);

    const saveEntry = async (entry: Entry) => {
        try {
            const data = await AsyncStorage.getItem("entries")
            const currentEntries: Entry[] = data ? JSON.parse(data) : [];

            const existingEntry = currentEntries.find(
                (existing) => existing.date === entry.date
            );

            if (existingEntry) {
                Alert.alert(
                    "Error",
                    "Record with this date already exists",
                    [{ text: "OK" }]
                );
                return;
            }

            currentEntries.push(entry);
            await AsyncStorage.setItem("entries", JSON.stringify(currentEntries));
            setEntries(sortEntries(currentEntries))

            Alert.alert(
                "Success",
                `Record for ${entry.date} saved successfully`,
                [{ text: "OK" }]
            )

        } catch (e) {
            console.error(e);
        }
    }

    const deleteEntry = async (date: string) => {
        try {
            const data = await AsyncStorage.getItem("entries")
            const currentEntries: Entry[] = data ? JSON.parse(data) : [];

            const newEntries = currentEntries.filter((entry) => entry.date !== date);

            await AsyncStorage.setItem("entries", JSON.stringify(newEntries));
            setEntries(newEntries);
        } catch (e) {
            console.error(e);
        }
    }

    const clearEntries = async () => {
        try {
            await AsyncStorage.removeItem("entries");
            setEntries([]);
        } catch (e) {
            console.error("Clear error", e);
        }
    };



    return (
        <EntriesContext.Provider value={{ entries, saveEntry, clearEntries, deleteEntry, setEntries }}>
            {children}
        </EntriesContext.Provider>
    );
};

export const useEntries = () => {
    const context = useContext(EntriesContext);
    if (!context) {
        throw new Error("Invalid context");
    }
    return context;
};
