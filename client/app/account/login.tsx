import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useAuth } from "@/context/AuthContext";
import COLORS from "@/utils/colors";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in both fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.jwt) {
                login(data.jwt)
            } else {
                Alert.alert("Login failed", data.message);
            }
        } catch (e) {
            console.error("Login error", e);
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
