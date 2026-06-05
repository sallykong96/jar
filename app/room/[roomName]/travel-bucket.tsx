// app/room/[roomName]/partner-says.tsx
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { ReturnButton } from "@/app/components/returnButton";
import {useLocalSearchParams, usePathname} from "expo-router";
import { getTravelList} from "@/lib/supabase";
import { useEffect, useState } from "react";
import DateFrame from "@/app/components/dateFrame";

export default function TravelBucket() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();

    const [toGoList, setToGoList] = useState<any[]>([]);
    const [beenToList, setBeenToList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!roomName) {
                setLoading(false);
                return;
            }
            try {
                const togoData = await getTravelList(roomName, 'go');
                setToGoList(togoData);
                const beenToData = await getTravelList(roomName, 'been');
                setBeenToList(beenToData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setToGoList([]);
                setBeenToList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomName]); // Only re-fetch when roomName changes

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
        <ImageBackground source={require('@/assets/images/travel-bucket.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white font-artistic mb-2 text-[60px] text-center">
                    Travel Bucket
                </Text>

                <View className="flex-column gap-3">

                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="flex-row bg-red">
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Going To</Text>
                        <Text className="w-40 py-2 text-center text-white text-[16px]">Date</Text>
                    </View>

                    {toGoList.length > 0 ? (
                        toGoList.map((item, index) => (
                            <View key={item.id || index} className="flex-row bg-white/10 items-center">
                                <Text className="flex-1 py-3 text-center text-white text-[16px]">
                                    {item.destination}
                                </Text>
                                <Text className="w-40 text-center text-white text-[16px]">
                                    <DateFrame date={item.date_start}/>
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center">No data available for {roomName}</Text>
                        </View>
                    )}
                </View>
                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="flex-row bg-red">
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Been To</Text>
                        <Text className="w-40 py-2 text-center text-white text-[16px]">Date</Text>
                    </View>

                    {beenToList.length > 0 ? (
                        beenToList.map((item, index) => (
                            <View key={item.id || index} className="flex-row bg-white/10 items-center">
                                <Text className="flex-1 py-3 text-center text-white text-[17px]">
                                    {item.destination}
                                </Text>
                                <Text className="w-40 text-center text-white text-[16px]">
                                    <View className="gap-0.5">
                                        <DateFrame date={item.date_start}/>
                                        <DateFrame date={item.date_end} color="navy"/>
                                    </View>
                                </Text>
                            </View>
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center">No data available for {roomName}</Text>
                        </View>
                    )}
                </View>
                </View>
            </View>
            <ReturnButton />
        </ImageBackground>
    );
}