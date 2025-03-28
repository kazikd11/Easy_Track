import {Stack} from "expo-router";
import "@/global.css"
import {useEffect} from "react";
import {Platform, StatusBar, Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import COLORS from "@/utils/colors";
import * as NavigationBar from 'expo-navigation-bar';
import {Updates} from "@expo/config-plugins/build/android";


export default function RootLayout() {

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor(COLORS.primary);
        StatusBar.setTranslucent(true);


        const setNavBar = async () => {
            try {
                await NavigationBar.setBackgroundColorAsync(COLORS.cblack);
                // await NavigationBar.setBackgroundColorAsync(COLORS.tertiary);

            } catch (error) {
                console.error(error);
            }
        }
        setNavBar().then();

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
