// app/room/[roomName]/partner-says.tsx
import {View, Text, ImageBackground, TouchableOpacity, Alert} from 'react-native';
import { ReturnButton } from "@/app/components/returnButton";
import {useLocalSearchParams, usePathname} from "expo-router";
import {deleteTravelItem, getTravelList} from "@/lib/supabase";
import { useEffect, useState } from "react";
import DateFrame from "@/app/components/dateFrame";
import SwipeableListItem from "@/app/components/swipeableListItem";

export default function TravelBucket() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();

    const [toGoList, setToGoList] = useState<any[]>([]);
    const [beenToList, setBeenToList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

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

    useEffect(() => {
        fetchData();
    }, [roomName]);

    const handleDelete = async (itemId: string, type: 'go' | 'been') => {
        Alert.alert(
            "Delete Item",
            "Are you sure you want to delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeleting(true);
                        try {
                            await deleteTravelItem(itemId);
                            await fetchData();
                        } catch (error) {
                            console.error("Error deleting:", error);
                            Alert.alert("Error", "Failed to delete item");
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/travel-bucket.png')}
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
                            <SwipeableListItem
                                key={item.id || index}
                                destination={item.destination}
                                dateStart={item.date_start}
                                dateEnd={item.date_end}
                                onDelete={() => handleDelete(item.id, 'go')}
                                color="#E37100"
                            />
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center opacity-80">
                                No places to go yet ✈️
                            </Text>
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
                            <SwipeableListItem
                                key={item.id || index}
                                destination={item.destination}
                                dateStart={item.date_start}
                                dateEnd={item.date_end}
                                onDelete={() => handleDelete(item.id, 'go')}
                                color="#E37100"
                            />
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center opacity-80">
                                No visited places yet ✈️
                            </Text>
                        </View>
                    )}
                </View>
                </View>
            </View>
            <ReturnButton />
        </ImageBackground>
    );
}