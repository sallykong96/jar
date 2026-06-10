// app/components/addRosterModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface AddRosterModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (imageUrl: string, monthDate: string) => Promise<void>;
    monthName: string;
    monthDate: string;
}

export default function AddRosterModal({
                                           visible,
                                           onClose,
                                           onSave,
                                           monthName,
                                           monthDate
                                       }: AddRosterModalProps) {
    const [imageUrl, setImageUrl] = useState('');
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
        if (!imageUrl) {
            setError('Please select an image');
            return;
        }

        try {
            setLoading(true);
            setError('');
            // Use the monthDate passed from the parent, not today's date
            await onSave(imageUrl, monthDate);
            setImageUrl('');
            onClose();
        } catch (err: any) {
            console.error('Error saving roster:', err);
            setError(err.message || 'Failed to save roster');
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
                    <View className="p-6">
                        <Text className="text-white text-2xl font-bold text-center mb-4">
                            Add Photo for {monthName}
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
                    </View>
                </View>
            </View>
        </Modal>
    );
}