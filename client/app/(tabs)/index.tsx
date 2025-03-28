import {View, Text, Alert} from "react-native";
import AddEntry from "@/components/AddEntry";
import History from "@/components/History";
import {DateTimePickerEvent} from "@react-native-community/datetimepicker";
import Entry from "@/types/entry";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";

export default function Index() {

    const [entries, setEntries] = useState<Entry[]>([]);

    const getEntries = async (): Promise<Entry[]> => {
        try {
            const data = await AsyncStorage.getItem("entries");
            if (data) {
                return JSON.parse(data);
            }
            return []
        } catch (e) {
            console.error(e);
            return []
        }
    }

    useEffect(() => {
        const fetchEntries = async () => {
            const entries = await getEntries();
            setEntries(entries);
            console.log(entries);
        }
        fetchEntries().then();
    },[])

    const saveEntry = async (entry: Entry) => {
        try {
            const data = await AsyncStorage.getItem("entries")
            const currentEntries: Entry[] = data ? JSON.parse(data) : [];

            const existingEntry = currentEntries.find(
                (existing) => existing.date === entry.date
            );

            if (existingEntry) {
                Alert.alert(
                    "Błąd",
                    "Wpis z tą datą już istnieje",
                    [{ text: "OK" }]
                );
                return;
            }

            currentEntries.push(entry);
            await AsyncStorage.setItem("entries", JSON.stringify(currentEntries));
            setEntries(currentEntries);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <View className="bg-primary flex-1 justify-center items-center">
            <AddEntry saveEntry={saveEntry}/>
            <History entries={entries}/>
        </View>
    )
}