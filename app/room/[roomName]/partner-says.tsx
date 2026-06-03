// app/room/[roomName]/partner-says.tsx
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import PartnerSaysButton from "@/app/components/partnerSaysButton";
import { ReturnButton } from "@/app/components/returnButton";
import { router, usePathname } from "expo-router";
import { getReviewStatus } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function PartnerSays() {
    const pathname = usePathname();
    const match = pathname.match(/\/room\/([^\/]+)\/partner-says/);
    const roomName = match ? decodeURIComponent(match[1]) : '';

    console.log('PartnerSays roomName:', roomName);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!roomName) {
            console.error('No roomName provided');
            setLoading(false);
            return;
        }

        try {
            const data = await getReviewStatus(roomName);
            if (data && data.length > 0) {
                const transformedData = data.map(item => ({
                    no: item.id,
                    date: item.date,
                    partners: item.partner_status,
                    yours: item.own_status,

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

    const handleStatusPress = (date: string, whose: 'partners' | 'yours') => {
        // Navigate to the date-specific page
        // URL: /room/[roomName]/partner-says/[date]
        router.push(`/room/${roomName}/partner-says/${date}/${whose}`);
    };

    const getPartnerButton = (status: string, date: string, whose: 'partners' | 'yours') => {
        const button = (() => {
            switch(status) {
                case 'pending':
                    return <PartnerSaysButton iconSource={require('@/assets/icons/edit.png')} label={date} roomName={roomName} whose={whose} />;
                case 'read':
                    return <PartnerSaysButton iconSource={require('@/assets/icons/eye.png')} label={date} roomName={roomName} whose={whose}/>;
                case 'done':
                    return <PartnerSaysButton iconSource={require('@/assets/icons/tick.png')} label={date} roomName={roomName} whose={whose}/>;
                case 'late':
                    return <PartnerSaysButton iconSource={0} label={date} />;
                default:
                    return <PartnerSaysButton iconSource={0} label={date} />;
            }
        })();

        return (
            <TouchableOpacity onPress={() => handleStatusPress(date, whose)}>
                {button}
            </TouchableOpacity>
        );
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
        <ImageBackground
            source={require('@/assets/images/partner-says.png')}
            className="flex-1 w-full h-full"
            resizeMode="cover"
        >
            <View className="flex-1 justify-start p-4 mt-25">
                <Text className="text-white font-artistic mb-2 text-[60px] text-center">
                    Partner Says
                </Text>
                <View className="bg-white/20 rounded-lg overflow-hidden">
                    <View className="flex-row bg-red">
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">No</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Date</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Partner's</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Yours</Text>
                    </View>

                    {tableData.length > 0 ? (
                        tableData.map((item, index) => (
                            <View key={item.no || index} className="flex-row bg-white/10 items-center">
                                <Text className="flex-1 py-3 text-center text-white text-[16px]">
                                    {item.no}
                                </Text>
                                <Text className="flex-1 text-center text-white text-[16px]">
                                    {item.date}
                                </Text>
                                <View className="flex-1 items-center justify-center">
                                    {getPartnerButton(item.partners, item.date, 'partners')}
                                </View>
                                <View className="flex-1 items-center justify-center">
                                    {getPartnerButton(item.yours, item.date, 'yours')}
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="py-8">
                            <Text className="text-white text-center">No review data available for {roomName}</Text>
                        </View>
                    )}
                </View>
            </View>
            <ReturnButton />
        </ImageBackground>
    );
}