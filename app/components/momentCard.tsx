import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MomentCardProps {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    date: string;
    location: string;
    onDelete: (id: string) => void;
}

export default function MomentCard({
                                       id,
                                       imageUrl,
                                       title,
                                       description,
                                       date,
                                       location,
                                       onDelete
                                   }: MomentCardProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        // Get image dimensions
        Image.getSize(
            imageUrl,
            (width, height) => {
                setImageDimensions({ width, height });
            },
            (error) => {
                console.error('Failed to get image size:', error);
                setImageDimensions({ width: 300, height: 300 });
            }
        );
    }, [imageUrl]);

    const aspectRatio = imageDimensions.width / imageDimensions.height;
    const fixedHeight = 400;
    const calculatedWidth = fixedHeight * aspectRatio;

    return (
        <>
            <View className="bg-white/80 rounded-2xl mb-4 overflow-hidden border border-gray-200 shadow-sm">
                {/* Image Section - Fixed height, dynamic width */}
                <TouchableOpacity
                    onPress={() => setShowFullDescription(true)}
                    activeOpacity={0.9}
                    className="items-center justify-center bg-white/10"
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={{
                            width: calculatedWidth,
                            height: fixedHeight,
                        }}
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                {/* Content Section */}
                <View className="px-4 pb-4 pt-2">
                    {/* Title and Delete Button */}
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-black text-xl font-bold flex-1">
                            {title}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setDeleteModalVisible(true)}
                            className="p-2 rounded-full"
                        >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    {/* Date */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar-outline" size={14} color="#666666" />
                        <Text className="text-black/60 text-xs ml-1 mr-10">
                            {formatDate(date)}
                        </Text>
                        <Ionicons name="location-outline" size={14} color="#666666" />
                        <Text className="text-black/60 text-xs ml-1">
                            {location}
                        </Text>
                    </View>

                    {/* Description Preview */}
                    <Text className="text-black/80 text-sm leading-5">
                        {description}
                    </Text>
                </View>
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={deleteModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-2xl p-6 w-[80%]">
                        <Text className="text-black text-xl font-bold text-center mb-3">
                            Delete Moment
                        </Text>
                        <Text className="text-black/70 text-center mb-6">
                            Are you sure you want to delete "{title}"? This action cannot be undone.
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-100 rounded-lg py-3"
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text className="text-black text-center font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-red-500 rounded-lg py-3"
                                onPress={() => {
                                    onDelete(id);
                                    setDeleteModalVisible(false);
                                }}
                            >
                                <Text className="text-white text-center font-semibold">
                                    Delete
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

// Helper function to format date
function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}