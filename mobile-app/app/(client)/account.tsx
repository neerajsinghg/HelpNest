import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ModernLayout from '../../src/components/ModernLayout';
import { theme } from '../../src/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountScreen() {
    const { userInfo, logout } = useAuth();

    // Helper function to format address object to string
    const formatAddress = (address: any) => {
        if (!address) return 'Not set';
        if (typeof address === 'string') return address;

        // If address is an object, format it
        const parts = [];
        if (address.address_line) parts.push(address.address_line);
        if (address.district) parts.push(address.district);
        if (address.state) parts.push(address.state);
        if (address.pincode) parts.push(address.pincode);

        return parts.length > 0 ? parts.join(', ') : 'Not set';
    };

    return (
        <ModernLayout>
            <View style={styles.container}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <MaterialIcons name="account-circle" size={100} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.name}>{userInfo?.full_name || 'User'}</Text>
                    <Text style={styles.phone}>{userInfo?.phone_number}</Text>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Role:</Text>
                        <Text style={styles.value}>{userInfo?.current_role || 'Customer'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{formatAddress(userInfo?.address)}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <LinearGradient
                        colors={['#D32F2F', '#B71C1C']}
                        style={styles.logoutGradient}
                    >
                        <MaterialIcons name="logout" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ModernLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 5,
    },
    phone: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    infoSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        ...theme.shadows.small,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    label: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '600',
    },
    logoutButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 20,
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
