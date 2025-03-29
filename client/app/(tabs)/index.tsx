import {View} from "react-native";
import AddEntry from "@/components/AddEntry";
import History from "@/components/History";

export default function Index() {


    return (
        <View className="bg-primary flex-1 justify-center items-center">
            <AddEntry/>
            <History/>
        </View>
    )
}