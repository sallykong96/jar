// app/room/[roomName]/partner-says.tsx
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import PartnerSaysButton from "@/app/components/partnerSaysButton";
import { ReturnButton } from "@/app/components/returnButton";
import { router, usePathname, useFocusEffect } from "expo-router";
import {checkIdentity, getReviewStatus} from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { useUser } from '@clerk/clerk-expo';

export default function PartnerSays() {
    const pathname = usePathname();
    const match = pathname.match(/\/room\/([^\/]+)\/partner-says/);
    const roomName = match ? decodeURIComponent(match[1]) : '';
    const { user } = useUser();
    const userId = user?.id;

    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!roomName) {
            setLoading(false);
            return;
        }
        try {
            const data = await getReviewStatus(roomName);
            if (data && data.length > 0) {
                const transformedData = data.map(item => ({
                    no: item.id,
                    date: item.date,
                    creator: item.creator_status,
                    joiner: item.joiner_status,

                }));
                setTableData(transformedData);
            } else {
                setTableData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [roomName]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );
    const [userIdentity, setUserIdentity] = useState<string>('');

    useEffect(() => {
        const fetchUserIdentity = async () => {
            if (userId) {
                const identity = await checkIdentity(roomName, userId);
                setUserIdentity(identity);
            }
        };
        fetchUserIdentity();
    }, [userId]);


    const getButton = (status: string, date: string, colIdentity: string) => {
            switch(status) {
                case 'pending':
                    if (colIdentity === userIdentity) {
                        return <PartnerSaysButton iconSource={require('@/assets/icons/edit.png')} label={date} roomName={roomName} colIdentity={colIdentity} identity={userIdentity} status={status}/>;
                    }
                    return <PartnerSaysButton iconSource={require('@/assets/icons/clock.png')} label={date} roomName={roomName} colIdentity={colIdentity} identity={userIdentity} status={status}/>;
                case 'read':
                    return <PartnerSaysButton iconSource={require('@/assets/icons/eye.png')} label={date} roomName={roomName} colIdentity={colIdentity} identity={userIdentity} status={status}/>;
                case 'done':
                    return <PartnerSaysButton iconSource={require('@/assets/icons/tick.png')} label={date} roomName={roomName} colIdentity={colIdentity} identity={userIdentity} status={status}/>;
                case 'late':
                    return <PartnerSaysButton iconSource={0} label={date} status={status}/>;
                default:
                    return <PartnerSaysButton iconSource={0} label={date} status={status}/>;
            }
};

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
        <ImageBackground source={require('@/assets/images/partner-says.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white font-artistic mb-2 text-[60px] text-center">
                    Partner Says
                </Text>
                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="flex-row bg-red">
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">No</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Date</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">{userIdentity === 'creator'? 'You':'Creator'}</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">{userIdentity === 'joiner'? ' You':'Joiner'}</Text>
                    </View>

                    {tableData.length > 0 ? (
                        tableData.map((item, index) => (
                            <View key={item.no || index} className="flex-row bg-white/10 items-center">
                                <Text className="flex-1 py-1 text-center text-white text-[16px]">
                                    {item.no}
                                </Text>
                                <Text className="flex-1 text-center text-white text-[16px]">
                                    {item.date}
                                </Text>
                                <View className="flex-1 items-center justify-center">
                                    {getButton(item.creator, item.date, 'creator')}
                                </View>
                                <View className="flex-1 items-center justify-center">
                                    {getButton(item.joiner, item.date, 'joiner')}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center">No data available</Text>
                        </View>
                    )}
                </View>
            </View>
            <ReturnButton />
        </ImageBackground>
    );
}