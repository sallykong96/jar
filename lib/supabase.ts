import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import 'expo-sqlite/localStorage/install'
import {Alert} from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key exists:', !!supabaseKey)

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

export async function createUser(user: any) {
    console.log('Creating user with data:', {
        clerk_id: user.id,
        email: user.email,
        name: user.name
    });

    try {
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
            console.error('Supabase error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }

        console.log('Supabase success:', data);
        return data;
    } catch (err) {
        console.error('Caught error in createUser:', err);
        throw err;
    }
}

export async function createRoom(user: any, roomName: string, password: string) {
    console.log('Creating room with data:', {
        user: user,
        roomName: roomName,
        password: password,
    });

    try {
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
            console.error('Supabase error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }

        console.log('Supabase success:', data);
        return data;
    } catch (err) {
        console.error('Caught error in createUser:', err);
        throw err;
    }
}

export async function checkRoom(user: any, roomName: string, password: string) {
    console.log('Checking room status:', {
        user: user,
        roomName: roomName,
        password: password,
    });

    try {
        const { data, error } = await supabase
            .from('connections')
            .select('creator, joiner, room_name')
            .eq('room_name', roomName)
            .eq('password', password)
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!data) {
            console.log('Index not found or incorrect password');
            throw new Error('Invalid room name or password');
        }

        if (data.creator === user || data.joiner === user) {
            console.log('checkRoom success:', data);
            return data;
        } else {
            console.log('User does not have access to this room');
            Alert.alert("Please input correct room credentials");
            throw error;
        }
    } catch (err) {
        console.error('Caught error in checkRoom:', err);
        throw err;
    }
}

export async function checkDates(roomName: string) {
    console.log('Checking dates for:', roomName);

    try {
        const { data, error } = await supabase
            .from('dates')
            .select('met_date, start_dating')
            .eq('room_name', roomName)
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            throw error
        }
        return data;
    } catch (err) {
        console.error('Caught error in checkDates:', err);
        throw err;
    }
}

export async function checkUser(roomName: string) {
    console.log('Checking user info:', roomName);

    try {
        const { data, error } = await supabase
            .from('connections')
            .select('creator, joiner')
            .eq('room_name', roomName)
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        console.log('data.creator:', data?.creator);
        // Declare variables outside the if blocks
        let creator = null;
        let joiner = null;

        if (data && data.creator) {
            const { data: creatorData, error: creatorError } = await supabase
                .from('users')
                .select('name')
                .eq('clerk_id', data.creator)
                .maybeSingle();

            if (creatorError) {
                console.error('Creator fetch error:', creatorError);
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
                console.error('Joiner fetch error:', joinerError);
            } else {
                joiner = joinerData;
            }
        }

        return { creator, joiner };

    } catch (err) {
        console.error('Caught error in checkUser:', err);
        throw err;
    }
}

export async function checkExistingUser(email: string) {
    console.log('checkExistingUser:', email);

    try {
        const { data, error } = await supabase
            .from('users')
            .select('name, clerk_id')
            .eq('email', email)
            .maybeSingle();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (data) {
            return { data };
        }

    } catch (err) {
        console.error('Caught error in checkExistingUser:', err);
        throw err;
    }
}

export async function addPartner(userId: string, roomName: string) {
    console.log('addPartner:', userId, roomName);

    try {
        const { data, error } = await supabase
            .from('connections')
            .update({ joiner: userId })
            .eq('room_name', roomName)
            .select();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('Partner added successfully:', data);
        return data;

    } catch (err) {
        console.error('Caught error in addPartner:', err);
        throw err;
    }
}

export async function getReviewStatus(roomName: string) {
    console.log('Checking status for:', roomName);

    try {
        const { data, error } = await supabase
            .from('review')
            .select('id, date, partner_status, own_status')
            .eq('room_name', roomName)
            .order('date', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        const formattedData = data?.map(item => ({
            ...item,
            date: formatDateToDDMMYYYY(item.date)
        })) || [];
        console.log('Retrieved records:', formattedData);
        return formattedData;
    } catch (err) {
        console.error('Caught error in getReviewStatus:', err);
        throw err;
    }
}

function formatDateToDDMMYYYY(date: string | Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
const convertToISODate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};
export async function getReviewByDate(roomName: string, date: string) {
    try {
        const isoDate = convertToISODate(date);
        const { data, error } = await supabase
            .from('review')
            .select('partner_content, own_content')
            .eq('room_name', roomName)
            .gte('created_at', `${isoDate}T00:00:00Z`)
            .lte('created_at', `${isoDate}T23:59:59Z`);

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log('data:', data);

        return data;
    } catch (err) {
        console.error('Caught error in getReviewByDate:', err);
        throw err;
    }
}