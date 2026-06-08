import { useEffect, useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {checkDates, deleteUserCurrentRoom} from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import Icon from '../../components/Icon';

interface Dates {
    met_date: string;
    start_dating: string;
}

export default function RoomScreen() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [dates, setDates] = useState<Dates | null>(null);
    const [daysSinceMet, setDaysSinceMet] = useState(0)
    const [daysSinceStarted, setDaysSinceStarted] = useState(0)
    const [loading, setLoading] = useState(true);

    const { user } = useUser();
    const userId = user?.id;
    const handleLeaveRoom = async () => {
        if (!userId) {
            Alert.alert('Error', 'User not found');
            return;
        }

        try {
            await deleteUserCurrentRoom(userId);

            // Navigate back to connect screen
            router.replace('/connect');
        } catch (error) {
            console.error('Error leaving room:', error);
            Alert.alert('Error', 'Failed to leave room');
        }
    };

    useEffect(() => {
        if (roomName) {
            fetchDates();
        }
    }, [roomName]);

    useEffect(() => {
        if (dates) {
            calculateDays();
        }
    }, [dates]);

    const fetchDates = async () => {
        try {
            setLoading(true);
            const Dates = await checkDates(roomName)
            setDates(Dates);
        } catch (err: any) {
            console.error('Error fetching dates:', err);
            Alert.alert('Error', 'Failed to load room data');
        } finally {
            setLoading(false);
        }
    }

    const calculateDaysFromToday = (dateString: string): number => {
        const targetDate = new Date(dateString);
        const today = new Date();
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0)
        const diffTime = today.getTime() - targetDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    const calculateDays = () => {
        if (dates?.met_date) {
            const days = calculateDaysFromToday(dates.met_date);
            setDaysSinceMet(days);
        }

        if (dates?.start_dating) {
            const days = calculateDaysFromToday(dates.start_dating);
            setDaysSinceStarted(days);
        }
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

    return (
        <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">

            <View className="flex-1 mt-40">
                {/* Icons Section */}
                <View className="flex-row justify-center items-center mb-8">
                    <Icon iconSource={require('@/assets/icons/plane.png')} label="travel-bucket" title='Travel Bucket'/>
                    <Icon iconSource={require('@/assets/icons/chat.png')} label="partner-says" title='Partner Says'/>
                    <Icon iconSource={require('@/assets/icons/anniversary.png')} label="the-dates" title='The Dates'/>
                </View>
                <View className="flex-row justify-center items-center mb-8">
                    <Icon iconSource={require('@/assets/icons/calendar.png')} label="schedule" title='Schedule'/>
                    <Icon iconSource={require('@/assets/icons/save.png')} label="memories" title='Memories'/>
                    <Icon iconSource={require('@/assets/icons/food.png')} label="food-baby" title='Food Baby'/>
                </View>

                {/* Date Section - Middle */}
                <View className="mb-8">
                    <View className="flex-row items-baseline pl-10">
                        <Text className="text-5xl text-white font-artistic opacity-70">Met </Text>
                        <Text className="text-8xl text-white font-artistic">{daysSinceMet}</Text>
                        <Text className="text-5xl text-white font-artistic opacity-70"> days ago</Text>
                    </View>
                    <View className="flex-row items-baseline pl-30 -mt-6">
                        <Text className="text-5xl text-white font-artistic opacity-70">Dated for </Text>
                        <Text className="text-8xl text-white font-artistic">{daysSinceStarted}</Text>
                        <Text className="text-5xl text-white font-artistic "> days</Text>
                    </View>
                </View>

                {/* Button Section - Bottom */}
                <TouchableOpacity className="rec-button mx-5 absolute bottom-20 left-5" onPress={handleLeaveRoom}>
                    <Text className="text-white text-center text-[16px]">Leave Room</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
        };