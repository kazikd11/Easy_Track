import React, {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entry from "@/types/entry";
import {usePopup} from "@/context/PopupContext";

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
    const { showMessage, showChoice } = usePopup();

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
                existing => existing.date === entry.date
            );

            if (existingEntry) {
                showMessage({ text: "Record with this date already exists", type: "error" });
                return;
            }

            currentEntries.push(entry);
            await AsyncStorage.setItem("entries", JSON.stringify(currentEntries));
            setEntries(sortEntries(currentEntries))

            showMessage({ text: `Record for ${entry.date} saved`, type: "info" });

        } catch (e) {
            console.error(e);
            showMessage({ text: "Failed to save entry", type: "error" });
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
        showChoice({
            message: "Are you sure you want to delete all local data?",
            confirmLabel: "Yes, delete",
            onConfirm: async () => {
                try {
                    await AsyncStorage.removeItem("entries");
                    setEntries([]);
                    showMessage({ text: "All local data cleared", type: "info" });
                } catch (e) {
                    console.error("Clear error", e);
                    showMessage({ text: "Failed to clear local data", type: "error" });
                }
            }
        });
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
