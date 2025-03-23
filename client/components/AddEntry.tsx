import {View, Text, TextInput} from "react-native";

export default function AddEntry(){


    return (
        <View className="rounded-lg  border-2 border-blacka width-80 justify-center items-center">
            <Text className="w-full bg-blacka">Add Entry</Text>
            <View className="justify-center items-center ">
                <TextInput placeholder="50" inputMode="decimal" keyboardType="decimal-pad"></TextInput>
                <TextInput></TextInput>
            </View>
        </View>
    );
}