import { useEffect, useState } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import {checkDates, supabase} from '@/lib/supabase';
import Icon from '../components/Icon';

interface Dates {
    met_date: string;
    start_dating: string;
}

export default function RoomScreen() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const { user } = useUser();
    const [dates, setDates] = useState<Dates | null>(null);
    const [daysSinceMet, setDaysSinceMet] = useState(0)
    const [daysSinceStarted, setDaysSinceStarted] = useState(0)
    const [loading, setLoading] = useState(true);


    const handleLeaveRoom = () => {
        router.replace('/connect');
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
            console.log('loading:', loading);
            console.log('Dates:', Dates);
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
                    <Icon iconSource={require('@/assets/icons/travel.png')} label="Travel Bucket"/>
                    <Icon iconSource={require('@/assets/icons/review.png')} label="Partner Says"/>
                    <Icon iconSource={require('@/assets/icons/dates.png')} label="The Dates"/>
                </View>
                <View className="flex-row justify-center items-center mb-8">
                    <Icon iconSource={require('@/assets/icons/travel.png')} label="Explore"/>
                    <Icon iconSource={require('@/assets/icons/review.png')} label="Memories"/>
                    <Icon iconSource={require('@/assets/icons/dates.png')} label="Food Baby"/>
                </View>

                {/* Date Section - Middle */}
                <View className="mb-8">
                    <View className="flex-row items-baseline pl-10">
                        <Text className="text-4xl text-white font-artistic opacity-70">Met </Text>
                        <Text className="text-8xl text-white font-artistic">{daysSinceMet}</Text>
                        <Text className="text-4xl text-white font-artistic opacity-70"> days ago</Text>
                    </View>
                    <View className="flex-row items-baseline pl-30 -mt-6">
                        <Text className="text-4xl text-white font-artistic opacity-70">Dated for </Text>
                        <Text className="text-8xl text-white font-artistic">{daysSinceStarted}</Text>
                        <Text className="text-4xl text-white font-artistic "> days</Text>
                    </View>
                </View>

                {/* Button Section - Bottom */}
                <TouchableOpacity className="auth-button mx-5 absolute bottom-20 left-10" onPress={handleLeaveRoom}>
                    <Text className="text-white text-center">Leave Room</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
        };