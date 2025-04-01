import {Area, CartesianChart, Line, useChartPressState} from "victory-native";
import COLORS from "@/utils/colors";
import {Text, TouchableOpacity, View} from "react-native";
import {useEntries} from "@/context/EntriesContext";
import {LinearGradient, useFont, vec} from "@shopify/react-native-skia";
import {useEffect, useState} from "react";
import ToolTip from "@/components/ToolTip";
import {scaleTime} from "d3-scale";
import RangeButtons from "@/components/RangeButtons";

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
    const [rangeData, setRangeData] = useState(chartData);

    useEffect(() => {
        setChartData(mapEntries());
        updateRangeData(7)
    }, [entries]);

    const {state, isActive} = useChartPressState<{ x: number; y: { value: number; } }>({x: 0, y: {value: 0}});

    const domain : {x: [number, number]} = {
        x: [
            Math.min(...rangeData.map((d) => d.date)),
            Math.max(...rangeData.map((d) => d.date)),
        ]
   }
    const timeDomain = scaleTime().domain(domain.x)
    const ticks = timeDomain.ticks(7).map((d) => d.getTime());

    const updateRangeData = (days: number) => {
        if (days === 0) {
            setRangeData(chartData);
        } else {
            const now = new Date(chartData[0].date)
            const past = new Date(now.getFullYear(), now.getMonth(), now.getDate()-days).getTime();
            setRangeData(chartData.filter((d) => d.date >= past));
        }
    };

    return (
        <View className="w-[100%] h-[100%] justify-center items-center mt-[100px]">
            <View className="w-[95%] h-[40%] ">
                <CartesianChart
                    data={rangeData}
                    xKey={"date"}
                    yKeys={["value"]}
                    domainPadding={{top: 30, bottom: 30, left: 25, right: 30}}
                    axisOptions={
                        {
                            lineColor: COLORS.cgray,
                            labelColor: COLORS.cgray,
                            font,

                        }
                    }
                    domain={domain}
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

                    renderOutside={
                        () => {
                            return (isActive ? (
                                <ToolTip x={state.x.position} y={state.y.value.position}
                                         number={state.y.value.value} font={font2}/>
                            ) : null)
                        }

                    }


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
                            </>
                        )
                    }
                    }
                </CartesianChart>
            </View>
            <RangeButtons updateRangeData={updateRangeData} />
        </View>
    )
}