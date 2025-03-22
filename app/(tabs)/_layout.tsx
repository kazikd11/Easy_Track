import {Tabs} from 'expo-router';

export default function Layout() {
    return (
        <Tabs
        screenOptions={
            {
                tabBarStyle: {
                    backgroundColor: '#0D0D0D',
                    borderTopColor: '#0D0D0D',
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: '#FFFFFF',
                tabBarShowLabel: false,
            }
        }
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                }}/>
            <Tabs.Screen
                name="user"
                options={{
                    headerShown: false,
                }}/>
        </Tabs>
    );
}