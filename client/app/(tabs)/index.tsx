import {View} from "react-native";
import AddEntry from "@/components/AddEntry";
import History from "@/components/History";

export default function Index() {


    return (
        <View className="bg-primary flex-1 items-center">
            <View className="h-[50%] w-[90%] mt-8">
                <History/>
            </View>
            <AddEntry/>
        </View>
    )
}