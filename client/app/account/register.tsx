import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import COLORS from "@/utils/colors";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const response = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message);
                return;
            }

            const data = await response.json();
            if (data && data.success) {
                Alert.alert("Success", "User registered");
            } else {
                Alert.alert("Error", "Something went wrong, please try again");
            }
        } catch (error) {
            console.error("Registration error:", error);
            Alert.alert("Error", "Something went wrong, please try again");
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
