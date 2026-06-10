import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install'
import {Alert} from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

export async function createUser(user: any) {
    console.log('user:', user)
        const { data, error } = await supabase
            .from('users')
            .upsert({
                clerk_id: user.id,
                email: user.email,
                name: user.name
            }, {
                onConflict: 'clerk_id',
                ignoreDuplicates: false,
            })
            .select()
            .single();

        if (error) {
            console.error('createUser() error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }
        return data;
}

export async function createRoom(user: any, roomName: string, password: string) {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const { data: connectionData, error: connectionError } = await supabase
        .from('connections')
        .upsert({
            room_name: roomName,
            creator: user,
            password: password,
        }, {
            onConflict: 'room_name',
            ignoreDuplicates: false,
        })
        .select()
        .single();

    if (connectionError) {
        console.error('createRoom() connection error:', {
            code: connectionError.code,
            message: connectionError.message,
            details: connectionError.details,
            hint: connectionError.hint
        });
        throw connectionError;
    }

    const { data: dateData, error: dateError } = await supabase
        .from('dates')
        .insert({
            room_name: roomName,
            date: today,
            event: "Start Dating"
        })
        .select()
        .single();

    if (dateError) {
        console.error('createRoom() date error:', {
            code: dateError.code,
            message: dateError.message,
            details: dateError.details,
            hint: dateError.hint
        });

        await supabase
            .from('connections')
            .delete()
            .eq('room_name', roomName);

        throw dateError;
    }

    return {
        connection: connectionData,
        startDate: dateData
    };
}

export async function checkRoom(user: any, roomName: string, password: string) {
        const { data, error } = await supabase
            .from('connections')
            .select('creator, joiner, room_name')
            .eq('room_name', roomName)
            .eq('password', password)
            .maybeSingle();

        if (error) {
            console.error('checkRoom() error:', error);
            throw error;
        }

        if (!data) {
            console.log('Index not found or incorrect password');
            throw new Error('Invalid room name or password');
        }

        if (data.creator === user || data.joiner === user) {
            return data;
        } else {
            console.log('User does not have access to this room');
            Alert.alert("Please input correct room credentials");
            throw error;
        }
}

export async function checkDates(roomName: string) {
        const { data, error } = await supabase
            .from('dates')
            .select('date')
            .eq('room_name', roomName)
            .eq('event', 'Start Dating')
            .maybeSingle();

        if (error) {
            console.error('checkDates() error:', error);
            throw error
        }
        return data;
}

export async function checkUser(roomName: string) {
        const { data, error } = await supabase
            .from('connections')
            .select('creator, joiner')
            .eq('room_name', roomName)
            .maybeSingle();

        if (error) {
            console.error('checkUser() error:', error);
            throw error;
        }

        let creator = null;
        let joiner = null;

        if (data && data.creator) {
            const { data: creatorData, error: creatorError } = await supabase
                .from('users')
                .select('name')
                .eq('clerk_id', data.creator)
                .maybeSingle();

            if (creatorError) {
                console.error('checkUser() Creator fetch error:', creatorError);
            } else {
                creator = creatorData;
            }
        }

        if (data && data.joiner) {
            const { data: joinerData, error: joinerError } = await supabase
                .from('users')
                .select('name')
                .eq('clerk_id', data.joiner)
                .maybeSingle();

            if (joinerError) {
                console.error('checkUser() Joiner fetch error:', joinerError);
            } else {
                joiner = joinerData;
            }
        }

        return { creator, joiner };
}

export async function checkExistingUser(email: string) {
        const { data, error } = await supabase
            .from('users')
            .select('name, clerk_id')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            console.error('checkExistingUser() error:', error);
            throw error;
        }

        if (data) {
            return { data };
        }
}

export async function addPartner(userId: string, roomName: string) {
        const { data, error } = await supabase
            .from('connections')
            .update({ joiner: userId })
            .eq('room_name', roomName)
            .select();

        if (error) {
            console.error('addPartner() error:', error);
            throw error;
        }
        return data;
}

export async function getReviewStatus(roomName: string) {
        const { data, error } = await supabase
            .from('review')
            .select('id, date, creator_status, joiner_status')
            .eq('room_name', roomName)
            .order('date', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return data?.map(item => ({
            ...item,
            date: formatDateToYYYYMMDD(item.date)
        })) || [];
}

function formatDateToYYYYMMDD(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

const convertToISODate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

export async function getReviewByDate(roomName: string, date: string) {
        const isoDate = convertToISODate(date);
        const { data, error } = await supabase
            .from('review')
            .select('creator_content, joiner_content')
            .eq('room_name', roomName)
            .gte('created_at', `${isoDate}T00:00:00Z`)
            .lte('created_at', `${isoDate}T23:59:59Z`);
        if (error) {
            console.error('getReviewByDate() error:', error);
            throw error;
        }
        return data;
}

export const updateReviewByDate = async (roomName: string, date: string, content: string, identity: string) => {
    const isoDate = convertToISODate(date);
    const { data, error } = await supabase
        .from('review')
        .update({
            [`${identity}_content`]: content,
            [`${identity}_status`]: 'done'
        })
        .eq('room_name', roomName)
        .gte('created_at', `${isoDate}T00:00:00Z`)
        .lte('created_at', `${isoDate}T23:59:59Z`)
        .select();
    if (error) {
        console.error('updateReviewByDate() error:', error);
        throw error;
    }
    return data;
};

export async function checkIdentity(roomName: string, userId: string) {
        const { data, error } = await supabase
            .from('connections')
            .select('creator, joiner')
            .eq('room_name', roomName)

        if (error) {
            console.error('checkIdentity() error:', error);
            throw error;
        }
        let identity = '';
        if (data[0].creator === userId) {
            identity = 'creator';
        } else if (data[0].joiner === userId) {
            identity = 'joiner';
        }
        return identity;
}

export async function getTravelList(roomName: string, group: string) {
    const { data, error } = await supabase
        .from('travel')
        .select('id, date_start, date_end, destination')
        .eq('room_name', roomName)
        .eq('group', group)
        .order('date_start', { ascending: false });
    if (error) {
        console.error('getTravelList() error:', error);
        throw error;
    }
    return data?.map(item => ({
        ...item,
        date_start: formatDateToYYYYMMDD(item.date_start),
        date_end: formatDateToYYYYMMDD(item.date_end)
    })) || [];
}

export async function deleteTravelItem(itemId: string) {
    const { error } = await supabase
        .from('travel')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting travel item:', error);
        throw error;
    }
    return true;
}

export async function getUserCurrentRoom(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('current_room')
        .eq('clerk_id', userId)

    if (error) {
        console.error('getUserCurrentRoom() error:', error);
        throw error;
    }
    return data;
}

export async function deleteUserCurrentRoom(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .update({ current_room: null })
        .eq('clerk_id', userId)
        .select();

    if (error) {
        console.error('deleteUserCurrentRoom() error:', error);
        throw error;
    }
    return data;
}

export async function saveUserCurrentRoom(room: string, userId: string) {
    const { data, error } = await supabase
        .from('users')
        .update({ current_room: room })
        .eq('clerk_id', userId)
        .select();

    if (error) {
        console.error('saveUserCurrentRoom() error:', error);
        throw error;
    }
    return data;
}

interface AddDestinationProps {
    room: string;
    group: string;
    destination: string;
    date_start: string;
    date_end: string;
}

export async function addDestination(props: AddDestinationProps) {
    const { room, group, destination, date_start, date_end } = props;

    const { data, error } = await supabase
        .from('travel')
        .insert([{
            room_name: room,
            group: group,
            destination: destination,
            date_start: date_start,
            date_end: date_end
        }])
        .select();

    if (error) {
        console.error('addDestination() error:', error);
        throw error;
    }
    return data;
}

export async function getImportantDates(room: string) {
    const { data, error } = await supabase
        .from('dates')
        .select('id, date, event')
        .eq('room_name', room)
        .order('date', { ascending: true });

    if (error) {
        console.error('getImportantDates error:', error);
        throw error;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data?.map(item => {
        const formattedDate = formatDateToYYYYMMDD(item.date);
        const targetDate = new Date(item.date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - targetDate.getTime();
        const daysFromToday = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return {
            ...item,
            date: formattedDate,
            count: daysFromToday
        };
    }) || [];
}

export async function deleteImportantDateItem(itemId: string) {
    const { data: item, error: fetchError } = await supabase
        .from('dates')
        .select('event')
        .eq('id', itemId)
        .single();

    if (fetchError) {
        console.error('Error fetching item:', fetchError);
        throw fetchError;
    }

    if (item?.event === 'Start Dating') {
        Alert.alert(
            'Cannot Delete',
            'This event cannot be deleted as it marks the beginning of your journey.',
            [{ text: 'OK' }]
        );
        return;
    }

    const { error } = await supabase
        .from('dates')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('Error deleting travel item:', error);
        throw error;
    }

    return true;
}

export async function addImportantDate(room: string, date: string, event: string) {
    const { data, error } = await supabase
        .from('dates')
        .insert([{
            room_name: room,
            event: event,
            date: date,
        }])
        .select();

    if (error) {
        console.error('addImportantDate() error:', error);
        throw error;
    }
    return data;
}

export async function getMoments(room: string) {
    const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('room_name', room)
        .order('date', { ascending: false });
    if (error) {
        console.error('addImportantDate() error:', error);
        throw error;
    }
    return data;
}

export const updateImportantDate = async (id: string, event: string, date: string) => {
    const { data, error } = await supabase
        .from('important_dates') // Replace with your actual table name
        .update({ event, date })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating important date:', error);
        throw error;
    }
    return data;
};

export interface RosterProps {
    id: string;
    room_name: string;
    month_date: string;
    image_url: string;
    created_at: string;
    updated_at: string;
}

export const getRosters = async (roomName: string) => {
    const { data, error } = await supabase
        .from('roster')
        .select('*')
        .eq('room_name', roomName)
        .order('month_date', { ascending: true });

    if (error) {
        console.error('Error fetching rosters:', error);
        throw error;
    }
    return data;
};

// Add or update photo for a month
export const upsertRoster = async (roomName: string, monthDate: string, imageUrl: string) => {
    const { data, error } = await supabase
        .from('roster')
        .upsert({
            room_name: roomName,
            month_date: monthDate,
            image_url: imageUrl,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'room_name,month_date'
        })
        .select();

    if (error) {
        console.error('Error upsertRoster:', error);
        throw error;
    }
    return data;
};

// Delete photo for a month
export const deleteRoster = async (roomName: string, monthDate: string) => {
    const { error } = await supabase
        .from('roster')
        .delete()
        .eq('room_name', roomName)
        .eq('month_date', monthDate);

    if (error) {
        console.error('Error deleteRoster:', error);
        throw error;
    }
};