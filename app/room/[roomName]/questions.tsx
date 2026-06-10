// app/questions.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ImageBackground
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import ReturnButton from "@/app/components/returnButton";

interface Question {
    id: number;
    question: string;
    status: string;
}

export default function QuestionsScreen() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [shuffling, setShuffling] = useState(false);

    useEffect(() => {
        fetchRandomQuestion(true); // Initial load shows loading spinner
    }, []);

    const fetchRandomQuestion = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setLoading(true);
            }

            // Fetch a random active question
            const { data, error } = await supabase
                .from('questions')
                .select('id, question, status')
                .eq('status', 'active')
                .order('id');

            if (error) throw error;

            if (data && data.length > 0) {
                // Select random question from active ones
                const randomIndex = Math.floor(Math.random() * data.length);
                setQuestion(data[randomIndex]);
            } else {
                // No active questions left - reset all to active
                await resetAllQuestions();
                await fetchRandomQuestion(isInitialLoad);
            }
        } catch (error) {
            console.error('Error fetching question:', error);
            if (isInitialLoad) {
                Alert.alert('Error', 'Failed to load question');
            }
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            }
        }
    };

    const markAsDiscussed = async () => {
        if (!question) return;

        try {
            setUpdating(true);

            // Update question status to 'done'
            const { error } = await supabase
                .from('questions')
                .update({ status: 'done' })
                .eq('id', question.id);

            if (error) throw error;

            Alert.alert('Great!', 'Question marked as discussed');

            // Fetch next random question without showing loading
            await fetchRandomQuestion(false);
        } catch (error) {
            console.error('Error updating question:', error);
            Alert.alert('Error', 'Failed to update question status');
        } finally {
            setUpdating(false);
        }
    };

    const resetAllQuestions = async () => {
        try {
            // Reset all 'done' questions back to 'active'
            const { error } = await supabase
                .from('questions')
                .update({ status: 'active' })
                .eq('status', 'done');

            if (error) throw error;

            console.log('All questions reset to active');
        } catch (error) {
            console.error('Error resetting questions:', error);
        }
    };

    const shuffleQuestion = async () => {
        if (shuffling) return; // Prevent multiple shuffles

        setShuffling(true);
        await fetchRandomQuestion(false);
        setShuffling(false);
    };

    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/home.png')}
                className="flex-1 w-full h-full"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4">Loading question...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require('@/assets/images/home.png')}
            className="flex-1 w-full h-full"
            resizeMode="cover"
        >
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white font-artistic mb-2 text-[60px] text-center">
                    Love Questions
                </Text>
                <View className="p-6 pt-20">
                    {/* Question Card */}
                    <View className="bg-white/90 rounded-2xl p-6 mb-2 shadow-lg">
                        <Text className="text-[#800000] text-[16px] font-semibold mb-2 text-center">
                            💭 Question of today
                        </Text>

                        <Text className="text-black text-2xl font-bold text-center leading-8 mb-6">
                            {question?.question}
                        </Text>
                        <View className="h-px bg-gray-200 mb-2" />

                        <Text className="text-gray-500 text-center text-[16px]">
                            Answer honestly and listen with an open heart
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row justify-center gap-4">
                        {/* Discussed Button */}
                        <TouchableOpacity
                            className="flex-1 bg-red rounded-xl py-4 shadow-lg"
                            onPress={markAsDiscussed}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white text-center font-bold text-lg">
                                    Discussed
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Shuffle Button */}
                        <TouchableOpacity
                            className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl py-4 border border-white/30"
                            onPress={shuffleQuestion}
                            disabled={updating || shuffling}
                        >
                            {shuffling ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white text-center font-semibold text-lg">
                                    Shuffle
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <ReturnButton />
            </View>
        </ImageBackground>
    );
}