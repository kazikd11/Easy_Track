import {SharedValue, useDerivedValue} from "react-native-reanimated";
import {Circle, SkFont, Text} from "@shopify/react-native-skia";
import COLORS from "@/utils/colors";

export default function ToolTip({x, y, font, number}: {
    x: SharedValue<number>,
    y: SharedValue<number>,
    font: SkFont | null,
    number: SharedValue<number>
}) {

    const text = useDerivedValue(()=> number.value.toString(), [number]);

    const textWidth = useDerivedValue(() => text.value.toString().length * 6, [text]);

    const tx = useDerivedValue(() => x.value - textWidth.value / 2, [x, textWidth]);
    const ty = useDerivedValue(() => y.value - 10, [y]);

    return (
        <>
            <Text
                x={tx}
                y={ty}
                text={text}
                font={font}
                color={COLORS.cwhite}
                opacity={1}
            />
            <Circle
                r={6}
                cx={x}
                cy={y}
                color={COLORS.cwhite}
                opacity={0.8}
            />
        </>
    );
}
