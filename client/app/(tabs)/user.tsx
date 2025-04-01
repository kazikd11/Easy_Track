import React, { useContext } from "react";
import {View, Text, Pressable} from "react-native";
// import { AuthContext } from "@/context/AuthContext";
import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEntries} from "@/context/EntriesContext";

export default function User() {
    // const { user, logout } = useContext(AuthContext);
    const {clearEntries} = useEntries();
    const router = useRouter();

    const handleClearStorage = async () => {
        try {
            await clearEntries()
        }
        catch (error) {
            console.error('Error clearing storage: ', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            {!false ? (
                <>
                    <Pressable className="p-4 border-b border-cgray" onPress={() => router.navigate('/account/login')}>
                        <Text className="text-cwhite">Login</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={() => router.navigate('/account/register')}>
                        <Text className="text-cwhite">Register</Text>
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
                </>
            )}
            <Pressable className="p-4 border-b border-cgray" onPress={handleClearStorage}>
                <Text className="text-quinary">Clear all data</Text>
            </Pressable>
        </SafeAreaView>
    );
}
