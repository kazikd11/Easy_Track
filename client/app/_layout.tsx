import {Stack} from "expo-router";
import "@/global.css"
import {useEffect} from "react";
import {StatusBar} from "react-native";
import COLORS from "@/utils/colors";
import * as NavigationBar from 'expo-navigation-bar';
import {EntriesProvider} from "@/context/EntriesContext";


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
        <EntriesProvider>
            <Stack>
                <Stack.Screen name="(tabs)" options={{
                    headerShown: false,
                }}/>
            </Stack>
        </EntriesProvider>

    )
}
