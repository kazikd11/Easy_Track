import {CartesianChart, Line} from "victory-native";
import COLORS from "@/utils/colors";
import {DATA} from "@/utils/data";
import {View} from "react-native";
import {useEntries} from "@/context/EntriesContext";

export default function Chart() {

    const {entries} = useEntries()

    const chartData = entries.map(entry => ({
        date: entry.date,
        value: entry.value
    }));

    return (
        <View className="w-[80%] h-[40%] border-4 border-quaternary">
            <CartesianChart
                data={chartData}
                xKey="date"
                yKeys={["value"]}
                domainPadding={{top: 30, bottom: 30}}
                axisOptions={
                    {
                        lineColor: COLORS.quaternary,
                        labelColor: COLORS.cwhite
                    }
                }
            >
                {({points, chartBounds}) => {
                    return (
                        <Line points={points.value}
                              color={"#00FF00"}
                              strokeWidth={2}
                              animate={{type: "timing", duration: 500}}
                        />)

                }
                }
            </CartesianChart>
        </View>
    )
}