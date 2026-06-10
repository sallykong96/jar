// In app/components/editImportantDateModal.tsx
import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

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
    const [date, setDate] = useState(initialDate);
    const isStartDating = initialEvent === 'Start Dating';

    const handleSave = () => {
        if (!date.trim()) {
            Alert.alert('Error', 'Please fill in the date');
            return;
        }
        // Pass the appropriate event name (original if Start Dating, otherwise the edited one)
        onSave(isStartDating ? initialEvent : event, date);
        onClose();
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
                            <Text className="text-black">{initialEvent}</Text>
                        </View>
                    ) : (
                        <TextInput
                            className="bg-white/10 text-white/80 rounded-lg p-3 mb-4"
                            placeholder="Enter event name"
                            value={event}
                            onChangeText={setEvent}
                        />
                    )}

                    <Text className="text-white mb-2 font-semibold">Date</Text>
                    <TextInput
                        className="bg-white/10 text-white/80 rounded-lg p-3 mb-4"
                        placeholder="YYYY-MM-DD"
                        value={date}
                        onChangeText={setDate}
                    />

                    <View className="flex-row justify-center gap-3">
                        <TouchableOpacity
                            className="bg-gray-400 py-2 px-4 rounded-lg"
                            onPress={onClose}
                        >
                            <Text className="text-white font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-red py-2 px-4 rounded-lg"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-semibold">Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}