import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import COLORS from "@/utils/colors";
import { usePopup } from "@/context/PopupContext";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { showMessage } = usePopup();

    const apiUrl = process.env.EXPO_PUBLIC_API_URL

    const validateInput = (): boolean => {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;

        if (!emailRegex.test(email)) {
            showMessage({ text: "Invalid email format", type: "error" });
            return false;
        }

        if (!password || password.length < 8) {
            showMessage({ text: "Password must be at least 8 characters long", type: "error" });
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateInput()) return
        try {
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage({ text: data.message || "Unexpected error, please try again later", type: "error" });
                return;
            }

            if (data && data.success) {
                showMessage({ text: "User registered successfully", type: "info" });
            } else {
                showMessage({ text: "Unexpected response from server", type: "error" });
            }
        } catch (error) {
            console.error("Registration error:", error);
            showMessage({ text: "Network error. Please try again.", type: "error" });
        }
    };


    return (
        <View className="flex-1 bg-primary p-4">
            <Text className="text-cwhite text-lg mb-4">Register</Text>

            <TextInput
                className="border-cwhite border-2 text-cwhite p-2 mb-2 rounded"
                placeholder="Email"
                placeholderTextColor={COLORS.cgray}
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                className="border-cwhite border-2 text-cwhite p-2 mb-4 rounded"
                placeholder="Password"
                placeholderTextColor={COLORS.cgray}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Pressable className="bg-cwhite p-3 mb-2 rounded" onPress={handleRegister}>
                <Text className="text-cblack text-center">Sign up</Text>
            </Pressable>
        </View>
    );
}
