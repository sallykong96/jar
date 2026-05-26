import { Text, View } from "react-native";
import React from 'react'
import {Link} from "expo-router";

const SignUp = () => {
    return (
        <View className="flex-1 items-center justify-center bg-primary">
            <Link href="/(auth)/sign-up">Sign up here</Link>
        </View>
    );
}
export default SignUp