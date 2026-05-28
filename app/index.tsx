import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Index() {
    const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
    const { signIn, setActive: setSignInActive } = useSignIn();
    const { signUp, setActive: setSignUpActive } = useSignUp();

    const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                await setSignUpActive({ session: completeSignUp.createdSessionId });
                Alert.alert('Success', 'Account created successfully!');
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
                Alert.alert('Success', 'Signed in successfully!');
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
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>Enter the code sent to:</Text>
                    <Text style={styles.emailText}>{verificationEmail}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="6-digit code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    <TouchableOpacity style={styles.primaryButton} onPress={onVerify} disabled={loading}>
                        <Text style={styles.primaryButtonText}>{loading ? 'Verifying...' : 'Verify Account'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkButton} onPress={onResendCode} disabled={loading}>
                        <Text style={styles.linkButtonText}>Resend Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkButton} onPress={() => { setPendingVerification(false); setVerificationCode(''); }}>
                        <Text style={styles.linkButtonText}>← Back</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{mode === 'signIn' ? 'Welcome Back' : 'Create Account'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.primaryButton} onPress={mode === 'signIn' ? onSignIn : onSignUp} disabled={loading}>
                    <Text style={styles.primaryButtonText}>{loading ? 'Please wait...' : mode === 'signIn' ? 'Sign In' : 'Sign Up'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton} onPress={() => { setMode(mode === 'signIn' ? 'signUp' : 'signIn'); setEmail(''); setPassword(''); }}>
                    <Text style={styles.linkButtonText}>{mode === 'signIn' ? 'Create an account' : 'Already have an account? Sign In'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    container: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 8, textAlign: 'center' },
    emailText: { fontSize: 16, fontWeight: '600', color: '#007AFF', textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
    primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    linkButton: { padding: 16, alignItems: 'center', marginTop: 8 },
    linkButtonText: { color: '#007AFF', fontSize: 14 },
});