import {Area, CartesianChart, Line, useChartPressState} from "victory-native";
import COLORS from "@/utils/colors";
import {View} from "react-native";
import {useEntries} from "@/context/EntriesContext";
import {LinearGradient, useFont, vec} from "@shopify/react-native-skia";
import {useEffect, useState} from "react";
import ToolTip from "@/components/ToolTip";
import {useDerivedValue} from "react-native-reanimated";

const spacemono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export default function Chart() {

    const {entries} = useEntries()
    const font = useFont(spacemono, 10);

    const mapDate = (date: string) => {
        const dateParts = date.split("-");
        return `${dateParts[2]}.${dateParts[1]}`;
    }

    const mapEntries = () => entries.map(entry => ({
        date: mapDate(entry.date),
        value: entry.value
    }));

    const [chartData, setChartData] = useState(mapEntries());

    useEffect(() => {
        setChartData(mapEntries());
    }, [entries]);

    const {state, isActive} = useChartPressState<{ x: string; y: { value: number; } }>({x: "", y: {value: 0}});


    return (
        <View className="w-[90%] h-[40%] ">
            <CartesianChart
                data={chartData}
                xKey={"date"}
                yKeys={["value"]}
                domainPadding={{top: 30, bottom: 30}}
                axisOptions={
                    {
                        lineColor: COLORS.cgray,
                        labelColor: COLORS.cgray,
                        font,

                    }
                }
                chartPressState={state}
            >
                {({points, chartBounds}) => {
                    return (
                        <>
                            <Line
                                points={points.value}
                                color={COLORS.quinary}
                                strokeWidth={3}
                                animate={{type: "timing", duration: 500}}
                            />
                            <Area
                                points={points.value}
                                y0={chartBounds.bottom}
                                animate={{type: "timing", duration: 500}}
                            >
                                <LinearGradient
                                    start={vec(chartBounds.bottom, 0)}
                                    end={vec(chartBounds.bottom, chartBounds.bottom)}
                                    colors={[COLORS.quaternary, COLORS.transparentRed]}/>
                            </Area>
                            {isActive && (<ToolTip x={state.x.position} y={state.y.value.position} number={state.y.value.value} font={font}/>)}
                        </>
                    )

                }
                }
            </CartesianChart>
        </View>
    )
}