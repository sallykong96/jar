// components/SwipeableListItem.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';
import DateFrame from "@/app/components/dateFrame";

interface SwipeableImportantDatesProps {
    event: string;
    date: string;
    count: string;
    onDelete: () => void;
    color?: string;
}

export default function SwipeableImportantDates({
                                              event,
                                              date,
                                              count,
                                              onDelete,
                                              color = 'amber-300'
                                          }: SwipeableImportantDatesProps) {
    const swipeableRef = useRef<any>(null);

    const renderRightActions = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    onDelete();
                    swipeableRef.current?.close();
                }}
                className="bg-amber-300 justify-center items-center px-6 rounded-r-lg"
                activeOpacity={0.7}
            >
                <Text className="text-black font-bold text-[16px]">Delete</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            overshootRight={false}
            rightThreshold={40}
        >
            <View className="flex-row bg-white/10 items-center py-1">
                <Text className="flex-4 text-center text-white text-[16px]">
                    {event}
                </Text>
                <View className="items-center flex-2">
                    <View className="gap-0.5">
                        <DateFrame date={date} color={color} />
                    </View>
                </View>
                <Text className="flex-2 text-center text-white text-[16px]">
                    {count}
                </Text>
            </View>
        </Swipeable>
    );
}