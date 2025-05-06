import Entry from "@/types/entry";
import {saveEntriesToStorage} from "@/asyncStorageAccess/storage";

export const syncFromCloud = async (
    user: string | null,
    entries: Entry[],
    setEntries: (data: Entry[]) => void,
    showChoice: (options: {
        message: string;
        confirmLabel: string;
        cancelLabel: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }) => void,
    showMessage: (msg: { text: string; type: "info" | "error" }) => void,
    syncToCloud: () => Promise<void>
) => {
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sync`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage({ text: data.message || "Unexpected error, please try again later", type: "error" });
            return;
        }

        if (!data || data.length === 0) {
            showMessage({ text: "No data in the cloud", type: "info" });
            return;
        }

        if (entries && entries.length > 0) {
            showChoice({
                message: "Data conflict: which data should be prioritized?",
                confirmLabel: "Use cloud data",
                cancelLabel: "Use local data",
                onConfirm: async () => {
                    setEntries(data);
                    await saveEntriesToStorage(data)
                    showMessage({ text: "Cloud data synced", type: "info" });
                },
                onCancel: async () => {
                    await syncToCloud();
                    showMessage({ text: "Local data synced to cloud", type: "info" });
                },
            });
        } else {
            setEntries(data);
            await saveEntriesToStorage(data)
            showMessage({ text: "Data synced from cloud", type: "info" });
        }
    } catch (e) {
        console.error(e);
        showMessage({ text: "Network error while syncing from cloud", type: "error" });
    }
};

export const syncToCloud = async (
    entries: Entry[],
    user: string | null,
    showMessage: (msg: { text: string; type: "info" | "error" }) => void
) => {
    if (entries.length === 0) {
        showMessage({ text: "No local data to sync", type: "error" });
        return;
    }
    try {
        // console.log("Syncing to cloud", JSON.stringify(entries));
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sync`, {
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

export const logoutWithOptionalSync = async (
    syncFirst: boolean,
    logout: () => Promise<void>,
    entries: Entry[],
    user: string | null,
    showMessage: (msg: { text: string; type: "info" | "error" }) => void
) => {
    try {
        if (syncFirst) {
            await syncToCloud(entries, user, showMessage);
        }

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${user}`,
            },
        });

        if (!response.ok) {
            const data = await response.json();
            console.error("Server logout error:", data.message);
        }
    } catch (error) {
        console.error("Network server logout error:", error);
    }

    try {
        await logout();
        showMessage({ text: "Logged out successfully", type: "info" });
    } catch (e) {
        console.error("Logout error:", e);
        showMessage({ text: "Error logging out", type: "error" });
    }
};
