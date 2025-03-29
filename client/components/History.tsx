import {View, Text, FlatList, Pressable} from "react-native";
import Entry from "@/types/entry";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "@/utils/colors";
import {useEntries} from "@/context/EntriesContext";

export default function History() {

    const {deleteEntry, entries} = useEntries();


    const handleDeleteEntry = async (date: string) => {
        try {
            await deleteEntry(date)
        } catch (e) {
            console.error("Delete error", e);
        }
    }


    return (
        <View className="bg-primary border-4 border-quaternary p-4 flex-1 w-[80%]">
            <FlatList
                data={entries}
                renderItem={
                ({item}) => (
                    <View className="flex-row justify-between items-center p-2">
                        <Text className="text-cwhite">
                            {item.date}
                        </Text>
                        <Text className="text-cwhite">
                            {item.value}
                        </Text>
                        <Pressable onPress={() => handleDeleteEntry(item.date)}>
                            <Ionicons name="trash" color={COLORS.quaternary}
                                      size={24}/>
                        </Pressable>

                    </View>
                )
            }
                keyExtractor={(item) => item.date.toString()
            }/>
        </View>
    );
}
