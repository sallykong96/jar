import { SplashScreen, Stack, router, useSegments } from 'expo-router';
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

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

// This component handles routing based on auth state
function RootLayoutNav() {
    const { isSignedIn, isLoaded } = useAuth();
    const segments = useSegments();

    useEffect(() => {
        if (!isLoaded) return;

        const inHomeGroup = segments[0] === '(home)';

        // Only redirect if needed - prevent loops by checking current location
        if (isSignedIn && !inHomeGroup) {
            // Signed in but not in home group → go home
            router.replace('/(home)');
        } else if (!isSignedIn && inHomeGroup) {
            // Not signed in but in home group → go to auth
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
            <Stack.Screen name="(home)" />
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