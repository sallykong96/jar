// components/SwipeableListItem.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';
import DateFrame from "@/app/components/dateFrame";

interface SwipeableListItemProps {
    destination: string;
    dateStart?: string;
    dateEnd?: string;
    onDelete: () => void;
    color?: string;
}

export default function SwipeableListItem({
                                              destination,
                                              dateStart,
                                              dateEnd,
                                              onDelete,
                                              color = 'amber-300'
                                          }: SwipeableListItemProps) {
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
            <View className="flex-row bg-white/10 items-center py-3">
                <Text className="flex-1 text-center text-white text-[16px]">
                    {destination}
                </Text>
                <View className="w-40 items-center">
                        <View className="gap-0.5">
                            <DateFrame date={dateStart} />
                            <DateFrame date={dateEnd} color="#082A5C" />
                        </View>
                </View>
            </View>
        </Swipeable>
    );
}