import {Text, Pressable} from "react-native";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEntries} from "@/context/EntriesContext";
import {usePopup} from "@/context/PopupContext";

export default function User() {
    const {user, logout} = useAuth();
    const {clearEntries, entries, setEntries} = useEntries();
    const router = useRouter();
    const {showMessage, showChoice} = usePopup();

    const handleClearStorage = () => {
        showChoice({
            message: "This will erase all your local data. Are you sure?",
            confirmLabel: "Yes, delete",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    await clearEntries();
                    showMessage({ text: "Data cleared", type: "info" });
                } catch (e) {
                    console.error("Error clearing storage:", e);
                    showMessage({ text: "Failed to clear data", type: "error" });
                }
            },
            onCancel: () => {
                showMessage({ text: "Operation cancelled", type: "info" });
            }
        });
    };


    const handleFromCloud = async () => {
        try {
            const response = await fetch("http://localhost:8080/sync", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user}`,
                },
            });

            const data = await response.json();

            if (response.ok) {

                if (entries && entries.length > 0) {
                    if (!data || data.length === 0) {
                        showMessage({ text: "No data in the cloud", type: "info" });
                    } else {
                        showChoice({
                            message: "Data conflict: which data should be prioritized?",
                            confirmLabel: "Use cloud data",
                            cancelLabel: "Use local data",
                            onConfirm: async () => {
                                setEntries(data);
                                showMessage({ text: "Cloud data used", type: "info" });
                            },
                            onCancel: async () => {
                                await handleToCloud();
                                showMessage({ text: "Local data used and synced to cloud", type: "info" });
                            }
                        });
                    }
                } else {
                    if (data && data.length > 0) {
                        setEntries(data);
                        showMessage({ text: "Data synced from cloud", type: "info" });
                    } else {
                        showMessage({ text: "No data in the cloud", type: "info" });
                    }
                }
            } else {
                showMessage({ text: data.message || "Sync failed", type: "error" });
            }
        } catch (e) {
            console.error(e);
            showMessage({ text: "Network error while syncing from cloud", type: "error" });
        }
    };


    const handleToCloud = async () => {
        if (entries.length === 0) {
            showMessage({ text: "No local data to sync", type: "error" });
            return;
        }
        try {
            const response = await fetch("http://localhost:8080/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user}`,
                },
                body: JSON.stringify(entries),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage({ text: "Data synced to cloud", type: "info" });
            } else {
                showMessage({ text: data.message || "Sync failed", type: "error" });
            }
        } catch (e) {
            console.error(e);
            showMessage({ text: "Network error while syncing to cloud", type: "error" });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout error", e);
            showMessage({ text: "Network error, please try again later", type: "error" });
        }
    }


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
                    <Pressable className="p-4 border-b border-cgray" onPress={handleLogout}>
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
