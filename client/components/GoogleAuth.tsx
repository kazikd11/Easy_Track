import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {useEffect} from 'react';
import {Text, Pressable} from 'react-native';
import {router} from "expo-router";
import {useAuth} from "@/context/AuthContext";
import {usePopup} from "@/context/PopupContext";
import { makeRedirectUri } from 'expo-auth-session';


WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {

    const redirectUri = makeRedirectUri({
        native: 'com.kazikd11.easytrack://redirect'
    });

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
    const androidClientId = process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID;
    const {login} = useAuth();
    const {showMessage} = usePopup();
    const [request, response, promptAsync] = Google.useAuthRequest({
        redirectUri,
        androidClientId: androidClientId,
        // clientId: webClientId,
        scopes: ['openid', 'profile', 'email'],
    });

    console.log("ANDROID_CLIENT_ID:", androidClientId);

    useEffect(() => {
        const handleResponse = async () => {
            if (response?.type === 'success') {
                const {authentication} = response;
                try {
                    const response = await fetch(`http://${apiUrl}/auth/google`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({token: authentication?.accessToken}),
                    })
                    const data = await response.json();
                    if (response.ok && data.jwtToken && data.refreshToken) {
                        await login(data.jwtToken, data.refreshToken);
                        showMessage({ text: "Login successful!", type: "info" })
                        router.back()
                    } else {
                        showMessage({ text: data.message || "Unexpected error, please try again later", type: "error" });
                    }
                } catch (e) {
                    showMessage({ text: "Network error, please try again later", type: "error" });
                    console.error(e);
                }

                console.log(authentication?.accessToken);
            }
        }
        handleResponse().then()
    }, [response]);

    return (
        <Pressable
            className="p-4 border-b border-cgray/30"
            onPress={() => {
                promptAsync();
                // showMessage({ text: "Feature disabled right now", type: "info" });
            }}
        >
            <Text className="color-cgray">Login with Google</Text>
        </Pressable>
    );
}