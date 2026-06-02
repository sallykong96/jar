import {Alert, ImageBackground, Text, TextInput, TouchableOpacity, View} from "react-native";
import "@/global.css"
import {useState} from "react";
import {checkExistingUser, addPartner} from "@/lib/supabase";
import {router, useLocalSearchParams} from 'expo-router';
import {ReturnButton} from "@/app/components/returnButton";


export default function AddPartner() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const { roomName } = useLocalSearchParams<{ roomName: string }>();


    const onEnter = async () => {
        setLoading(true);
        try {
            const existUser = await checkExistingUser(email);
            console.log("existUser:", email)
            if (existUser) {
                const add = await addPartner(existUser.data.clerk_id, roomName);
                if (add) {
                    Alert.alert("Add partner successfully!");
                    router.push({
                        pathname: '/room/[roomName]',
                        params: { roomName: roomName }
                    });
                }
            } else {
                Alert.alert("User does not exist!");
            }
        } catch (err: any) {
                Alert.alert("Please input correct email address");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <View className="flex-1 items-center justify-center -mt-40">
                <Text className="text-white opacity-80 text-[18px] mb-5">
                    Please enter your partner's email
                </Text>
                <TextInput
                    className="auth-input"
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                />

                <TouchableOpacity className="auth-button" onPress={onEnter} disabled={loading}>
                    <Text className="text-white opacity-80 text-[18px]">
                        Add
                    </Text>
                </TouchableOpacity>
            </View>
            <ReturnButton />

        </ImageBackground>
    )
}
