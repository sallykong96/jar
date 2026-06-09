import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useCallback, memo } from 'react';

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
        day: today.getDate(),
        dateString: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    };
};

// Format date to YYYY-MM-DD
const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Parse date string to Date object
const parseDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Check if a date is between start and end dates
const isBetween = (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
};

// Calendar Component for Range Selection
const CalendarRangeModal = memo(({
                                     onConfirm,
                                     onCancel,
                                     initialStartDate,
                                     initialEndDate
                                 }: {
    onConfirm: (startDate: string, endDate: string) => void;
    onCancel: () => void;
    initialStartDate: string;
    initialEndDate: string;
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(initialStartDate || '');
    const [endDate, setEndDate] = useState(initialEndDate || '');
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handleDateSelect = (year: number, month: number, day: number) => {
        const selectedDate = formatDate(year, month, day);

        if (selecting === 'start') {
            setStartDate(selectedDate);
            setEndDate('');
            setSelecting('end');
        } else {
            if (parseDate(selectedDate) >= parseDate(startDate)) {
                setEndDate(selectedDate);
            } else {
                setStartDate(selectedDate);
                setEndDate(startDate);
            }
            setSelecting('start');
        }
    };

    const isInRange = (date: Date) => {
        if (!startDate || !endDate) return false;
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        return date > start && date < end;
    };

    const isStartDate = (year: number, month: number, day: number) => {
        if (!startDate) return false;
        return formatDate(year, month, day) === startDate;
    };

    const isEndDate = (year: number, month: number, day: number) => {
        if (!endDate) return false;
        return formatDate(year, month, day) === endDate;
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        // Header row with unique keys
        const headerRow = (
            <View key="weekday-header-row" className="flex-row justify-center mb-2">
                {weekDays.map((day, index) => (
                    <View key={`header-${day}-${index}`} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                        <Text className="text-xs text-gray-500 font-semibold">{day}</Text>
                    </View>
                ))}
            </View>
        );

        // Build all calendar cells
        const allCells = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            allCells.push({
                id: `empty-start-${year}-${month}-${i}`,
                type: 'empty',
                day: null
            });
        }

        // Add actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateString = formatDate(year, month, day);
            const inRange = isInRange(currentDate);
            const isStart = isStartDate(year, month, day);
            const isEnd = isEndDate(year, month, day);
            const isToday = dateString === getToday().dateString;

            allCells.push({
                id: `day-${year}-${month}-${day}`,
                type: 'day',
                day: day,
                inRange: inRange,
                isStart: isStart,
                isEnd: isEnd,
                isToday: isToday
            });
        }

        // Fill remaining cells to complete 42 (6 rows x 7 columns)
        const totalNeeded = 42;
        const remaining = totalNeeded - allCells.length;
        for (let i = 0; i < remaining; i++) {
            allCells.push({
                id: `empty-end-${year}-${month}-${i}`,
                type: 'empty',
                day: null
            });
        }

        // Split into rows of 7
        const rows = [];
        for (let i = 0; i < allCells.length; i += 7) {
            const rowCells = allCells.slice(i, i + 7);
            const rowIndex = i / 7;

            rows.push(
                <View key={`calendar-row-${year}-${month}-${rowIndex}`} className="flex-row justify-center">
                    {rowCells.map((cell, colIndex) => {
                        if (cell.type === 'empty') {
                            return <View key={cell.id} style={{ width: 40, height: 40 }} />;
                        }
                        const dayValue = cell.day as number;
                        let rangeStyle = '';
                        if (cell.inRange && !cell.isStart && !cell.isEnd) {
                            rangeStyle = 'bg-orange-200';
                        }

                        let borderStyle = '';
                        if (cell.isStart && cell.isEnd) {
                            borderStyle = 'bg-navy rounded-full';
                        } else if (cell.isStart) {
                            borderStyle = 'bg-navy rounded-l-full';
                        } else if (cell.isEnd) {
                            borderStyle = 'bg-navy rounded-r-full';
                        }

                        return (
                            <TouchableOpacity
                                key={cell.id}
                                onPress={() => handleDateSelect(year, month, dayValue )}
                                style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
                                className={rangeStyle}
                            >
                                <View className={`w-10 h-10 justify-center items-center ${borderStyle}`}>
                                    <Text className={`text-center ${
                                        cell.isStart || cell.isEnd ? 'text-white font-bold' :
                                            cell.isToday ? 'text-orange-500 font-bold' : 'text-gray-700'
                                    }`}>
                                        {cell.day}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }

        return (
            <View>
                {headerRow}
                {rows}
            </View>
        );
    };

    const changeMonth = (increment: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const handleConfirm = () => {
        if (!startDate) {
            Alert.alert('Error', 'Please select a start date');
            return;
        }
        onConfirm(startDate, endDate);
    };

    const clearSelection = () => {
        setStartDate('');
        setEndDate('');
        setSelecting('start');
    };

    return (
        <Modal transparent={true} animationType="slide" visible={true}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-lg p-4 w-11/12">
                    <Text className="text-xl font-bold mb-2 text-center">Select Date Range</Text>

                    {/* Selection Status */}
                    <View className="flex-row justify-between items-center mb-4 px-2">
                        <View className="flex-1 items-center">
                            <Text className="text-xs text-gray-500">Start Date</Text>
                            <Text className={`font-semibold ${startDate ? 'text-navy' : 'text-gray-400'}`}>
                                {startDate || 'Not selected'}
                            </Text>
                        </View>
                        <Text className="text-xl text-gray-400">→</Text>
                        <View className="flex-1 items-center">
                            <Text className="text-xs text-gray-500">End Date</Text>
                            <Text className={`font-semibold ${endDate ? 'text-navy' : 'text-gray-400'}`}>
                                {endDate || 'Not selected'}
                            </Text>
                        </View>
                        {(startDate || endDate) && (
                            <TouchableOpacity onPress={clearSelection} className="ml-2">
                                <Text className="text-red-500 text-xs">Clear</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Month Navigation */}
                    <View className="flex-row justify-between items-center mb-4 px-4">
                        <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
                            <Text className="text-2xl text-gray-600">←</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
                            <Text className="text-2xl text-gray-600">→</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Calendar Grid */}
                    <View className="items-center">
                        {renderCalendar()}
                    </View>

                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity className="flex-1 bg-gray-300 py-3 rounded-lg" onPress={onCancel}>
                            <Text className="text-center font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-navy py-3 rounded-lg"
                            onPress={handleConfirm}
                        >
                            <Text className="text-white text-center font-semibold">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

CalendarRangeModal.displayName = 'CalendarRangeModal';

export function AddDestinationModal({ visible, onClose, onSave, roomName }: AddDestinationModalProps) {
    const [destination, setDestination] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [group, setGroup] = useState<'go' | 'been'>('go');

    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateConfirm = useCallback((startDate: string, endDate: string) => {
        setDateStart(startDate);
        setDateEnd(endDate);
        setShowDatePicker(false);
    }, []);

    const handleSave = useCallback(() => {
        // Validate destination
        if (!destination.trim()) {
            Alert.alert('Missing Information', 'Please enter a destination');
            return;
        }

        // Validate start date
        if (!dateStart) {
            Alert.alert('Missing Information', 'Please select a start date');
            return;
        }

        // Validate end date (optional but show warning if not provided)
        if (!dateEnd) {
            Alert.alert('Missing Information', 'Please select an end date');
            return;
        }

        // Validate that end date is after start date
        if (dateStart && dateEnd) {
            const start = parseDate(dateStart);
            const end = parseDate(dateEnd);
            if (end < start) {
                Alert.alert('Invalid Date Range', 'End date must be after start date');
                return;
            }
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateStart && !dateRegex.test(dateStart)) {
            Alert.alert('Invalid Date', 'Start date format is invalid');
            return;
        }
        if (dateEnd && !dateRegex.test(dateEnd)) {
            Alert.alert('Invalid Date', 'End date format is invalid');
            return;
        }

        onSave(destination, dateStart, dateEnd, group);

        // Reset form
        setDestination('');
        setDateStart('');
        setDateEnd('');
        setGroup('go');
        onClose();
    }, [destination, dateStart, dateEnd, group, onSave, onClose]);

    const formatDisplayDate = (date: string) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    };

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
                    <View className="bg-navy rounded-lg p-6 w-11/12 max-w-md">
                        <Text className="text-2xl font-bold mb-4 text-center text-white">Add Destination</Text>

                        {/* Trip Type */}
                        <View className="mb-3">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-lg ${group === 'go' ? 'bg-orange' : 'bg-white/10'}`}
                                    onPress={() => setGroup('go')}
                                >
                                    <Text className="text-center text-white">
                                        Go To
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 py-2 rounded-lg ${group === 'been' ? 'bg-orange' : 'bg-white/10'}`}
                                    onPress={() => setGroup('been')}
                                >
                                    <Text className="text-center text-white">
                                        Been To
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Destination */}
                        <View className="flex-row items-center mb-3">
                            <TextInput
                                className="flex-1 bg-white/10 rounded-lg p-3"
                                placeholder="Destination"
                                placeholderTextColor="#999"
                                value={destination}
                                onChangeText={setDestination}
                            />
                        </View>

                        {/* Date Range Selector */}
                        <View className="mb-4">
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="bg-white/10 rounded-lg p-3"
                            >
                                <Text className={dateStart ? "text-black" : "text-gray-400"}>
                                    {dateStart ? `${formatDisplayDate(dateStart)} - ${dateEnd ? formatDisplayDate(dateEnd) : '...'}` : "Select Date Range"}
                                </Text>
                            </TouchableOpacity>
                            {(dateStart || dateEnd) && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setDateStart('');
                                        setDateEnd('');
                                    }}
                                    className="mt-1 self-end"
                                >
                                    <Text className="text-red-500 text-xs">Clear</Text>
                                </TouchableOpacity>
                            )}
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

            {/* Date Range Calendar Picker */}
            {showDatePicker && (
                <CalendarRangeModal
                    onConfirm={handleDateConfirm}
                    onCancel={() => setShowDatePicker(false)}
                    initialStartDate={dateStart}
                    initialEndDate={dateEnd}
                />
            )}
        </>
    );
}