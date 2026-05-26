import { Text, View } from "react-native";
import React from 'react'

const SignIn = () => {
    return (
        <View className="flex-1 items-center justify-center bg-background">
            <Text>Sign In</Text>
            <Link href="/(auth)/sign-up">Create Account</Link>
        </View>
    );
}
export default SignIn