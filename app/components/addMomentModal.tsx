// components/AddMomentModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface AddMomentModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description: string, imageUrl: string, date: string, location: string) => Promise<void>;
}

export default function AddMomentModal({ visible, onClose, onSave }: AddMomentModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            const base64Url = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setImageUrl(base64Url);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setError('Please enter a title');
            return;
        }
        if (!description.trim()) {
            setError('Please enter a description');
            return;
        }
        if (!imageUrl) {
            setError('Please select an image');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const currentDate = new Date().toISOString();
            await onSave(title.trim(), description.trim(), imageUrl, currentDate, location);

            // Reset form
            setTitle('');
            setDescription('');
            setLocation('')
            setImageUrl('');
            onClose();
        } catch (err: any) {
            console.error('Error saving moment:', err);
            setError(err.message || 'Failed to save moment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-[#091B30] rounded-2xl w-[90%] max-h-[85%]">
                    <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                        <Text className="text-white text-2xl font-bold text-center mb-4">
                            Add New Moment
                        </Text>

                        {/* Image Picker */}
                        <TouchableOpacity
                            className="bg-white/10 rounded-lg h-36 justify-center items-center mb-4 overflow-hidden"
                            onPress={pickImage}
                        >
                            {imageUrl ? (
                                <Image
                                    source={{ uri: imageUrl }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <>
                                    <Text className="text-3xl mb-1">📸</Text>
                                    <Text className="text-white/60 text-sm text-center">
                                        Tap to select an image
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Title Input */}
                        <View className="mb-3">
                            <Text className="text-white mb-1 font-semibold text-sm">Title *</Text>
                            <TextInput
                                className="bg-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g., Our First Sunset"
                                placeholderTextColor="#ffffff60"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text);
                                    setError('');
                                }}
                                maxLength={50}
                            />
                        </View>

                        {/* Description Input */}
                        <View className="mb-3">
                            <Text className="text-white mb-1 font-semibold text-sm">Description *</Text>
                            <TextInput
                                className="bg-white/10 rounded-lg px-4 py-2 text-white min-h-[80px]"
                                placeholder="Write about this special moment..."
                                placeholderTextColor="#ffffff60"
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    setError('');
                                }}
                                multiline
                                textAlignVertical="top"
                                maxLength={500}
                            />
                        </View>

                        {/* Location Input (Optional) */}
                        <View className="mb-3">
                            <Text className="text-white mb-1 font-semibold text-sm">Location (Optional)</Text>
                            <TextInput
                                className="bg-white/10 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g., Paris, France"
                                placeholderTextColor="#ffffff60"
                                maxLength={100}
                                value={location}
                                onChangeText={(text) => {
                                    setLocation(text);
                                    setError('');
                                }}
                            />
                        </View>

                        {error ? (
                            <Text className="text-red-500 text-center mb-3 text-sm">{error}</Text>
                        ) : null}

                        {/* Buttons */}
                        <View className="flex-row gap-3 mb-2">
                            <TouchableOpacity
                                className="flex-1 bg-white/10 rounded-lg py-2"
                                onPress={onClose}
                                disabled={loading}
                            >
                                <Text className="text-white text-center font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-amber-500 rounded-lg py-2"
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text className="text-white text-center font-semibold">
                                        Save
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}