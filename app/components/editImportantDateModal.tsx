// app/components/editImportantDateModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditImportantDateModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (event: string, date: string) => void;
    initialEvent: string;
    initialDate: string;
    itemId: string;
}

export default function EditImportantDateModal({
                                                   visible,
                                                   onClose,
                                                   onSave,
                                                   initialEvent,
                                                   initialDate,
                                                   itemId
                                               }: EditImportantDateModalProps) {
    const [event, setEvent] = useState(initialEvent);
    const [date, setDate] = useState(() => {
        // Parse the initial date string to Date object
        const parsedDate = new Date(initialDate);
        return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const isStartDating = initialEvent === 'Start Dating';

    const handleSave = () => {
        if (!date) {
            Alert.alert('Error', 'Please select a date');
            return;
        }

        // Format date to YYYY-MM-DD for database
        const formattedDate = date.toISOString().split('T')[0];

        // Pass the appropriate event name (original if Start Dating, otherwise the edited one)
        onSave(isStartDating ? initialEvent : event, formattedDate);
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
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-navy rounded-lg p-6 w-11/12 max-w-md">
                    <Text className="text-white text-2xl font-bold mb-4 text-center">
                        Edit Important Date
                    </Text>

                    <Text className="text-white mb-2 font-semibold">Event</Text>
                    {isStartDating ? (
                        <View className="bg-white/10 rounded-lg p-3 mb-4">
                            <Text className="text-white/80">{initialEvent}</Text>
                        </View>
                    ) : (
                        <TextInput
                            className="bg-white/10 text-white/80 rounded-lg p-3 mb-4"
                            placeholder="Enter event name"
                            placeholderTextColor="#ffffff60"
                            value={event}
                            onChangeText={setEvent}
                        />
                    )}

                    <Text className="text-white mb-2 font-semibold">Date</Text>

                    {/* Date Display Button */}
                    <TouchableOpacity
                        className="bg-white/10 rounded-lg px-4 py-3 mb-4"
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text className="text-white/80 text-[16px]">
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
                        />
                    )}

                    <View className="flex-row justify-center gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-gray-400 py-2 px-4 rounded-lg"
                            onPress={onClose}
                        >
                            <Text className="text-white font-semibold text-center">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-red py-2 px-4 rounded-lg"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-semibold text-center">
                                Save Changes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}