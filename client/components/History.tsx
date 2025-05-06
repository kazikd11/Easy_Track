import {FlatList, Pressable, Text, View} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "@/utils/colors";
import {useEntries} from "@/context/EntriesContext";
import {usePopup} from "@/context/PopupContext";

export default function History() {
    const {deleteEntry, entries} = useEntries();
    const {showMessage} = usePopup();

    const handleDeleteEntry = async (date: string) => {
        try {
            await deleteEntry(date);
            showMessage({text: "Entry deleted", type: "info"});
        } catch (e) {
            console.error("Delete error", e);
            showMessage({text: "Failed to delete entry", type: "error"});
        }
    };

    return (
        <View className="p-4 flex-1 w-full rounded-lg mt-4">
            <View className="w-full flex-row justify-between mb-3 px-3">
                <Text className="text-cgray font-semibold w-1/3">Date</Text>
                <Text className="text-cgray font-semibold text-center w-1/3">Weight</Text>
                <View className="w-1/3" />
            </View>

            <FlatList
                data={entries}
                keyExtractor={(item) => item.date.toString()}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text className="text-cgray text-center mt-10">No entries yet</Text>
                }
                renderItem={({item, index}) => {
                    const [year, month, day] = item.date.split("T")[0].split("-");

                    return (
                        <View className={`flex-row justify-between items-center px-3 py-3 border-b border-cgray/30`}>
                            <View>
                                <Text className="text-cwhite">{`${day}.${month}`}</Text>
                                <Text className="text-cgray text-xs">{year}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-cwhite">
                                    {typeof item.weight === 'number' ? item.weight.toFixed(2) : '—'}
                                </Text>
                            </View>
                            <Pressable onPress={() => handleDeleteEntry(item.date)} className="p-2">
                                <Ionicons name="trash-outline" color={COLORS.quaternary} size={20} />
                            </Pressable>
                        </View>
                    );
                }}
            />
        </View>
    );
}
