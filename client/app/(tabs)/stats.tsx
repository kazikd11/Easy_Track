import {Text, View} from "react-native";
import {CartesianChart} from "victory-native";
import {useState} from "react";
import Entry from "@/types/entry";
import {useFocusEffect} from "expo-router";

export default function Stats() {

    useFocusEffect(() => {
        console.log("Stats screen focused");

    })

    return (
        <View className="bg-primary flex-1 justify-center items-center"
        >
            {/*<CartesianChart data={} xKey={} yKeys={}></CartesianChart>*/}

        </View>
    );
}
