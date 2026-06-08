import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useCallback, memo, useEffect, useRef as useRefReact } from 'react';

interface AddDestinationModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (destination: string, dateStart: string, dateEnd: string, group: 'go' | 'been') => void;
    roomName: string;
}

// Helper function to get today's date components
const getToday = () => {
    const today = new Date();
    return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
    };
};

const DatePickerModal = memo(({
                                  onConfirm,
                                  onCancel,
                                  initialYear,
                                  initialMonth,
                                  initialDay
                              }: {
    onConfirm: (year: number, month: number, day: number) => void;
    onCancel: () => void;
    initialYear: number;
    initialMonth: number;
    initialDay: number;
}) => {
    const [tempYear, setTempYear] = useState(initialYear || getToday().year);
    const [tempMonth, setTempMonth] = useState(initialMonth || getToday().month);
    const [tempDay, setTempDay] = useState(initialDay || getToday().day);

    // Refs for scroll views
    const yearScrollRef = useRefReact<ScrollView>(null);
    const monthScrollRef = useRefReact<ScrollView>(null);
    const dayScrollRef = useRefReact<ScrollView>(null);

    const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Calculate the index of the selected item
    const getItemHeight = 40; // Approximate height of each item
    const getScrollPosition = (currentValue: number, list: number[]) => {
        const index = list.findIndex(item => item === currentValue);
        return index * getItemHeight;
    };

    // Auto-scroll to selected values when modal opens
    useEffect(() => {
        // Small delay to ensure ScrollView is rendered
        const timer = setTimeout(() => {
            const yearIndex = years.findIndex(y => y === tempYear);
            const monthIndex = months.findIndex(m => m === tempMonth);
            const dayIndex = days.findIndex(d => d === tempDay);

            if (yearScrollRef.current && yearIndex !== -1) {
                yearScrollRef.current.scrollTo({ y: yearIndex * getItemHeight, animated: true });
            }
            if (monthScrollRef.current && monthIndex !== -1) {
                monthScrollRef.current.scrollTo({ y: monthIndex * getItemHeight, animated: true });
            }
            if (dayScrollRef.current && dayIndex !== -1) {
                dayScrollRef.current.scrollTo({ y: dayIndex * getItemHeight, animated: true });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal transparent={true} animationType="slide" visible={true}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-lg p-6 w-11/12">
                    <Text className="text-xl font-bold mb-4 text-center">Select Date</Text>

                    <View className="flex-row gap-3 mb-4">
                        {/* Year Picker */}
                        <View className="flex-1">
                            <Text className="text-center text-gray-500 mb-2">Year</Text>
                            <ScrollView
                                ref={yearScrollRef}
                                className="h-40"
                                showsVerticalScrollIndicator={false}
                            >
                                {years.map(y => (
                                    <TouchableOpacity key={y} onPress={() => setTempYear(y)}>
                                        <View className={`py-3 ${y === tempYear ? 'bg-orange-100 rounded-lg' : ''}`}>
                                            <Text className={`text-center ${y === tempYear ? 'text-orange-500 font-bold text-lg' : 'text-gray-600'}`}>
                                                {y}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Month Picker */}
                        <View className="flex-1">
                            <Text className="text-center text-gray-500 mb-2">Month</Text>
                            <ScrollView
                                ref={monthScrollRef}
                                className="h-40"
                                showsVerticalScrollIndicator={false}
                            >
                                {months.map(m => (
                                    <TouchableOpacity key={m} onPress={() => setTempMonth(m)}>
                                        <View className={`py-3 ${m === tempMonth ? 'bg-orange-100 rounded-lg' : ''}`}>
                                            <Text className={`text-center ${m === tempMonth ? 'text-orange-500 font-bold text-lg' : 'text-gray-600'}`}>
                                                {m}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Day Picker */}
                        <View className="flex-1">
                            <Text className="text-center text-gray-500 mb-2">Day</Text>
                            <ScrollView
                                ref={dayScrollRef}
                                className="h-40"
                                showsVerticalScrollIndicator={false}
                            >
                                {days.map(d => (
                                    <TouchableOpacity key={d} onPress={() => setTempDay(d)}>
                                        <View className={`py-3 ${d === tempDay ? 'bg-orange-100 rounded-lg' : ''}`}>
                                            <Text className={`text-center ${d === tempDay ? 'text-orange-500 font-bold text-lg' : 'text-gray-600'}`}>
                                                {d}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity className="flex-1 bg-gray-300 py-3 rounded-lg" onPress={onCancel}>
                            <Text className="text-center font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-navy py-3 rounded-lg"
                            onPress={() => onConfirm(tempYear, tempMonth, tempDay)}
                        >
                            <Text className="text-white text-center font-semibold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

DatePickerModal.displayName = 'DatePickerModal';

export function AddDestinationModal({ visible, onClose, onSave, roomName }: AddDestinationModalProps) {
    const [destination, setDestination] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [group, setGroup] = useState<'go' | 'been'>('go');

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Set default values to today's date
    const today = getToday();
    const [startPickerInitial, setStartPickerInitial] = useState({
        year: today.year,
        month: today.month,
        day: today.day
    });
    const [endPickerInitial, setEndPickerInitial] = useState({
        year: today.year,
        month: today.month,
        day: today.day
    });

    const formatDate = (year: number, month: number, day: number) => {
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleStartDateSelect = useCallback((year: number, month: number, day: number) => {
        const date = formatDate(year, month, day);
        setDateStart(date);
        setShowStartPicker(false);
    }, []);

    const handleEndDateSelect = useCallback((year: number, month: number, day: number) => {
        const date = formatDate(year, month, day);
        setDateEnd(date);
        setShowEndPicker(false);
    }, []);

    const openStartPicker = useCallback(() => {
        let year, month, day;

        if (dateStart) {
            const currentDate = dateStart.split('-');
            year = parseInt(currentDate[0]);
            month = parseInt(currentDate[1]);
            day = parseInt(currentDate[2]);
        } else {
            // Use today's date if no date selected yet
            const todayDate = getToday();
            year = todayDate.year;
            month = todayDate.month;
            day = todayDate.day;
        }

        setStartPickerInitial({ year, month, day });
        setShowStartPicker(true);
    }, [dateStart]);

    const openEndPicker = useCallback(() => {
        let year, month, day;

        if (dateEnd) {
            const currentDate = dateEnd.split('-');
            year = parseInt(currentDate[0]);
            month = parseInt(currentDate[1]);
            day = parseInt(currentDate[2]);
        } else {
            // Use today's date if no date selected yet
            const todayDate = getToday();
            year = todayDate.year;
            month = todayDate.month;
            day = todayDate.day;
        }

        setEndPickerInitial({ year, month, day });
        setShowEndPicker(true);
    }, [dateEnd]);

    const handleSave = useCallback(() => {
        if (!destination.trim()) {
            Alert.alert('Error', 'Please enter a destination');
            return;
        }
        if (!dateStart) {
            Alert.alert('Error', 'Please select a start date');
            return;
        }

        onSave(destination, dateStart, dateEnd, group);

        setDestination('');
        setDateStart('');
        setDateEnd('');
        setGroup('go');
        onClose();
    }, [destination, dateStart, dateEnd, group, onSave, onClose]);

    return (
        <>
            {/* Main Modal */}
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
                        <Text className="text-2xl font-bold mb-4 text-center">Add Destination</Text>

                        {/* Trip Type - Full width */}
                        <View className="mb-3">
                            <View className="flex-row gap-3">
                                <Text className="text-gray-700 w-24 mb-2 font-semibold">Trip Type:</Text>
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-lg ${group === 'go' ? 'bg-navy' : 'bg-gray-300'}`}
                                    onPress={() => setGroup('go')}
                                >
                                    <Text className={`text-center ${group === 'go' ? 'text-white' : 'text-black'}`}>
                                        Go To
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-lg ${group === 'been' ? 'bg-navy' : 'bg-gray-300'}`}
                                    onPress={() => setGroup('been')}
                                >
                                    <Text className={`text-center ${group === 'been' ? 'text-white' : 'text-black'}`}>
                                        Been To
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Destination - Label on left, input takes rest */}
                        <View className="flex-row items-center mb-3">
                            <Text className="text-gray-700 font-semibold w-24">Destination:</Text>
                            <TextInput
                                className="flex-1 border border-gray-300 rounded-lg p-3"
                                placeholder="Destination"
                                placeholderTextColor="#999"
                                value={destination}
                                onChangeText={setDestination}
                            />
                        </View>

                        {/* Start Date - Label on left, button takes rest */}
                        <View className="flex-row items-center mb-3">
                            <Text className="text-gray-700 font-semibold w-24">Start Date:</Text>
                            <TouchableOpacity
                                onPress={openStartPicker}
                                className="flex-1 border border-gray-300 rounded-lg p-3"
                            >
                                <Text className={dateStart ? "text-black" : "text-gray-400"}>
                                    {dateStart ? `${dateStart}` : "Select"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* End Date - Label on left, button takes rest */}
                        <View className="flex-row items-center mb-4">
                            <Text className="text-gray-700 font-semibold w-24">End Date:</Text>
                            <TouchableOpacity
                                onPress={openEndPicker}
                                className="flex-1 border border-gray-300 rounded-lg p-3"
                            >
                                <Text className={dateEnd ? "text-black" : "text-gray-400"}>
                                    {dateEnd ? `${dateEnd}` : "Select (Optional)"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Buttons */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-400 py-3 rounded-lg"
                                onPress={onClose}
                            >
                                <Text className="text-white text-center font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-red py-3 rounded-lg"
                                onPress={handleSave}
                            >
                                <Text className="text-white text-center font-semibold">Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showStartPicker && (
                <DatePickerModal
                    onConfirm={handleStartDateSelect}
                    onCancel={() => setShowStartPicker(false)}
                    initialYear={startPickerInitial.year}
                    initialMonth={startPickerInitial.month}
                    initialDay={startPickerInitial.day}
                />
            )}

            {showEndPicker && (
                <DatePickerModal
                    onConfirm={handleEndDateSelect}
                    onCancel={() => setShowEndPicker(false)}
                    initialYear={endPickerInitial.year}
                    initialMonth={endPickerInitial.month}
                    initialDay={endPickerInitial.day}
                />
            )}
        </>
    );
}