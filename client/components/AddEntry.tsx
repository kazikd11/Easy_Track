import {View, Text, TextInput, Pressable, Button} from "react-native";
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Entry from "@/types/entry";

export default function AddEntry({saveEntry}: { saveEntry: (entry: Entry) => Promise<void> }) {

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [value, setValue] = useState("50");

    const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (event.type == "set" && selectedDate) {
            setDate(selectedDate);
        } else {
            toggleDatePicker()
        }
    }

    const handleConfirm = async () => {
        const entry: Entry = {
            date: date.toISOString().split("T")[0],
            value: parseFloat(value)
        }
        console.log(entry);
        try {
            await saveEntry(entry);
        } catch (e) {
            console.error("Save error: ", e);
        }
    }

    const toggleDatePicker = () => {
        setShow(x => !x);
    }

    const handleValueChange = (inputValue: string) => {
        const regex = /^\d{0,3}(\.\d{0,2})?$/;

        if (regex.test(inputValue)) {
            setValue(inputValue);
        }
    };


    const clearStorage = async () => {
        try {
            await AsyncStorage.clear();
            console.log('AsyncStorage cleared');
        } catch (error) {
            console.error('Error cleaning AsyncStorage: ', error);
        }
    };

    useEffect(() => {
        clearStorage().then();
    }, [])

    return (
        <View className="rounded-lg  border-4 border-blacka w-[80%] justify-center items-center">
            <Text className="w-full bg-cblack text-cwhite p-2 text-xl">Add Entry</Text>
            <View className="justify-center items-center w-full h-20">
                <TextInput value={value} inputMode="decimal" keyboardType="decimal-pad" onChangeText={handleValueChange}
                           className="text-cwhite w-full"/>
                <Pressable className=" h-10 w-full " onPress={toggleDatePicker}>
                    {show && <DateTimePicker mode="date" display="spinner" value={date} onChange={onChange}
                                             themeVariant="dark"/>}
                    <TextInput className="text-cwhite" editable={false} value={date.toLocaleDateString()}/>
                </Pressable>
            </View>
            <Pressable onPress={handleConfirm}><Text className="text-quaternary text-3xl">Confirm</Text></Pressable>
        </View>
    );
}