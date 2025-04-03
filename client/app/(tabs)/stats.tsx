import {View, Text, Pressable} from "react-native";
import Chart from "@/components/Chart";
import {useEntries} from "@/context/EntriesContext";
import {Link} from "expo-router";

export default function Stats() {

    const {entries} = useEntries()

    return (
        <View className="bg-primary flex-1 justify-center items-center"
        >

            {entries.length >= 2 ? <Chart/> : (
                <View className="w-[90%] h-[40%] rounded-lg justify-center items-center">
                    <Text className="text-quinary text-xl">Add at least 2 entries to display chart</Text>
                    <Link href="/" className="p-4">
                        <Text className="text-cwhite text-2xl">OK</Text>
                    </Link>
                </View>
            )}
        </View>
    );
}