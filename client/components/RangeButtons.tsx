import {Text, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import Entry from "@/types/entry";

export default function RangeButtons({updateRangeData}: {updateRangeData: (days: number) => void}) {


    const [currentRange, setCurrentRange] = useState(7);

    const handleRangeChange = (days: number) => {
        setCurrentRange(days);
        updateRangeData(days);
    }

    return (
        <View className="flex-row justify-between m-4">
            {[{l: "Week", d: 7}, {l: "Month", d: 31}, {l: "3 Months", d: 91}, {l: "Year", d: 372}, {l: "All", d: 0}]
                .map(({l, d}) => (
                    <TouchableOpacity key={l} onPress={() => handleRangeChange(d)} className="p-4">
                        <Text className={currentRange === d?"text-cgray":"text-cwhite"}>{l}</Text>
                    </TouchableOpacity>
                ))}
        </View>
    )
}