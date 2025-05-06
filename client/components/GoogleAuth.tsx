import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {useEffect} from 'react';
import {Button} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth() {

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

    const [request, response, promptAsync] = Google.useAuthRequest({
        redirectUri: 'https://auth.expo.io/@kazikd11/Easy_Track/',
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
    });
    useEffect(() => {
        if (response?.type === 'success') {
            const {authentication} = response;
            fetch(`http://${apiUrl}/auth/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token: authentication?.accessToken}),
            })
                .then(res => res.json())
                .catch(error => console.error(error));
            console.log(authentication?.accessToken);
        }
    }, [response]);

    return (
        <Button
            title="Login with Google"
            onPress={() => promptAsync()}
        />
    );
}