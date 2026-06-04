// app/room/[roomName]/partner-says/index.tsx
import { View, Text, ImageBackground, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, usePathname } from 'expo-router';
import { ReturnButton } from "@/app/components/returnButton";
import { useEffect, useState } from 'react';
import { getReviewByDate, updateReviewByDate } from '@/lib/supabase';

export default function PartnerSaysEdit() {
    const [reviewData, setReviewData] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const pathname = usePathname();
    const match = pathname.match(/\/room\/([^\/]+)\/partner-says\/([^\/]+)\/([^\/]+)/);
    const roomName = match ? decodeURIComponent(match[1]) : '';
    const date = match ? decodeURIComponent(match[2]) : '';
    const identity = match ? decodeURIComponent(match[3]) : '';

    console.log('PartnerSaysDetail pathname:', pathname);
    console.log('PartnerSaysDetail identity:', identity);

    useEffect(() => {
        const fetchData = async () => {
            if (!roomName || !date) {
                setLoading(false);
                return;
            }

            try {
                const data = await getReviewByDate(roomName, date);
                if (data && data[0]) {
                    if (identity === 'creator') {
                        setReviewData(data[0]?.creator_content || '');
                    } else if (identity === 'joiner') {
                        setReviewData(data[0]?.joiner_content || '');
                    } else {
                        setReviewData('');
                    }
                } else {
                    // No existing data, start with empty
                    setReviewData('');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomName, date, identity]);

    const handleSubmit = async () => {
        if (!reviewData.trim()) {
            Alert.alert('Error', 'Please enter some content');
            return;
        }

        setSubmitting(true);
        try {
            await updateReviewByDate(roomName, date, reviewData, identity);

            Alert.alert(
                'Success',
                'Your response has been saved!',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error saving data:', error);
            Alert.alert('Error', 'Failed to save your response');
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/partner-says.png')}
                className="flex-1 w-full h-full"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text className="text-white text-center mt-2">Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require('@/assets/images/partner-says.png')}
            className="flex-1 w-full h-full"
            resizeMode="cover"
        >
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white text-center font-bold text-[20px] mb-5">
                    {date}
                </Text>

                <View className="h-px bg-white mb-3 w-full" />

                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="bg-red px-4 py-2">
                        <Text className="text-white text-[18px]">
                            I feel that ...
                        </Text>
                    </View>
                    <TextInput
                        className="bg-white/10 rounded-lg p-4 text-white text-[17px]"
                        placeholder="Write how you feel about your partner in the past 2 weeks..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={reviewData}
                        onChangeText={setReviewData}
                        multiline
                        textAlignVertical="top"
                        editable={!submitting}
                    />
                </View>

                <View className="flex-row justify-center gap-4 mt-4">
                    <TouchableOpacity
                        className="py-2 px-6 rounded-lg bg-white/20"
                        onPress={() => router.back()}
                        disabled={submitting}
                    >
                        <Text className="text-white text-center text-[16px]">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`py-2 px-6 rounded-lg ${submitting ? 'bg-gray-500' : 'bg-red'}`}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="text-white text-center text-[16px] font-semibold">
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
}