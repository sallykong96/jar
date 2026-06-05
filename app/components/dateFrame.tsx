import { View, Text } from 'react-native';

interface DateFrameProps {
    date: any;
    color?: string;
}

export default function DateFrame({ date, color = 'orange' }: DateFrameProps) {
    return (
        <View className={`bg-${color} px-3 rounded-x font-bold rounded-2xl`}>
            <Text className="font-semibold text-white text-[15px]">{date}</Text>
        </View>
    );
}
