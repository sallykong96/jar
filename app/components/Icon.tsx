import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ImageSourcePropType } from 'react-native';
import {router, useLocalSearchParams} from "expo-router";

interface IconCardProps {
    iconSource: ImageSourcePropType;
    label: string;
    disabled?: boolean;
    title?: string;
}

export default function Icon({ iconSource, label, disabled = false, title }: IconCardProps) {
    const params = useLocalSearchParams<{ roomName: string }>();

    // Extract roomName as a string properly
    let roomNameString = '';
    if (params.roomName) {
        roomNameString = Array.isArray(params.roomName)
            ? params.roomName[0]
            : String(params.roomName);
    }

    const onPress = async () => {
        if (!roomNameString) {
            console.error('No roomName available');
            return;
        }
        // router.push(`/room/${encodeURIComponent(roomNameString)}/${label}`);
        router.push({
            pathname: `/room/${encodeURIComponent(roomNameString)}/${label}` as any,
            params: {
                roomName: roomNameString,
            }
        });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
            className="items-center mx-4 w-28 h-24"
        >
            <View className="bg-red-500/50 rounded-full w-18 h-18 items-center justify-center">
                <Image
                    source={iconSource}
                    className="w-10 h-10"
                    resizeMode="contain"
                    tintColor="white"
                />
            </View>
            <Text className="text-white mt-2 text-center text-light opacity-70 text-[16px]">
                {title}
            </Text>
        </TouchableOpacity>
    );
}