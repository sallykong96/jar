import { Text, View } from "react-native";
import React from 'react'
import {Link} from "expo-router";

const SignIn = () => {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Link href="/(auth)/sign-up">Review</Link>
        </View>
    );
}
export default SignIn