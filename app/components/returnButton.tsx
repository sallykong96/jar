import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

interface ReturnButtonProps {
    roomName?: string;
    label?: string;
    className?: string;
}

export function ReturnButton({roomName, label = "Back", className = ""}: ReturnButtonProps) {
    const params = useLocalSearchParams<{ roomName: string }>();
    const activeRoomName = roomName || params.roomName;

    const handleGoBack = () => {
        if (activeRoomName) {
            router.push(`/room/${activeRoomName}`);
        } else {
            router.back();
        }
    };

    if (!activeRoomName) {
        return (
            <TouchableOpacity onPress={() => router.back()} className="rec-button">
                <Text className="text-white text-center text-[16px]">{label}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={handleGoBack} className="rec-button mx-5 absolute bottom-20 left-5">
            <Text className="text-white text-center text-[16px]">{label}</Text>
        </TouchableOpacity>
    );
}
export default ReturnButton;