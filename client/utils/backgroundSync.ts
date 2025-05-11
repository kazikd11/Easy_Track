import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from "expo-background-fetch";
import {getJwt, getRefreshToken, saveJwt, saveRefreshToken} from "@/asyncStorageAccess/jwt";
import {getEntriesFromStorage} from "@/asyncStorageAccess/storage";
import Entry from "@/types/entry";

const TASK_NAME = "BACKGROUND_SYNC";

TaskManager.defineTask(TASK_NAME, async () => {
    return await runBackgroundLogic();
});



async function runBackgroundLogic() {
    try {
        console.log("Running background task logic");
        const user = await getJwt();
        const entries = await getEntriesFromStorage()
        await refreshToken(user)
        await backGroundSyncToCloud(entries, user)
        return BackgroundFetch.BackgroundFetchResult.NewData
    } catch (e) {
        console.error("Background task error", e);
        return BackgroundFetch.BackgroundFetchResult.Failed
    }
}

async function refreshToken(user: string | null) {
    try {
        const refreshToken = await getRefreshToken()
        if (!refreshToken) {
            throw new Error("No refresh token");
        }
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user}`
            },
            body: JSON.stringify({
                jwtToken: user,
                refreshToken: refreshToken
            }),
        });
        const data = await response.json();
        if(!response.ok) {
            console.error("Server response error", data);
            throw new Error("Failed to server refresh token");
        }
        await saveJwt(data.message);
        console.log("Token refreshed successfully");
    }
    catch (e) {
        console.error("Refresh token error", e);
    }
}

async function backGroundSyncToCloud(entries: Entry[], user: string | null) {
    if (entries.length === 0) {
        return;
    }
    try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user}`,
            },
            body: JSON.stringify(entries),
        });

        const data = await response.json()
        if (response.ok) {
            console.log("Data synced to cloud successfully")
        } else {
            console.log(data.message || "Sync failed")
        }
    } catch (e) {
        console.error(e);
    }
}

export async function registerBackgroundTask() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (!isRegistered) {
        try {
            await BackgroundFetch.registerTaskAsync(TASK_NAME, {
                minimumInterval: 60 * 60 * 24 * 5,
                stopOnTerminate: false,
                startOnBoot: true,
            });
            console.log("Background task registered")
        } catch (err) {
            console.error("Failed to register background task:", err)
        }
    } else {
        console.log("Background task already registered")
    }
}

export async function testBackgroundTask() {
    const result = await runBackgroundLogic()
    console.log("test result:", result);
}