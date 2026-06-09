// components/AddImportantDateModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AddImportantDateModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (event: string, date: string) => Promise<void>;
    roomName: string;
}

export default function AddImportantDateModal({
                                                  visible,
                                                  onClose,
                                                  onSave,
                                                  roomName
                                              }: AddImportantDateModalProps) {
    const [event, setEvent] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        // Validation
        if (!event.trim()) {
            setError('Please enter an event name');
            return;
        }

        if (!date) {
            setError('Please select a date');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Format date to YYYY-MM-DD for database
            const formattedDate = date.toISOString().split('T')[0];

            await onSave(event.trim(), formattedDate);

            // Reset form
            setEvent('');
            setDate(new Date());
            onClose();
        } catch (err: any) {
            console.error('Error saving date:', err);
            setError(err.message || 'Failed to save date');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form
        setEvent('');
        setDate(new Date());
        setError('');
        onClose();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const formatDisplayDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-navy rounded-2xl p-6 w-[90%] max-w-md">
                    {/* Header */}
                    <Text className="text-white text-2xl font-bold text-center mb-2">
                        Add Important Date
                    </Text>

                    {/* Event Input */}
                    <View className="mb-4">
                        <Text className="text-white mb-2 text-[16px] font-semibold">
                            Event Name *
                        </Text>
                        <TextInput
                            className="bg-white/10 rounded-lg px-4 py-3 text-white text-[16px]"
                            placeholder="e.g. Anniversary, First Date, Birthday"
                            placeholderTextColor="#ffffff60"
                            value={event}
                            onChangeText={(text) => {
                                setEvent(text);
                                setError('');
                            }}
                            maxLength={100}
                        />
                    </View>

                    {/* Date Selection */}
                    <View className="mb-6">
                        <Text className="text-white mb-2 text-[16px] font-semibold">
                            Date *
                        </Text>

                        {/* Date Display Button */}
                        <TouchableOpacity
                            className="bg-white/10 rounded-lg px-4 py-3"
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text className="text-white text-[16px]">
                                {formatDisplayDate(date)}
                            </Text>
                        </TouchableOpacity>

                        {/* Date Picker */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                maximumDate={new Date()} // Optional: prevent future dates
                            />
                        )}
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <Text className="text-red-500 text-center mb-4">
                            {error}
                        </Text>
                    ) : null}

                    {/* Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-white/10 rounded-lg py-3"
                            onPress={handleCancel}
                            disabled={loading}
                        >
                            <Text className="text-white text-center text-[16px] font-semibold">
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-red rounded-lg py-3"
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white text-center text-[16px] font-semibold">
                                    Save
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}