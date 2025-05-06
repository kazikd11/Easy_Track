import {View, Text, Pressable} from "react-native";
import Chart from "@/components/Chart";
import {useEntries} from "@/context/EntriesContext";
import {Link, useFocusEffect} from "expo-router";
import {usePopup} from "@/context/PopupContext";
import {useCallback, useEffect} from "react";

export default function Stats() {

    const {entries} = useEntries()
    const {showMessage} = usePopup()

    useFocusEffect(
        useCallback(() => {
            if (entries.length < 2) {
                showMessage({text: "Add at least 2 entries to display chart", type: "info"});
            }
        }, [entries])
    );

    return (
        <View className="bg-primary flex-1 justify-center items-center">
            {entries.length >= 2 ? <Chart/> : (
                <View className="w-[90%] h-[40%] rounded-lg justify-center items-center">
                    <Link href="/" className="p-4">
                        <Text className="text-cwhite text-2xl">Go back</Text>
                    </Link>
                </View>
            )}
        </View>
    );
}