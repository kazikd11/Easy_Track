import {Keyboard, Pressable, Text, TextInput, View} from "react-native";
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useEffect, useState} from "react";
import Entry from "@/types/entry";
import {useEntries} from "@/context/EntriesContext";
import {usePopup} from "@/context/PopupContext";

export default function AddEntry() {

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const {saveEntry,entries} = useEntries();
    const [value, setValue] = useState("");

    const {showMessage} = usePopup();

    useEffect(() => {
        setValue(entries.length > 0 ? entries[0].weight.toString() : "");
    },[])

    // sets the date
    const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (event.type == "set" && selectedDate) {
            setDate(selectedDate);
        }
        setShow(false);
    }

    // shows date picker
    const toggleDatePicker = () => {
        setShow(x => !x);
    }

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    //handlers
    const handleConfirm = async () => {
        Keyboard.dismiss();
        if (!value || parseFloat(value) <= 0) {
            showMessage({ text: "Please enter a proper value", type: "error" });
            return;
        }
        const entry: Entry = {
            date: formatDate(date),
            weight: parseFloat(value)
        };
        try {
            await saveEntry(entry);
            showMessage({ text: `Entry saved`, type: "info" });
        } catch (e : any) {
            console.error("Save error: ", e);
            showMessage({ text: e?.message || "Failed to save entry", type: "error" });
        }
    };


    const handleValueChange = (inputValue: string) => {
        const regex = /^\d{0,3}(\.\d{0,2})?$/;

        if (regex.test(inputValue)) {
            setValue(inputValue);
        }
    };

    return (
        <View className="rounded-lg w-[80%] justify-center items-center mt-12  border-cgray border-2  pt-1 pl-1">
            <View className="justify-center items-center w-full h-20">

                <View className="w-full h-12 flex-row justify-between items-center pr-3 pl-1">
                    <TextInput
                        value={value}
                        inputMode="decimal"
                        keyboardType="decimal-pad"
                        onChangeText={handleValueChange}
                        className="text-cwhite w-[80%]"/>

                    <Text className="text-cgray text-xs">weight</Text>
                </View>
                <Pressable
                    className=" h-10 w-full pr-3 pl-1 "
                    onPress={toggleDatePicker}>
                    {show && <DateTimePicker mode="date"
                                             display="spinner"
                                             value={date}
                                             onChange={onChange}
                                             themeVariant="dark"
                    />}
                    <View className="w-full flex-row justify-between items-center">
                        <TextInput
                            className={date.toDateString() === new Date().toDateString() ? "text-cgray" : "text-cwhite"}
                            editable={false}
                            value={date.toLocaleDateString()}
                        />
                        <Text className="text-cgray text-xs">date</Text>
                    </View>
                </Pressable>
            </View>
            <Pressable
                onPress={handleConfirm}
                className="pb-2"
            >
                <Text className="text-quaternary text-3xl">Add Entry</Text>
            </Pressable>
        </View>
    );
}