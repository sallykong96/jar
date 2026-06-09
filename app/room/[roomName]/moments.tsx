import {View, Text, ImageBackground, TouchableOpacity, Alert, FlatList} from 'react-native';
import { ReturnButton } from "@/app/components/returnButton";
import {useLocalSearchParams} from "expo-router";
import { useEffect, useState } from "react";
import SquareButton from "@/app/components/squareButton";
import MomentCard from "@/app/components/momentCard";
import AddMomentModal from "@/app/components/addMomentModal";
import {getMoments, supabase} from '@/lib/supabase';

interface Moment {
    id: string;
    title: string;
    description: string;
    image_url: string;
    date: string;
    location: string;
    room_name: string;
}

export default function Moments() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [loading, setLoading] = useState(true);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch moments from database
    const fetchMoments = async () => {
        if (!roomName) return;

        try {
            setLoading(true);
            const momentLists = await getMoments(roomName);
            setMoments(momentLists || []);
        } catch (error) {
            console.error('Error fetching moments:', error);
            Alert.alert('Error', 'Failed to load moments');
        } finally {
            setLoading(false);
        }
    };

    // Add new moment
    const handleAddMoment = async (title: string, description: string, imageUrl: string, date: string, location: string) => {
        try {
            const { error } = await supabase
                .from('moments')
                .insert({
                    room_name: roomName,
                    title: title,
                    description: description,
                    image_url: imageUrl,
                    date: date,
                    location: location,
                });

            if (error) throw error;

            await fetchMoments();
            Alert.alert('Success', 'Moment added successfully!');
        } catch (error) {
            console.error('Error adding moment:', error);
            throw new Error('Failed to add moment');
        }
    };

    // Delete moment
    const handleDeleteMoment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('moments')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchMoments();
            Alert.alert('Success', 'Moment deleted successfully');
        } catch (error) {
            console.error('Error deleting moment:', error);
            Alert.alert('Error', 'Failed to delete moment');
        }
    };

    useEffect(() => {
        fetchMoments();
    }, [roomName]);

    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/moments.png')}
                className="flex-1 w-full h-full"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-center">Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('@/assets/images/moments.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 p-4 mt-25">
                <Text className="text-black mb-4 font-artistic text-[60px] text-center">
                    Little Moments
                </Text>

                <FlatList
                    data={moments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <MomentCard
                            id={item.id}
                            imageUrl={item.image_url}
                            title={item.title}
                            description={item.description}
                            date={item.date}
                            location={item.location}
                            onDelete={handleDeleteMoment}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    ListEmptyComponent={() => (
                        <View className="py-20">
                            <Text className="text-white/60 text-center text-lg">
                                No moments yet. Tap + to add your first memory! 📸
                            </Text>
                        </View>
                    )}
                />

                {/* Add Button */}
                <View className="absolute bottom-20 right-5">
                    <SquareButton
                        iconSource={require('@/assets/icons/plus.png')}
                        onPress={() => setModalVisible(true)}
                    />
                </View>
            </View>

            <AddMomentModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddMoment}
            />

            <ReturnButton />
        </ImageBackground>
    );
}