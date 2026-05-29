import { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';

interface RoomData {
    id: number;
    room: string;
    room_name: string;
    user1: number;
    user2: number;
    created_at: string;
    user1_data?: {
        id: number;
        name: string;
        email: string;
        clerk_id: string;
    };
    user2_data?: {
        id: number;
        name: string;
        email: string;
        clerk_id: string;
    };
}

export default function RoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // id is the UUID from the URL
    const { user } = useUser();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [loading, setLoading] = useState(true);
    const [otherUser, setOtherUser] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchRoomData();
            subscribeToRoomUpdates();
        }
    }, [id]);

    const fetchRoomData = async () => {
        try {
            // Fetch room details with user data
            const { data, error } = await supabase
                .from('connections')
                .select(`
                    *,
                    user1_data:users!user1(id, name, email, clerk_id),
                    user2_data:users!user2(id, name, email, clerk_id)
                `)
                .eq('room', id)  // Query by the UUID from URL
                .single();

            if (error) throw error;

            setRoomData(data);

            // Determine the other user in the room
            const currentUserNumericId = await getCurrentUserNumericId();
            const other = data.user1 === currentUserNumericId ? data.user2_data : data.user1_data;
            setOtherUser(other);

        } catch (error) {
            console.error('Error fetching room:', error);
            Alert.alert('Error', 'Failed to load room data');
            router.replace('/'); // Go back home if room not found
        } finally {
            setLoading(false);
        }
    };

    const getCurrentUserNumericId = async () => {
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', user?.id)
            .single();
        return data?.id;
    };

    const subscribeToRoomUpdates = () => {
        // Subscribe to real-time changes for this specific room
        const subscription = supabase
            .channel(`room-${id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'connections',
                    filter: `room=eq.${id}`,
                },
                (payload) => {
                    console.log('Room updated:', payload);
                    fetchRoomData(); // Refresh data on changes
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    const handleLeaveRoom = () => {
        router.replace('/');
    };

    if (loading) {
        return (
            <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4">Loading room...</Text>
                </View>
            </ImageBackground>
        );
    }

    if (!roomData) {
        return (
            <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-xl">Room not found</Text>
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <Text className="text-blue-400 mt-4">Go back home</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 p-5">
                {/* Header */}
                <View className="mt-12 mb-5">
                    <Text className="text-4xl text-white font-artistic text-center">
                        {roomData.room_name}
                    </Text>
                    <Text className="text-white text-center opacity-80 mt-2">
                        Room ID: {roomData.room.substring(0, 8)}...
                    </Text>
                </View>

                {/* Other user info */}
                {otherUser && (
                    <View className="bg-white/10 rounded-lg p-4 mb-5">
                        <Text className="text-white text-lg mb-2">Connected with:</Text>
                        <Text className="text-white text-2xl font-semibold">
                            {otherUser.name || otherUser.email}
                        </Text>
                    </View>
                )}

                {/* Chat area - you can add messaging here */}
                <View className="flex-1 bg-white/5 rounded-lg p-4">
                    <Text className="text-white text-center">
                        Chat functionality will go here
                    </Text>
                </View>

                {/* Leave button */}
                <TouchableOpacity
                    className="bg-red-500 p-3 rounded-lg mt-5 mb-10"
                    onPress={handleLeaveRoom}
                >
                    <Text className="text-white text-center font-semibold">Leave Room</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}