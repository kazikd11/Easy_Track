import {Text, Pressable} from "react-native";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEntries} from "@/context/EntriesContext";
import {usePopup} from "@/context/PopupContext";
import {useEffect} from "react";

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
                    console.log("debug");
                    showMessage({text: "Local data cleared", type: "info"})
                }
                catch (e) {
                    console.error("Clear storage error:", e);
                    showMessage({text: "Error clearing local data", type: "error"})
                }

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
                        showMessage({text: "No data in the cloud", type: "info"});
                    } else {
                        showChoice({
                            message: "Data conflict: which data should be prioritized?",
                            confirmLabel: "Use cloud data",
                            cancelLabel: "Use local data",
                            onConfirm: async () => {
                                setEntries(data);
                                showMessage({text: "Cloud data used", type: "info"});
                            },
                            onCancel: async () => {
                                await handleToCloud();
                                showMessage({text: "Local data used and synced to cloud", type: "info"});
                            }
                        });
                    }
                } else {
                    if (data && data.length > 0) {
                        setEntries(data);
                        showMessage({text: "Data synced from cloud", type: "info"});
                    } else {
                        showMessage({text: "No data in the cloud", type: "info"});
                    }
                }
            } else {
                showMessage({text: data.message || "Sync failed", type: "error"});
            }
        } catch (e) {
            console.error(e);
            showMessage({text: "Network error while syncing from cloud", type: "error"});
        }
    };


    const handleToCloud = async () => {
        if (entries.length === 0) {
            showMessage({text: "No local data to sync", type: "error"});
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
                showMessage({text: "Data synced to cloud", type: "info"});
            } else {
                showMessage({text: data.message || "Sync failed", type: "error"});
            }
        } catch (e) {
            console.error(e);
            showMessage({text: "Network error while syncing to cloud", type: "error"});
        }
    };

    const handleLogout = async () => {
        showChoice({
            message: "Do you want to sync your local data to the cloud before logging out?",
            confirmLabel: "Sync and logout",
            cancelLabel: "Just logout",
            onConfirm: async () => {
                await handleToCloud();
                await logout();

            },
            onCancel: async () => {
                await logout();
            }
        });
    };


    const handleDeleteAccount = async () => {
        showChoice({
            message: "This will permanently delete your account and all data. Are you sure?",
            confirmLabel: "Delete account",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    const response = await fetch("http://localhost:8080/delete", {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${user}`,
                        },
                    });

                    if (response.ok) {
                        await logout();
                        showMessage({text: "Account deleted", type: "info"});
                    } else {
                        const data = await response.json();
                        showMessage({text: data.message || "Failed to delete account", type: "error"});
                    }
                } catch (e) {
                    console.error("Delete account error:", e);
                    showMessage({text: "Network error during deletion", type: "error"});
                }
            },
            onCancel: () => {
                showMessage({text: "Deletion cancelled", type: "info"});
            },
        });
    };


    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            {!user ? (
                <>
                    <Pressable className="p-4 border-b border-cgray" onPress={() => router.navigate('/account/login')}>
                        <Text className="text-cwhite">Login</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray"
                               onPress={() => router.navigate('/account/register')}>
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
                    <Pressable className="p-4 border-b border-cgray" onPress={handleDeleteAccount}>
                        <Text className="text-quinary">Delete account and all data</Text>
                    </Pressable>

                </>
            )}
            <Pressable className="p-4 border-b border-cgray" onPress={handleClearStorage}>
                <Text className="text-quinary">Clear all local data</Text>
            </Pressable>
        </SafeAreaView>
    );
}
