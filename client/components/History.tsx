import {View, Text, ScrollView, FlatList} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";
import Entry from "@/types/entry";

export default function History({entries}: { entries: Entry[] }) {



    return (
        <View className="bg-primary border-4 border-quaternary p-4 flex-1 w-[80%]">
            <FlatList data={entries} renderItem={
                ({item}) => (
                    <View className="flex-row justify-between items-center p-2">
                        <Text className="text-cwhite">{item.date}</Text>
                        <Text className="text-cwhite">{item.value}</Text>
                    </View>
                )
            } keyExtractor={(item) => item.date.toString()
            }/>
        </View>
    );
}