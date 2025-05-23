import {Stack} from "expo-router";
import "@/global.css"
import {useEffect} from "react";
import {StatusBar} from "react-native";
import COLORS from "@/utils/colors";
import * as NavigationBar from 'expo-navigation-bar';
import {EntriesProvider} from "@/context/EntriesContext";
import {AuthProvider} from "@/context/AuthContext";
import * as SystemUI from 'expo-system-ui';
import {PopupProvider} from "@/context/PopupContext";
import {registerBackgroundTask} from "@/utils/backgroundSync";

SystemUI.setBackgroundColorAsync(COLORS.primary).catch(() => {
    console.error('Error setting system UI background color');
});

export default function RootLayout() {

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor(COLORS.primary);
        StatusBar.setTranslucent(true);

        // const clearAllStorage = async () => {
        //     try {
        //         await AsyncStorage.clear();
        //         console.log('AsyncStorage has been cleared!');
        //     } catch (error) {
        //         console.error('Error clearing AsyncStorage:', error);
        //     }
        // };
        // clearAllStorage().then();

        const setNavBar = async () => {
            try {
                await NavigationBar.setBackgroundColorAsync(COLORS.cblack);
            } catch (error) {
                console.error(error);
            }
        }
        setNavBar().then()
        registerBackgroundTask().then()

    }, []);

    return (
        <PopupProvider>
            <EntriesProvider>
                <AuthProvider>
                    <Stack
                        screenOptions={{
                            animation: 'fade',
                        }}
                    >
                        <Stack.Screen name="(tabs)" options={{
                            headerShown: false,
                        }}/>
                        <Stack.Screen name="account/login" options={{
                            headerShown: false,
                        }}/>
                        <Stack.Screen name="account/register" options={{
                            headerShown: false,

                        }}/>
                    </Stack>
                </AuthProvider>
            </EntriesProvider>
        </PopupProvider>
    )
}
