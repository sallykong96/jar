import { router, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {checkUser} from "@/lib/supabase";
import {useState, useEffect, useCallback} from "react";

function RoomBanner() {
    const insets = useSafeAreaInsets();
    const bannerTopPosition = insets.top;
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [ creator, setCreator ] = useState('');
    const [ joiner, setJoiner ] = useState('');

    const fetchData = useCallback(async () => {
        if (roomName) {
            const { creator, joiner } = await checkUser(roomName);
            console.log('creator', creator);
            console.log('joiner', joiner);
            setCreator(creator?.name || '');
            setJoiner(joiner?.name || '');
        }
    }, [roomName]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Refetch data when the screen comes into focus (e.g., after returning from add-partner)
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

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
        <View style={{ flex: 1 }}>
            {isSignedIn && <RoomBanner />}
            <Stack screenOptions={{ headerShown: false }}>
                {/*<Stack.Screen name="/room/[roomName]" />*/}
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        backgroundColor: 'rgba(242, 242, 242, 0.15)', // Pink to match your theme
        paddingHorizontal: 20,
        alignItems: 'center',
        zIndex: 100,
        paddingVertical: 12,
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