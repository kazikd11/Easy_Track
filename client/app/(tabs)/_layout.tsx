import {Tabs} from 'expo-router';
import COLORS from '@/utils/colors';
import TabIcon from "@/components/TabIcon";
import {useState} from "react";
import Entry from "@/types/entry";

export default function Layout() {

    const [entries, setEntries] = useState<Entry[]>([]);

    return (
        <Tabs
        screenOptions={
            {

                tabBarStyle: {
                    backgroundColor: COLORS.cblack,
                    borderTopWidth: 0,
                    height: 50,
                },
                tabBarShowLabel: false,
                tabBarLabelPosition: 'beside-icon',
            }
        }
        >
            <Tabs.Screen
                name="stats"
                options={{
                    headerShown: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} name="analytics"/>
                    ),
                }}/>
            <Tabs.Screen
                name="index"
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