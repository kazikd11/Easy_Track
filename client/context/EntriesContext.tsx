import React, {createContext, useContext, useEffect, useState} from "react";
import Entry from "@/types/entry";
import {clearEntriesInStorage, getEntriesFromStorage, saveEntriesToStorage} from "@/utils/storage";

interface EntriesContextType {
    entries: Entry[];
    saveEntry: (entry: Entry) => Promise<void>;
    clearEntries: () => Promise<void>;
    deleteEntry: (date: string) => Promise<void>;
    setEntries: (entries: Entry[]) => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export const EntriesProvider = ({children}: { children: React.ReactNode }) => {
        const [entries, setEntries] = useState<Entry[]>([]);

        const sortEntries = (entries: Entry[]) => {
            return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        useEffect(() => {
            (async () => {
                const data = await getEntriesFromStorage()
                if (data) setEntries(sortEntries(data))
            })();
        }, []);

        const saveEntry = async (entry: Entry) => {
            const currentEntries = await getEntriesFromStorage();
            const existingEntry = currentEntries.find(existing => existing.date === entry.date);

            if (existingEntry) {
                throw new Error("Record with this date already exists");
            }

            currentEntries.push(entry);
            await saveEntriesToStorage(currentEntries);
            setEntries(sortEntries(currentEntries));
        };

        const deleteEntry = async (date: string) => {
            const data = await getEntriesFromStorage()
            const newEntries = data.filter((entry) => entry.date !== date);
            await saveEntriesToStorage(newEntries);
            setEntries(newEntries);
        }

        const clearEntries = async () => {
            await clearEntriesInStorage()
            setEntries([]);
        };


        return (
            <EntriesContext.Provider value={{entries, saveEntry, clearEntries, deleteEntry, setEntries}}>
                {children}
            </EntriesContext.Provider>
        );
    }
;

export const useEntries = () => {
    const context = useContext(EntriesContext);
    if (!context) {
        throw new Error("Invalid context");
    }
    return context;
};
