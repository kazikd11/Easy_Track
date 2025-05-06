import {Text, Pressable} from "react-native";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {useEntries} from "@/context/EntriesContext";
import {usePopup} from "@/context/PopupContext";
import {logoutWithOptionalSync, syncFromCloud, syncToCloud} from "@/lib/cloudSync";

export default function User() {
    const { user, logout } = useAuth();
    const { clearEntries, entries, setEntries } = useEntries();
    const router = useRouter();
    const { showMessage, showChoice } = usePopup();

    const handleClearStorage = () => {
        showChoice({
            message: "This will erase all your local data. Are you sure?",
            confirmLabel: "Yes, delete",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    await clearEntries();
                    showMessage({ text: "Local data cleared", type: "info" });
                } catch (e) {
                    console.error("Clear storage error:", e);
                    showMessage({ text: "Error clearing local data", type: "error" });
                }
            }
        });
    };

    const handleFromCloud = async () => {
        await syncFromCloud(user, entries, setEntries, showChoice, showMessage, () =>
            syncToCloud(entries, user, showMessage)
        );
    };

    const handleToCloud = async () => {
        await syncToCloud(entries, user, showMessage);
    };

    const handleLogout = async () => {
        showChoice({
            message: "Do you want to sync your local data to the cloud before logging out?",
            confirmLabel: "Sync and logout",
            cancelLabel: "Just logout",
            onConfirm: async () => {
                await logoutWithOptionalSync(true, logout, entries, user, showMessage);
            },
            onCancel: async () => {
                await logoutWithOptionalSync(false, logout, entries, user, showMessage);
            },
        });
    };

    const handleDeleteAccount = async () => {
        showChoice({
            message: "This will permanently delete your account and all data. Are you sure?",
            confirmLabel: "Delete account",
            cancelLabel: "Cancel",
            onConfirm: async () => {
                try {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/delete`, {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${user}`,
                        },
                    });

                    if (response.ok) {
                        await logout();
                        showMessage({ text: "Account deleted", type: "info" });
                    } else {
                        const data = await response.json();
                        showMessage({ text: data.message || "Failed to delete account", type: "error" });
                    }
                } catch (e) {
                    console.error("Delete account error:", e);
                    showMessage({ text: "Network error during deletion", type: "error" });
                }
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            {!user ? (
                <>
                    <Pressable className="p-4 border-b border-cgray/30" onPress={() => router.navigate('/account/login')}>
                        <Text className="text-cwhite">Login</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray/30" onPress={() => router.navigate('/account/register')}>
                        <Text className="text-cwhite">Register</Text>
                    </Pressable>
                </>
            ) : (
                <>
                    <Pressable className="p-4 border-b border-cgray/30" onPress={handleLogout}>
                        <Text className="text-cwhite">Logout</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray/30" onPress={handleFromCloud}>
                        <Text className="text-cwhite">Sync from cloud</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray/30" onPress={handleToCloud}>
                        <Text className="text-cwhite">Sync to cloud</Text>
                    </Pressable>

                    <Pressable className="p-4 border-b border-cgray/30" onPress={handleDeleteAccount}>
                        <Text className="text-quinary">Delete account and all data</Text>
                    </Pressable>
                </>
            )}
            <Pressable className="p-4 border-b border-cgray/30" onPress={handleClearStorage}>
                <Text className="text-quinary">Clear all local data</Text>
            </Pressable>
        </SafeAreaView>
    );
}