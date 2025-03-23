import {Tabs} from 'expo-router';
import COLORS from '@/utils/colors';
import TabIcon from "@/components/TabIcon";

export default function Layout() {
    return (
        <Tabs
        screenOptions={
            {

                tabBarStyle: {
                    backgroundColor: COLORS.black,
                    borderTopWidth: 0,
                    height: 50,
                },
                tabBarShowLabel: false,
                tabBarLabelPosition: 'beside-icon',
            }
        }
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} name="analytics"/>
                    ),

                }}/>
            <Tabs.Screen
                name="add"
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} name="add"/>
                    ),
                }}/>
            <Tabs.Screen
                name="user"
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} name="person-circle-outline"/>
                    ),
                }}/>
        </Tabs>
    );
}