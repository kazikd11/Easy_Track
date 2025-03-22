import {Stack} from "expo-router";
import "@/global.css"
import {useEffect} from "react";
import {StatusBar} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function RootLayout() {

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor('#0D0D0D');
        StatusBar.setTranslucent(true);
    }, []);
    return (
        <SafeAreaView className="flex-1">
            <Stack>
                <Stack.Screen name="(tabs)" options={{
                    headerShown: false,
                }}/>
            </Stack>
        </SafeAreaView>

    )
}
