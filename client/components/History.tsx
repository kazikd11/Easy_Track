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
            showMessage({ text: "Entry deleted", type: "info" });
        } catch (e) {
            console.error("Delete error", e);
            showMessage({ text: "Failed to delete entry", type: "error" });
        }
    };


    return (
        <View className=" p-4 flex-1 w-full rounded-lg mt-4">
            <View className="w-full flex-row justify-between mb-6 ml-1.5">
                <Text className="text-cwhite text-xl ">Date</Text>
                <Text className="text-cwhite text-xl ml-3">Weight</Text>
                <Text className="text-quaternary text-xl ml-0.5">Delete</Text>
            </View>
            <FlatList
                data={entries}
                showsVerticalScrollIndicator={false}
                renderItem={
                    ({item}) => {
                        const [year, month, day] = item.date.split("T")[0].split("-");

                        return (
                            <View className="flex-row justify-between items-center p-2">
                                <View>
                                    <Text className="text-cwhite">
                                        {`${day}.${month}`}
                                    </Text>
                                    <Text className="text-cgray">
                                        {year}
                                    </Text>
                                </View>
                                <Text className="text-cwhite ml-2">
                                    {typeof item.weight === 'number' ? item.weight.toFixed(2) : '—'}
                                </Text>
                                <Pressable onPress={() => handleDeleteEntry(item.date)} className="pl-5 p-1">
                                    <Ionicons name="trash" color={COLORS.quaternary}
                                              size={16}/>
                                </Pressable>

                            </View>
                        )
                    }
                }
                keyExtractor={(item) => item.date.toString()
                }/>
        </View>
    );
}
