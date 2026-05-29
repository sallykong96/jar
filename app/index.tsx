import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import "@/global.css"
import { ImageBackground } from 'react-native';
import { createUser } from "@/lib/supabase";

export default function Index() {
    const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const { signIn, setActive: setSignInActive } = useSignIn();
    const { signUp, setActive: setSignUpActive } = useSignUp();

    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');

    const onSignUp = async () => {
        if (!signUp) return;
        setLoading(true);
        try {
            await signUp.create({ emailAddress: email, password: password });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setVerificationEmail(email);
            setPendingVerification(true);
            Alert.alert('Verification Sent', `Check ${email} for the code`);
        } catch (err: any) {
            const errorMessage = err.errors?.[0]?.message || 'Sign up failed';
            if (errorMessage.toLowerCase().includes('weak')) {
                Alert.alert('Password Too Weak', 'Use 8+ chars with letters, numbers, and symbols');
            } else if (errorMessage.toLowerCase().includes('compromised')) {
                Alert.alert('Password Compromised', 'This password appears in data breaches.');
            } else if (errorMessage.toLowerCase().includes('exists')) {
                Alert.alert('Account Exists', 'An account with this email already exists. Please sign in.');
                setMode('signIn');
            } else {
                Alert.alert('Error', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const onVerify = async () => {
        if (!signUp) return;
        setLoading(true);
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code: verificationCode });

            if (completeSignUp.status === 'complete') {
                // console.log("completeSignUp:", completeSignUp )
                // console.log("signUp:", signUp )

                const userData = {
                    id: completeSignUp.id,
                    email: completeSignUp.emailAddress,
                    name: name,
                };
                await setSignUpActive({ session: completeSignUp.createdSessionId });
                Alert.alert('Success', 'Account created successfully!');
                const err = await createUser(userData);
                console.log("err:", err )
                setPendingVerification(false);
            } else {
                Alert.alert('Error', 'Verification failed. Please try again.');
            }
        } catch (err: any) {
            Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const onResendCode = async () => {
        if (!signUp) return;
        setLoading(true);
        try {
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            Alert.alert('Code Resent', `A new code has been sent to ${verificationEmail}`);
        } catch (err: any) {
            Alert.alert('Error', err.errors?.[0]?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    const onSignIn = async () => {
        if (!signIn) return;
        setLoading(true);
        try {
            const result = await signIn.create({ identifier: email, password: password });
            if (result.status === 'complete') {
                await setSignInActive({ session: result.createdSessionId });
                setEmail('');
                setPassword('');
            }
        } catch (err: any) {
            Alert.alert('Error', err.errors?.[0]?.message || 'Sign in failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthLoaded) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    // If signed in, show loading indicator (root layout will redirect)
    if (isSignedIn) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 12 }}>Redirecting...</Text>
            </View>
        );
    }

    if (pendingVerification) {
        return (
            <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full"  resizeMode="cover">
            <ScrollView contentContainerClassName="justify-center items-center px-5 mt-20">
                    <Text className="text-8xl text-white font-artistic mb-10">Verify Your Email</Text>
                    <Text className="text-xl text-white opacity-80">Enter the code sent to:</Text>
                    <Text style={styles.emailText}>{verificationEmail}</Text>
                    <TextInput
                        className="auth-input"
                        placeholder="6-digit code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    <TouchableOpacity className="auth-button" onPress={onVerify} disabled={loading}>
                        <Text className="auth-button-text">{loading ? 'Verifying...' : 'Verify Account'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="auth-button" onPress={onResendCode} disabled={loading}>
                        <Text className="auth-button-text">Resend Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setPendingVerification(false); setVerificationCode(''); }}>
                        <Text className="text-white opacity-80">← Back</Text>
                    </TouchableOpacity>
            </ScrollView>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground source={require('@/assets/images/home.png')} className="flex-1 w-full h-full" resizeMode="cover">
            <ScrollView contentContainerClassName="justify-center px-5">
                <Text className="text-4xl text-white font-artistic mt-40 ml-20 text-left">
                    {mode === 'signIn' ? 'Grow the love in a' : ''}
                </Text>
                <View className="items-center">
                    <Text className="text-8xl text-white font-artistic mb-10">
                        {mode === 'signIn' ? 'Jar' : 'Create Account'}
                    </Text>

                    <TextInput
                        className="auth-input"
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <TextInput
                        className="auth-input"
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    {mode === 'signUp'&& (
                        <TextInput
                            className="auth-input"
                            placeholder="Username"
                            value={name}
                            onChangeText={setName}
                        />
                    )}

                    <TouchableOpacity className="auth-button" onPress={mode === 'signIn' ? onSignIn : onSignUp} disabled={loading}>
                        <Text className="text-white opacity-80">
                            {loading ? 'Please wait...' : mode === 'signIn' ? 'Sign In' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setEmail(''); setPassword(''); setName('')}}>
                        <Text className="text-white opacity-80">
                            {mode === 'signIn' ? 'Create an account' : 'Already have an account? Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    emailText: { fontSize: 16, fontWeight: '600', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
});