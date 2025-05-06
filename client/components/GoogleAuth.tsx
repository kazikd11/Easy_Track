import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {useEffect} from 'react';
import {Button} from 'react-native';
import {router} from "expo-router";
import {useAuth} from "@/context/AuthContext";
import {usePopup} from "@/context/PopupContext";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const {login} = useAuth();
    const {showMessage} = usePopup();
    const [request, response, promptAsync] = Google.useAuthRequest({
        redirectUri: 'https://auth.expo.io/@kazikd11/Easy_Track/',
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
    });
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
        <Button
            title="Login with Google"
            onPress={() => promptAsync()}
        />
    );
}