import {View} from "react-native";
import {useFocusEffect} from "expo-router";
import {useEntries} from "@/context/EntriesContext";
import {CartesianChart, Line} from "victory-native";
import COLORS from "@/utils/colors";
import Chart from "@/components/Chart";

export default function Stats() {

    // const {entries} = useEntries();
    //
    // const chartData = entries.map(entry => ({
    //     day: entry.date,
    //     kg: entry.value
    // }));
    //
    // useFocusEffect(() => {
    //     console.log("Stats screen focused");
    //     console.log(entries)
    // })

    return (
        <View className="bg-primary flex-1 justify-center items-center"
        >
            <Chart />
        </View>
    );
}
