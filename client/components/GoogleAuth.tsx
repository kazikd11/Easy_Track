import * as WebBrowser from 'expo-web-browser';
import {useEffect} from 'react';
import {Text, Pressable} from 'react-native';
import {useAuth} from "@/context/AuthContext";
import {usePopup} from "@/context/PopupContext";
import {GoogleSignin} from "@react-native-google-signin/google-signin";


WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {

    const {login} = useAuth();
    const {showMessage} = usePopup();

    // useEffect(() => {
    //     GoogleSignin.configure({
    //         scopes: ['email', 'profile'],
    //         webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    //         offlineAccess: false,
    //         iosClientId: '',
    //     });
    // }, []);
    //
    // const handleGoogleSignIn = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    //
    //         const userInfo = await GoogleSignin.signIn();
    //         const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/google`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ token: userInfo.data?.idToken }),
    //         });
    //
    //         const data = await response.json();
    //
    //         if (response.ok) {
    //             await login(data.jwtToken, data.refreshToken);
    //             showMessage({ text: "Login successful!", type: "info" });
    //         } else {
    //             showMessage({ text: data.message || "Login failed", type: "error" });
    //         }
    //     } catch (e) {
    //         showMessage({ text: "Google Sign-In failed", type: "error" });
    //     }
    // }

    return (
        <Pressable
            className="p-4 border-b border-cgray/30"
            onPress={() => {
                // handleGoogleSignIn()
                showMessage({ text: "Feature disabled right now", type: "info" });
            }}
        >
            <Text className="color-cgray">Login with Google</Text>
        </Pressable>
    );
}