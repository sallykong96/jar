// app/roster.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ReturnButton } from '@/app/components/returnButton';
import { getRosters, upsertRoster, deleteRoster, supabase } from '@/lib/supabase';
import AddRosterModal from '@/app/components/addRosterModal';

interface RosterItem {
    id: string;
    room_name: string;
    month_date: string;
    image_url: string;
}

interface MonthData {
    date: string;
    name: string;
    roster: RosterItem | null;
}

export default function Roster() {
    const { roomName } = useLocalSearchParams<{ roomName: string }>();
    const [loading, setLoading] = useState(true);
    const [rosters, setRosters] = useState<RosterItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null);
    const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

    // Generate months from June 2026 to 2 months ahead of current month
    const generateMonthsList = () => {
        const startDate = new Date(2026, 5, 1); // June 1, 2026
        const currentDate = new Date();
        const twoMonthsAhead = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

        const monthsList: MonthData[] = [];
        let current = new Date(startDate);

        while (current <= twoMonthsAhead) {
            const year = current.getFullYear();
            const month = current.getMonth();
            const monthName = current.toLocaleString('default', { month: 'long' });
            const monthDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;

            monthsList.push({
                date: monthDate,
                name: `${monthName} ${year}`,
                roster: null
            });

            current.setMonth(current.getMonth() + 1);
        }

        // Return in descending order (most recent first)
        return monthsList.reverse();
    };

    // Fetch rosters from database
    const fetchRosters = async () => {
        if (!roomName) return;

        try {
            setLoading(true);
            const rosterList = await getRosters(roomName);
            console.log('Fetched rosters:', rosterList);
            setRosters(rosterList || []);
        } catch (error) {
            console.error('Error fetching rosters:', error);
            Alert.alert('Error', 'Failed to load rosters');
        } finally {
            setLoading(false);
        }
    };

    // Add or update roster - FIXED: Accept both imageUrl and monthDate
    const handleAddRoster = async (imageUrl: string, monthDate: string) => {
        try {
            console.log('=== Starting handleAddRoster ===');
            console.log('Room name:', roomName);
            console.log('Month date:', monthDate);
            console.log('Image URL length:', imageUrl.length);
            console.log('Is base64?', imageUrl.substring(0, 30));

            // Check if roomName exists
            if (!roomName) {
                throw new Error('Room name is missing');
            }

            // Check if monthDate is valid
            if (!monthDate) {
                throw new Error('Month date is missing');
            }

            // Check if imageUrl exists
            if (!imageUrl) {
                throw new Error('Image URL is missing');
            }

            const { data, error } = await supabase
                .from('roster')
                .upsert({
                    room_name: roomName,
                    image_url: imageUrl,
                    month_date: monthDate,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'room_name,month_date'
                })
                .select();

            if (error) {
                console.error('Supabase error details:', error);
                throw new Error(`Supabase error: ${error.message}`);
            }

            console.log('Upsert successful:', data);
            await fetchRosters();
            Alert.alert('Success', 'Roster added successfully!');
        } catch (error: any) {
            console.error('Error adding roster:', error);
            console.error('Error stack:', error.stack);
            Alert.alert('Error', error.message || 'Failed to add roster');
            throw error;
        }
    };

    // Handle month click - shows image if exists, otherwise opens add modal
    const handleMonthPress = (month: MonthData) => {
        if (month.roster) {
            // If photo exists, show it in full screen
            setSelectedImageUrl(month.roster.image_url);
            setViewImageModalVisible(true);
        } else {
            // If no photo, open add modal
            setSelectedMonth(month);
            setModalVisible(true);
        }
    };

    // Combine months with rosters
    const getMonthsWithRosters = () => {
        const allMonths = generateMonthsList();

        return allMonths.map(month => {
            const existingRoster = rosters.find(roster => roster.month_date === month.date);
            return {
                ...month,
                roster: existingRoster || null
            };
        });
    };

    useEffect(() => {
        fetchRosters();
    }, [roomName]);

    if (loading) {
        return (
            <ImageBackground
                source={require('@/assets/images/roster.png')}
                className="flex-1 w-full h-full"
                resizeMode="cover"
            >
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text className="text-white mt-4">Loading rosters...</Text>
                </View>
            </ImageBackground>
        );
    }

    const monthsData = getMonthsWithRosters();

    return (
        <ImageBackground source={require('@/assets/images/roster.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 p-4 mt-25">
                <Text className="text-black mb-4 font-artistic text-[60px] text-center">
                    Roster
                </Text>

                <FlatList
                    data={monthsData}
                    keyExtractor={(item) => item.date}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => handleMonthPress(item)}
                            className="bg-white/80 rounded-2xl mb-3 overflow-hidden border border-gray-200 shadow-sm"
                        >
                            <View className="flex-row p-2 items-center">
                                {/* Month info */}
                                <View className="flex-1">
                                    <Text className="text-black text-lg font-semibold">
                                        {item.name}
                                    </Text>
                                </View>

                                {/* Photo thumbnail or placeholder */}
                                <View className="ml-3">
                                    {item.roster ? (
                                        <Image
                                            source={{ uri: item.roster.image_url }}
                                            className="w-12 h-12 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-12 h-12 bg-white/20 rounded-lg justify-center items-center">
                                            <Text className="text-2xl">+</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            </View>

            {/* Add/Edit Modal - FIXED: Pass monthName and monthDate */}
            {selectedMonth && (
                <AddRosterModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedMonth(null);
                    }}
                    onSave={handleAddRoster}
                    monthName={selectedMonth.name}
                    monthDate={selectedMonth.date}  // This passes the selected month's date
                />
            )}

            {/* Full Screen Image View Modal */}
            <Modal
                visible={viewImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setViewImageModalVisible(false)}
            >
                <View className="flex-1 bg-black/95 justify-center items-center">
                    <TouchableOpacity
                        className="absolute top-12 right-5 z-10 bg-black/50 rounded-full p-2"
                        onPress={() => setViewImageModalVisible(false)}
                    >
                        <Text className="text-white text-2xl">✕</Text>
                    </TouchableOpacity>

                    <Image
                        source={{ uri: selectedImageUrl }}
                        className="w-full h-full"
                        resizeMode="contain"
                    />

                    <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-4">
                        <TouchableOpacity
                            className="bg-navy px-6 py-3 rounded-full"
                            onPress={() => {
                                setViewImageModalVisible(false);
                                // Find the month and open edit modal
                                const month = monthsData.find(m => m.roster?.image_url === selectedImageUrl);
                                if (month) {
                                    setSelectedMonth(month);
                                    setModalVisible(true);
                                }
                            }}
                        >
                            <Text className="text-white font-semibold">Change Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-red px-6 py-3 rounded-full"
                            onPress={() => {
                                setViewImageModalVisible(false);
                                // Find the month and delete
                                const month = monthsData.find(m => m.roster?.image_url === selectedImageUrl);
                                if (month && month.roster) {
                                    Alert.alert(
                                        'Delete Photo',
                                        'Are you sure you want to delete this photo?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Delete',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    try {
                                                        await deleteRoster(roomName, month.date);
                                                        await fetchRosters();
                                                        Alert.alert('Success', 'Photo deleted successfully!');
                                                    } catch (error) {
                                                        console.error('Error deleting:', error);
                                                        Alert.alert('Error', 'Failed to delete photo');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            }}
                        >
                            <Text className="text-white font-semibold">Delete Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ReturnButton />
        </ImageBackground>
    );
}