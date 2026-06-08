import {Alert, ImageBackground, Text, TextInput, TouchableOpacity, View} from "react-native";
import "@/global.css"
import {useState, useEffect} from "react";
import {createRoom, checkRoom, getUserCurrentRoom, saveUserCurrentRoom} from "@/lib/supabase";
import { useUser, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';


export default function Connect() {
    const [loading, setLoading] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'enter' | 'create'>('enter');
    const { user } = useUser();
    const { signOut } = useAuth();
    const [existRoom, setExistRoom] = useState('');

    useEffect(() => {
        const checkExistingRoom = async () => {
            if (!user) return;

            try {
                const currentRoom = await getUserCurrentRoom(user.id);

                if (currentRoom && currentRoom[0].current_room) {
                    router.replace(`/room/${currentRoom[0].current_room}`);
                }
            } catch (err) {
                console.log("Error checking current room:", err);
            }
        };

        checkExistingRoom();
    }, [user]);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (err: any) {
            console.error('Sign out error:', err);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const onCreate = async () => {
        setLoading(true);
        try {
            const newRoom = await createRoom(user? user.id:'', roomName, password );
            console.log("createRoom:", newRoom )
            router.push(`/room/${roomName}`);
        } catch (err: any) {
            console.log("onCreate catch err:", err )
        } finally {
            setLoading(false);
        }
    };

    const onEnter = async () => {
        setLoading(true);
        try {
            const existRoom = await checkRoom(user?.id || '', roomName, password);

            if (existRoom) {
                await saveUserCurrentRoom(roomName, user?.id || '');
                router.replace(`/room/${existRoom.room_name || roomName}`);
            } else {
                Alert.alert('Error', 'Room not found or incorrect password');
            }
        } catch (err: any) {
            console.error('onEnter error:', err);
            if (roomName === '' || password === '') {
                Alert.alert("Please input room credentials");
            } else {
                Alert.alert("Error", err.message || "Failed to enter room");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <Text className="text-8xl text-white font-artistic text-center mb-10 mt-40">
                {mode === 'enter' ? 'Enter a Room': 'Create a Room' }
            </Text>
            <View className="items-center">
            <TextInput
                className="auth-input"
                placeholder="Room Name"
                value={roomName}
                onChangeText={setRoomName}
            />

            <TextInput
                className="auth-input"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
                <TouchableOpacity className="auth-button" onPress={mode === 'enter' ? onEnter : onCreate} disabled={loading}>
                    <Text className="text-white opacity-80 text-[18px]">
                        {loading ? 'Please Wait...' : mode === 'enter' ? 'Enter' : 'Create'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setMode(mode === 'enter' ? 'create' : 'enter'); setRoomName(''); setPassword('')}}>
                    <Text className="text-white opacity-80 text-[18px]">
                        {mode === 'enter' ? 'Create a Room' : 'Already have a room? Enter'}
                    </Text>
                </TouchableOpacity>
                </View>
            <TouchableOpacity className="absolute bottom-20 left-10 rec-button z-10" onPress={handleSignOut}>
                <Text className="text-white text-[16px]">Sign Out</Text>
            </TouchableOpacity>

        </ImageBackground>
    )
}
