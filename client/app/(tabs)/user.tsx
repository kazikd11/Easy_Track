import React, { useContext } from "react";
import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { AuthContext } from "@/context/AuthContext";
import {useRouter} from "expo-router";

export default function User() {
    // const { user, logout } = useContext(AuthContext);
    const router = useRouter();

    const clearStorage = async () => {
        try {
            await AsyncStorage.clear();
            console.log('AsyncStorage cleared');
        } catch (error) {
            console.error('Error cleaning AsyncStorage: ', error);
        }
    };

    return (
        <View className="flex-1 bg-primary">
            {!false ? (
                <>
                    <Pressable className="p-4 border-b border-cgray" onPress={() => router.navigate('/account/login')}>
                        <Text className="text-cwhite">Login</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={() => router.navigate('/account/register')}>
                        <Text className="text-cwhite">Register</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={clearStorage}>
                        <Text className="text-quinary">Clear all data</Text>
                    </Pressable>
                </>
            ) : (
                <>
                    <Pressable className="p-4 border-b border-cgray" >
                        <Text className="text-cwhite">Logout</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray">
                        <Text className="text-cwhite">Sync from cloud</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={clearStorage}>
                        <Text className="text-quinary">Clear all data</Text>
                    </Pressable>
                </>
            )}
        </View>
    );
}
