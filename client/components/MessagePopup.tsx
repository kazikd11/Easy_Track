import {useEffect, useRef} from "react";
import {Animated, Text} from "react-native";
import {MessageProps} from "@/types/popups";
import COLORS from "@/utils/colors";

export default function MessagePopup(
    {
        text,
        type = "info",
        onHide
    }: MessageProps & { onHide: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start();

        const timeout = setTimeout(() => {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            }).start(() => onHide())
        })

        return () => clearTimeout(timeout)
    }, [])

    const getTextColor = () => {
        switch (type) {
            case "error":
                return COLORS.quinary;
            case "info":
            default:
                return COLORS.cwhite;
        }
    };

    return (
        <Animated.View style={{opacity}}
                       className="absolute bottom-20 left-20 right-20 bg-secondary p-4 rounded-t-lg shadow-lg z-50">
            <Text style={{color:getTextColor()}}>{text}</Text>
        </Animated.View>
    )
}
