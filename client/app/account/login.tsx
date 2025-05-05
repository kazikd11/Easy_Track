import React, { useState } from "react";
import {View, Text, TextInput, Pressable, Keyboard} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { usePopup } from "@/context/PopupContext";
import COLORS from "@/utils/colors";
import {useRouter} from "expo-router";
import {syncFromCloud, syncToCloud} from "@/lib/cloudSync";
import {useEntries} from "@/context/EntriesContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const { login } = useAuth();
    const { entries, setEntries } = useEntries();
    const { showMessage, showChoice } = usePopup();

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email || !password) {
            showMessage({ text: "Please fill in both fields", type: "error" });
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.jwtToken && data.refreshToken) {
                await login(data.jwtToken, data.refreshToken);
                showMessage({ text: "Login successful!", type: "info" })

                await syncFromCloud(
                    data.jwtToken,
                    entries,
                    setEntries,
                    showChoice,
                    showMessage,
                    () => syncToCloud(entries, data.jwtToken, showMessage)
                );

                router.back()
            } else {
                showMessage({ text: data.message || "Unexpected error, please try again later", type: "error" });
            }
        } catch (e) {
            console.error("Login error", e);
            showMessage({ text: "Network error, please try again later", type: "error" });
        }
    };


    return (
        <View className="flex-1 bg-primary p-4 ">
            <Text className="text-white text-lg mb-4">Login</Text>

            <TextInput
                className="p-2 mb-2 rounded border-cwhite text-cwhite border-2"
                placeholder="Email"
                placeholderTextColor={COLORS.cgray}
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                className="p-2 mb-4 rounded border-cwhite text-cwhite border-2"
                placeholder="Password"
                placeholderTextColor={COLORS.cgray}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable className="p-3 mb-2 rounded bg-cwhite border-2" onPress={handleLogin}>
                <Text className="text-cblack text-center">Log in</Text>
            </Pressable>
        </View>
    );
}
