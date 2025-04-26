import {Text, Pressable, Alert} from "react-native";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEntries} from "@/context/EntriesContext";

export default function User() {
    const {user, logout} = useAuth();
    const {clearEntries, entries, setEntries} = useEntries();
    const router = useRouter();

    const handleClearStorage = async () => {
        Alert.alert(
            "Confirm deletion",
            "This will erase all your local data",
            [
                {
                    text: "Cancel",
                },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            await clearEntries();
                        } catch (e) {
                            console.error('Error clearing storage: ', e);
                        }
                    },
                },
            ]
        );
    };

    const handleFromCloud = async () => {
        try {
            const response = await fetch("http://localhost:8080/weight-entires/sync-from-cloud", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user}`,
                },
            });

            const data = await response.json()

            if (response.ok) {
                Alert.alert("Success", "Data synced from cloud")
                setEntries(data.entries)
            }
            else {
                Alert.alert("Sync failed", data.message);
            }

        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to sync from cloud")
        }
    };

    const handleToCloud = async () => {
        try {
            const response = await fetch("http://localhost:8080/weight-entries/sync-to-cloud", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user}`,
                },
                body: JSON.stringify({ entries }),
            });

            const data = await response.json()

            if (response.ok) {
                Alert.alert("Success", "Data synced from cloud")
            }
            else {
                Alert.alert("Sync failed", data.message);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to sync to cloud");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary p-4" >
            {!user ? (
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
                    <Pressable className="p-4 border-b border-cgray" onPress={logout}>
                        <Text className="text-cwhite">Logout</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={handleFromCloud}>
                        <Text className="text-cwhite">Sync from cloud</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray" onPress={handleToCloud}>
                        <Text className="text-cwhite">Sync to cloud</Text>
                    </Pressable>
                </>
            )}
            <Pressable className="p-4 border-b border-cgray" onPress={handleClearStorage}>
                <Text className="text-quinary">Clear all data</Text>
            </Pressable>
        </SafeAreaView>
    );
}
