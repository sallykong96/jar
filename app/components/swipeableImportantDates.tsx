import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import DateFrame from "@/app/components/dateFrame";

interface SwipeableImportantDatesProps {
    event: string;
    date: string;
    count: number;
    onDelete: () => void;
    onEdit: () => void;
    color: string;
}

export default function SwipeableImportantDates({
                                                    event,
                                                    date,
                                                    count,
                                                    onDelete,
                                                    onEdit,
                                                    color
                                                }: SwipeableImportantDatesProps) {
    const isStartDating = event === 'Start Dating';

    const renderRightActions = () => {
        return (
            <TouchableOpacity
                className="bg-amber-300 justify-center items-center px-4"
                onPress={() => {
                    Alert.alert(
                        "Delete",
                        "Are you sure you want to delete this?",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", onPress: onDelete, style: "destructive" }
                        ]
                    );
                }}
            >
                <Text className="text-black font-bold">Delete</Text>
            </TouchableOpacity>
        );
    };

    const renderLeftActions = () => {
        if (isStartDating) {
            return null;
        }

        return (
            <TouchableOpacity
                className="bg-blue-500 justify-center items-center px-4"
                onPress={onEdit}
            >
                <Text className="text-white font-bold">Edit</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
        >
            <TouchableOpacity
                onPress={onEdit}  // Allow editing for all items including 'Start Dating'
                activeOpacity={0.7}
                style={{ backgroundColor: color }}
                className="flex-row items-center py-2 px-2"
            >
                <Text className="flex-4 text-white text-[14px] px-2 text-center">{event}</Text>
                <DateFrame date={date} color="#091B30" />
                <Text className="flex-2 text-white text-[14px] px-2 text-center">{count}</Text>
            </TouchableOpacity>
        </Swipeable>
    );
}