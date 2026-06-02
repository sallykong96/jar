import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ImageSourcePropType } from 'react-native';
import {router, useLocalSearchParams} from "expo-router";

interface PartnerSaysButtonProps {
    iconSource: ImageSourcePropType;
    label: string;
    disabled?: boolean;
}

export default function PartnerSaysButton({ iconSource, label, disabled = false }: PartnerSaysButtonProps) {
    const roomName = useLocalSearchParams<{ roomName: string }>();
    const onPress = async () => {
        // router.push(`/room/${roomName}/${label}`);
    }
    let color = 'black';
    if (iconSource === require('@/assets/icons/tick.png')) {
        color = 'green';
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
            className="items-center mx-4"
        >
            <View className="rounded-full items-center justify-center">
                { iconSource === 0?
                    <View className="bg-amber-300 px-3 py-0.5 rounded-md">
                        <Text className="font-semibold text-sm">LATE</Text>
                    </View>:
                    <Image source={iconSource} className="w-7 h-7" resizeMode="contain" tintColor={color}/>
                }
            </View>
        </TouchableOpacity>
    );
}