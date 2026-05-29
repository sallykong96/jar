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
            .select('creator, joiner')
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
        }
    } catch (err) {
        console.error('Caught error in checkRoom:', err);
        throw err;
    }
}