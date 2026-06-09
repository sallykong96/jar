import { View, Text } from 'react-native';

interface DateFrameProps {
    date: any;
    color?: string;
}

export default function DateFrame({ date, color = '#E37100' }: DateFrameProps) {

    return (
        <View
            style={{ backgroundColor: color }}
            className="px-3 rounded-2xl opacity-90"
        >
            <Text className="font-semibold text-white text-[14px]">
                {date}
            </Text>
        </View>
    );
}