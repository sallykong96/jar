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
        const { data, error } = await supabase
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

        if (error) {
            console.error('createRoom() error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }
        return data;
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
            .select('met_date, start_dating')
            .eq('room_name', roomName)
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

// function formatDateToDDMMYYYY(date: string | Date): string {
//     const d = new Date(date);
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
// }

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