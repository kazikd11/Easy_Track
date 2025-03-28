import {Pressable, Text, TextInput, View} from "react-native";
import DateTimePicker, {DateTimePickerEvent} from '@react-native-community/datetimepicker';
import {useState} from "react";
import Entry from "@/types/entry";
import {useEntries} from "@/context/EntriesContext";

export default function AddEntry() {

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [value, setValue] = useState("50");
    const {saveEntry} = useEntries();

    // sets the date
    const onChange = (event: DateTimePickerEvent, selectedDate: Date | undefined) => {
        if (event.type == "set" && selectedDate) {
            setDate(selectedDate);
        } else {
            toggleDatePicker()
        }
    }

    // shows date picker
    const toggleDatePicker = () => {
        setShow(x => !x);
    }

    //handlers
    const handleConfirm = async () => {
        const entry: Entry = {
            date: date.toISOString().split("T")[0],
            value: parseFloat(value)
        }
        try {
            await saveEntry(entry);
        } catch (e) {
            console.error("Save error: ", e);
        }
    }

    const handleValueChange = (inputValue: string) => {
        const regex = /^\d{0,3}(\.\d{0,2})?$/;

        if (regex.test(inputValue)) {
            setValue(inputValue);
        }
    };


    // clears the AsyncStorage

    // const clearStorage = async () => {
    //     try {
    //         await AsyncStorage.clear();
    //         console.log('AsyncStorage cleared');
    //     } catch (error) {
    //         console.error('Error cleaning AsyncStorage: ', error);
    //     }
    // };
    //
    // useEffect(() => {
    //     clearStorage().then();
    // }, [])

    return (
        <View className="rounded-lg  border-4 border-blacka w-[80%] justify-center items-center">
            <Text className="w-full bg-cblack text-cwhite p-2 text-xl">Add Entry</Text>
            <View className="justify-center items-center w-full h-20">
                <TextInput
                    value={value}
                    inputMode="decimal"
                    keyboardType="decimal-pad"
                    onChangeText={handleValueChange}
                    className="text-cwhite w-full"
                />
                <Pressable
                    className=" h-10 w-full "
                    onPress={toggleDatePicker}>
                    {show && <DateTimePicker mode="date"
                                             display="spinner"
                                             value={date}
                                             onChange={onChange}
                                             themeVariant="dark"
                    />}
                    <TextInput
                        className="text-cwhite"
                        editable={false}
                        value={date.toLocaleDateString()}
                    />
                </Pressable>
            </View>
            <Pressable
                onPress={handleConfirm}
            >
                <Text className="text-quaternary text-3xl">Confirm</Text>
            </Pressable>
        </View>
    );
}