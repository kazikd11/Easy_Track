import {View, Text, Pressable, Animated} from "react-native";
import {ChoiceProps} from "@/types/popups";
import {useEffect, useRef} from "react";

export default function ChoicePopup(
    {
        message,
        confirmLabel,
        cancelLabel = "Cancel",
        onConfirm,
        onCancel,
        onHide
    }: ChoiceProps & { onHide: () => void; }) {

    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => onHide());
        onHide();
    };

    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    const handleCancel = () => {
        onCancel?.();
        handleClose();
    };
    return (
        <Animated.View
            style={{
                transform: [{translateY}],
                opacity,
                bottom: 80,
            }} className="absolute left-5 right-5 p-4 rounded-xl z-50 bg-tertiary border-cgray">
            <Text className="text-center font-bold text-cwhite mb-4">{message}</Text>
            <View className="flex-row justify-between">
                <Pressable
                    onPress={handleCancel}
                    className="px-4 py-2 rounded bg-transparentRed"
                >
                    <Text className="text-cwhite">{cancelLabel}</Text>
                </Pressable>
                <Pressable
                    onPress={handleConfirm}
                    className="px-4 py-2 rounded bg-secondary"
                >
                    <Text className="text-quinary">{confirmLabel}</Text>
                </Pressable>
            </View>
        </Animated.View>
    );
}