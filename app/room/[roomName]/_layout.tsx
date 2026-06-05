import { router, Stack, useLocalSearchParams, useFocusEffect, usePathname } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {checkUser} from "@/lib/supabase";
import {useState, useEffect, useCallback} from "react";
import {GestureHandlerRootView} from "react-native-gesture-handler";

function RoomBanner() {
    const insets = useSafeAreaInsets();
    const bannerTopPosition = insets.top;
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const pathname = usePathname(); // Get current path
    const [ creator, setCreator ] = useState('');
    const [ joiner, setJoiner ] = useState('');

    const fetchData = useCallback(async () => {
        if (roomName) {
            const { creator, joiner } = await checkUser(roomName);
            setCreator(creator?.name || '');
            setJoiner(joiner?.name || '');
        }
    }, [roomName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Only show banner on index screen
    const isIndexScreen = pathname === `/room/${roomName}` || pathname.endsWith('/index');

    if (!isIndexScreen) {
        return null;
    }

    return (
        <View style={[styles.banner, { top: bannerTopPosition }]} className="w-full">
            <TouchableOpacity
                onPress={(!creator || !joiner) ? () => {router.push(`/room/${roomName}/add-partner`)} : undefined}
            >
                <Text style={styles.bannerText}>
                    {!creator || !joiner ? 'Add a partner to the room!' : `${creator} ♡ ${joiner}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default function RoomLayout() {
    const { isSignedIn } = useAuth();
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
            {isSignedIn && <RoomBanner />}
            <Stack screenOptions={{ headerShown: false }}>
                {/*<Stack.Screen name="/room/[roomName]" />*/}
            </Stack>
        </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        backgroundColor: 'rgba(242, 242, 242, 0.15)',
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 100,
        paddingVertical: 8,
    },
    bannerText: {
        color: '#696969',
        fontSize: 18,
    },
    bannerButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});