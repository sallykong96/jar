import {View, Text, ImageBackground, TouchableOpacity, Alert} from 'react-native';
import { ReturnButton } from "@/app/components/returnButton";
import {useLocalSearchParams} from "expo-router";
import {getImportantDates, deleteImportantDateItem, addImportantDate, updateImportantDate} from "@/lib/supabase";
import { useEffect, useState } from "react";
import DateFrame from "@/app/components/dateFrame";
import SquareButton from "@/app/components/squareButton";
import SwipeableImportantDates from "@/app/components/swipeableImportantDates";
import AddImportantDateModal from "@/app/components/addImportantDateModal";
import EditImportantDateModal from "@/app/components/editImportantDateModal";

export default function TheDates() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [dateList, setDateList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleAddDate = async (event: string, date: string) => {
        try {
            console.log('newItem:', event, date);
            const newItem = await addImportantDate(roomName, date, event);
            await fetchData();
        } catch (error) {
            console.error('Error adding important date:', error);
        }
    };

    const handleEditDate = async (event: string, date: string) => {
        if (!selectedItem) return;
        try {
            await updateImportantDate(selectedItem.id, event, date);
            await fetchData();
            setEditModalVisible(false);
            setSelectedItem(null);
            Alert.alert("Success", "Date updated successfully!");
        } catch (error) {
            console.error('Error updating important date:', error);
            Alert.alert("Error", "Failed to update date");
        }
    };

    const handleEditPress = (item: any) => {
        setSelectedItem(item);
        setEditModalVisible(true);
    };

    const fetchData = async () => {
        if (!roomName) {
            setLoading(false);
            return;
        }
        try {
            const importantDates = await getImportantDates(roomName);
            setDateList(importantDates);
        } catch (error) {
            console.error("Error fetching importantDates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [roomName]);

    const handleDelete = async (itemId: string) => {
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
                            await deleteImportantDateItem(itemId);
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
                source={require('@/assets/images/the-dates.png')}
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
        <ImageBackground source={require('@/assets/images/the-dates.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 justify-start p-4 mt-25">

                <Text className="text-white mb-2 font-artistic text-[60px] text-center">
                    Important Dates
                </Text>

                <View className="flex-column gap-3">
                    <View className="bg-white/20 rounded-lg overflow-hidden">
                        <View className="flex-row bg-red">
                            <Text className="flex-4 py-2 text-center text-white text-[16px]">Event</Text>
                            <Text className="flex-2 py-2 text-center text-white text-[16px]">Date</Text>
                            <Text className="flex-2 py-2 text-center text-white text-[16px]">Count</Text>
                        </View>

                        {dateList.length > 0 ? (
                            dateList.map((item, index) => (
                                <SwipeableImportantDates
                                    key={item.id || index}
                                    event={item.event}
                                    date={item.date}
                                    count={item.count}
                                    onDelete={() => handleDelete(item.id)}
                                    onEdit={() => handleEditPress(item)}
                                    color="bg-white"
                                />
                            ))
                        ) : (
                            <View className="py-8">
                                <Text className="text-white text-center opacity-80">
                                    Don't forget to write down the dates of love
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View className="flex-row justify-end mb-4 mt-2">
                    <SquareButton iconSource={require('@/assets/icons/plus.png')} onPress={() => setModalVisible(true)} />
                </View>
            </View>

            <AddImportantDateModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddDate}
                roomName={roomName || ''}
            />

            {selectedItem && (
                <EditImportantDateModal
                    visible={editModalVisible}
                    onClose={() => {
                        setEditModalVisible(false);
                        setSelectedItem(null);
                    }}
                    onSave={handleEditDate}
                    initialEvent={selectedItem.event}
                    initialDate={selectedItem.date}
                    itemId={selectedItem.id}
                />
            )}

            <ReturnButton />
        </ImageBackground>
    );
}