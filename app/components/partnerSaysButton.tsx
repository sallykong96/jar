import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ImageSourcePropType } from 'react-native';
import {router, useLocalSearchParams} from "expo-router";

interface PartnerSaysButtonProps {
    iconSource: ImageSourcePropType;
    label: string;
    disabled?: boolean;
    roomName?: string;
    colIdentity?: string;
    identity? : string;
    status: string;

}

export default function PartnerSaysButton({ iconSource, label, disabled = false, roomName, colIdentity, identity, status }: PartnerSaysButtonProps) {
    const onPress = async () => {
        if (status === 'read') {
            router.push({
                pathname: `/room/${roomName}/partner-says/${label}/${identity}` as any,
                params: {
                    colIdentity: colIdentity,
                }
            });
        } else if (colIdentity === identity) {
            router.push(`/room/${roomName}/partner-says/${label}/${identity}/edit`);
        }
    }
    let color = 'white';
    if (iconSource === require('@/assets/icons/tick.png')) {
        color = 'green';
    }

    return (
        <TouchableOpacity
            onPress={iconSource === 0 ? () => {} : onPress}
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