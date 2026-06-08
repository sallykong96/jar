import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

interface SquareButtonProps {
    label?: string;
    iconSource?: any; // Changed to 'any' for require() images
    onPress?: () => void;
    className?: string;
    size?: number; // For custom sizing
}

export function SquareButton({label,iconSource,onPress,className = "",size = 25}: SquareButtonProps) {

    const handleAction = () => {
        if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity
            onPress={handleAction}
            className={`bg-white rounded-lg items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            activeOpacity={0.7}
        >
            {iconSource ? (
                <Image
                    source={iconSource}
                    style={{ width: size * 0.5, height: size * 0.5 }}
                    resizeMode="contain"
                    tintColor="black"
                />
            ) : label ? (
                <Text className="text-black text-center font-bold">{label}</Text>
            ) : null}
        </TouchableOpacity>
    );
}

export default SquareButton;