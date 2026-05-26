import "@/global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router";

export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Text className="text-xl font-bold text-blue-500">
                Welcome to Nativewind!
            </Text>
            <Link href="/(auth)/sign-in" className="bg-button">Login</Link>
            <Link href="/(auth)/sign-up" className="bg-button">Sign Up</Link>

        </View>
    );
}