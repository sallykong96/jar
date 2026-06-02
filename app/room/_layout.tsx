import {Stack, useLocalSearchParams} from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {checkUser} from "@/lib/supabase";
import {useState, useEffect} from "react";

function RoomBanner() {
    const insets = useSafeAreaInsets();
    const bannerTopPosition = insets.top;
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [ creator, setCreator ] = useState('');
    const [ joiner, setJoiner ] = useState('');
    useEffect(() => {
        if (roomName) {
            fetchData();
        }
    }, [roomName]);

    const fetchData = async () => {
        const { creator, joiner } = await checkUser(roomName);
        setCreator(creator?.name || '');
        setJoiner(joiner?.name || '')
    }

    return (
        <View style={[styles.banner, { top: bannerTopPosition }]} className="w-full">
            <TouchableOpacity
                onPress={(!creator || !joiner) ? () => {
                    console.log('Add partner pressed');
                    // Navigate to add partner screen
                    // router.push('/add-partner');
                } : undefined}
                activeOpacity={(!creator || !joiner) ? 0.7 : 1}
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

    // Only show banner if user is signed in (which they will be in rooms)
    return (
        <View style={{ flex: 1 }}>
            {isSignedIn && <RoomBanner />}
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="[name]" />
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