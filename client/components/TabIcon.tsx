import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "@/utils/colors";

export default function TabIcon({ focused, name }: { focused?: boolean, name: keyof typeof Ionicons.glyphMap }) {
    return (
        <Ionicons
            name={name}
            size={24}
            color={focused ? COLORS.quaternary : COLORS.white}
        />
    );
}