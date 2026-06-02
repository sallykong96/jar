import { View, Text, ImageBackground } from 'react-native';
import PartnerSaysButton from "@/app/components/partnerSaysButton";
import {ReturnButton} from "@/app/components/returnButton";
import {useGlobalSearchParams, useLocalSearchParams} from "expo-router";
import {getReviewStatus} from "@/lib/supabase";
import {useEffect, useState} from "react";

export default function PartnerSays() {

    const params = useLocalSearchParams();

    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const roomName = Array.isArray(params.roomName)
        ? params.roomName[0]
        : params.roomName || '';

    const fetchData = async () => {
        try {
            console.log('roomName:', params.roomName);
            const data = await getReviewStatus(roomName);
            if (data && data.length > 0) {
                const transformedData = data.map(item => ({
                    no: item.id,
                    date: item.date,
                    partners: item.partner_status,
                    yours: item.own_status
                }));
                setTableData(transformedData);
            } else {
                console.log('No data found for room:', roomName);
                setTableData([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setTableData([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData()
    }, [roomName])

    const getPartnerButton = (status: string, date: string) => {
        switch(status) {
            case 'pending':
                return <PartnerSaysButton iconSource={require('@/assets/icons/edit.png')} label={date} />;
            case 'read':
                return <PartnerSaysButton iconSource={require('@/assets/icons/eye.png')} label={date} />;
            case 'done':
                return <PartnerSaysButton iconSource={require('@/assets/icons/tick.png')} label={date} />;
            case 'late':
                return <PartnerSaysButton iconSource={0} label={date} />;
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
                    {/* Table Header */}
                    <View className="flex-row bg-red">
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">No</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Date</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Partner's</Text>
                        <Text className="flex-1 py-2 text-center text-white text-[16px]">Yours</Text>
                    </View>

                    {/* Table Rows */}
                    {tableData.map((item, index) => (
                        <View key={item.no} className="flex-row bg-white/10 items-center">
                            <Text className="flex-1 py-3 text-center text-white text-[16px]">
                                {item.no}
                            </Text>
                            <Text className="flex-1 text-center text-white text-[16px]">
                                {item.date}
                            </Text>
                            <View className="flex-1 items-center justify-center">
                                {getPartnerButton(item.partners, item.date)}
                            </View>
                            <View className="flex-1 items-center justify-center">
                                {getPartnerButton(item.yours, item.date)}
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            <ReturnButton />
        </ImageBackground>
    );
}