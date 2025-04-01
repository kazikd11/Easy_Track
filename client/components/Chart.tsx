import {Area, CartesianChart, Line, useChartPressState} from "victory-native";
import COLORS from "@/utils/colors";
import {Text, TouchableOpacity, View} from "react-native";
import {useEntries} from "@/context/EntriesContext";
import {LinearGradient, useFont, vec} from "@shopify/react-native-skia";
import {useEffect, useState} from "react";
import ToolTip from "@/components/ToolTip";
import {scaleTime} from "d3-scale";

const spacemono = require("@/assets/fonts/SpaceMono-Regular.ttf");

export default function Chart() {

    const {entries} = useEntries()
    const font = useFont(spacemono, 10);
    const font2 = useFont(spacemono, 13);

    const mapDate = (date: string) => {
        return new Date(date).getTime();
    }

    const mapEntries = () => entries.map(entry => ({
        date: mapDate(entry.date),
        value: entry.value
    }));

    const [chartData, setChartData] = useState(mapEntries());

    useEffect(() => {
        setChartData(mapEntries());
    }, [entries]);

    const {state, isActive} = useChartPressState<{ x: number; y: { value: number; } }>({x: 0, y: {value: 0}});

    const domain = {
        x: [
            Math.min(...chartData.map((d) => d.date)),
            Math.max(...chartData.map((d) => d.date)),
        ],
    };
    const timeDomain = scaleTime().domain(domain.x)
    const ticks = timeDomain.ticks(7).map((d) => d.getTime());

    const updateChartData = (days: number) => {
        console.log("updateViewport", days)
        if (days === 0) {
            setChartData(mapEntries());
        } else {
            const now = chartData[0].date
            const past = now - days * 24 * 60 * 60 * 1000
            setChartData((x) => {
                return x.filter((d) => d.date >= past)
            });
        }
    };

    return (
        <View className="w-[90%] h-[100%] justify-center items-center">
            <View className="w-[100%] h-[40%] ">
                <CartesianChart
                    data={chartData}
                    xKey={"date"}
                    yKeys={["value"]}
                    domainPadding={{top: 30, bottom: 30, left: 15, right: 15}}
                    axisOptions={
                        {
                            lineColor: COLORS.cgray,
                            labelColor: COLORS.cgray,
                            font,

                        }
                    }
                    chartPressState={state}
                    xAxis={{
                        tickValues: ticks,
                        font,
                        lineColor: COLORS.cgray,
                        labelColor: COLORS.cgray,
                        formatXLabel: label => {
                            const date = new Date(label);
                            return `${date.getDate()}.${date.getMonth() + 1}`;
                        }
                    }}


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
                                {isActive && (<ToolTip x={state.x.position} y={state.y.value.position}
                                                       number={state.y.value.value} font={font2}/>)}
                            </>
                        )
                    }
                    }
                </CartesianChart>
            </View>
            <View className="flex-row justify-between m-4">
                {[{l: "Week", d: 7}, {l: "Month", d: 30}, {l: "3 Months", d: 90}, {l: "Year", d: 365}, {l: "All", d: 0}]
                    .map(({l, d}) => (
                        <TouchableOpacity key={l} onPress={() => updateChartData(d)} className="p-4">
                            <Text className="text-cwhite">{l}</Text>
                        </TouchableOpacity>
                    ))}
            </View>
        </View>
    )
}