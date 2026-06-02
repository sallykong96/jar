import { View, Text, Image } from 'react-native';
import { ImageSourcePropType } from 'react-native';

interface IconCardProps {
    iconSource: ImageSourcePropType;
    label: string;
}

export default function Icon({ iconSource,label }: IconCardProps) {
    return (
        <View className="items-center mx-4 w-28 h-24">
            <View className="bg-red-500/50 rounded-full w-18 h-18 items-center justify-center">
                <Image
                    source={iconSource}
                    className="w-10 h-10"
                    resizeMode="contain"
                    tintColor="white"
                />
            </View>
            <Text className="text-white mt-2 text-center text-light opacity-70 text-[16px]">
                {label}
            </Text>
        </View>
    );
}