import { SplashScreen, Stack, router, useSegments } from 'expo-router';
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import AddPartner from "@/app/room/[roomName]/add-partner";

const tokenCache = {
    async getToken(key: string) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (err) {
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            return await SecureStore.setItemAsync(key, value);
        } catch (err) {
            return;
        }
    }
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
}


function RootLayoutNav() {
    const { isSignedIn, isLoaded } = useAuth();
    const segments = useSegments();

    useEffect(() => {
        if (!isLoaded) return;
        const inHomePage = !segments[0]; // inHomePage = logged in but not entered room

        console.log('segments:',segments);
        console.log('isLoaded:',isLoaded);
        console.log('isSignedIn:',isSignedIn);
        console.log('inHomeGroup:',inHomePage);

        if (isSignedIn && inHomePage) {
            router.replace('/connect');
        } else if (!isSignedIn && inHomePage) {
            router.replace('/');
        }
    }, [isSignedIn, isLoaded, segments]);

    if (!isLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="connect" />
            <Stack.Screen name="[roomName]" />
            <Stack.Screen name="[roomName]/add-partner" />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        'tangerine-regular': require('../assets/fonts/tangerine-regular.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            tokenCache={tokenCache}
            afterSignOutUrl="/"
        >
            <ClerkLoaded>
                <RootLayoutNav />
            </ClerkLoaded>
        </ClerkProvider>
    );
}