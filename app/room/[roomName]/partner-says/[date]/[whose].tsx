// app/room/[roomName]/partner-says/[whose].tsx
import { View, Text, ImageBackground } from 'react-native';
import {useLocalSearchParams, router, usePathname} from 'expo-router';
import { ReturnButton } from "@/app/components/returnButton";
import { useEffect, useState } from 'react';
import { getReviewByDate } from '@/lib/supabase'; // You'll need to create this function

export default function PartnerSaysDetail() {

    const [reviewData, setReviewData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const match = pathname.match(/\/room\/([^\/]+)\/partner-says\/([^\/]+)\/([^\/]+)/);
    const roomName = match ? decodeURIComponent(match[1]) : '';
    const date = match ? decodeURIComponent(match[2]) : '';
    const whose = match ? decodeURIComponent(match[3]) : '';
    console.log('PartnerSaysDetail pathname:', pathname);
    console.log('PartnerSaysDetail whose:', whose);


    useEffect(() => {
        const fetchData = async () => {
            if (roomName && date) {
                const data = await getReviewByDate(roomName, date);
                if (whose === 'partners') {
                    setReviewData(data[0].partner_content);
                } else {
                    setReviewData(data[0].own_content);
                }

                setLoading(false);
            }
        };
        fetchData();
    }, [roomName, date, whose]);

    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/partner-says.png')}
                className="flex-1 w-full h-full"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white text-center">Loading...</Text>
                </View>
            </ImageBackground>
        );
    }



    return (
        <ImageBackground
            source={require('@/assets/images/partner-says.png')}
            className="flex-1 w-full h-full"
            resizeMode="cover"
        >
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white text-center font-bold text-[20px] mb-5">
                    {date}
                </Text>

                <View className="h-px bg-white mb-3 w-full"></View>

                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="bg-red px-4 py-2">
                        <Text className="text-white text-[18px]">{whose === 'yours'? 'I feel that ...': "Your partner says ..."}</Text>
                    </View>
                    <View className="p-4">
                        <Text className="text-white mb-2 text-[17px]">{reviewData}</Text>
                    </View>
                </View>

            </View>
        </ImageBackground>
    );
}