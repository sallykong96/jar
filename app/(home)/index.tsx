// app/(home)/index.tsx
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';


export default function HomeScreen() {
    const { signOut } = useClerk();
    const { user, isLoaded } = useUser();

    const onSignOut = async () => {
        try {
            await signOut();
        } catch (err: any) {
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    // Show loading while user data is loading
    if (!isLoaded || !user) {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.welcomeTitle}>Loading...</Text>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
                <Text style={styles.welcomeTitle}>Welcome to Your App! 🎉</Text>

                <View style={styles.userInfoCard}>
                    <Text style={styles.userInfoLabel}>Email:</Text>
                    <Text style={styles.userInfoValue}>
                        {user?.emailAddresses?.[0]?.emailAddress}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onSignOut}
                >
                    <Text style={styles.primaryButtonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#1a1a1a',
    },
    userInfoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    userInfoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
        marginBottom: 4,
    },
    userInfoValue: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
        marginBottom: 8,
    },
    primaryButton: {
        backgroundColor: '#dc2626',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});