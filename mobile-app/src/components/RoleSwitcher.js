import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const RoleSwitcher = () => {
    const { userInfo, switchRole } = useAuth();
    const router = useRouter();

    if (!userInfo) return null;

    const isProvider = userInfo.current_role === 'provider';

    const toggleSwitch = async () => {
        const newRole = isProvider ? 'customer' : 'provider';
        await switchRole(newRole);

        // Navigate to the appropriate route group
        if (newRole === 'provider') {
            router.replace('/(provider)');
        } else {
            router.replace('/(client)');
        }
    };

    return (
        <View style={styles.container}>
            <Text>{isProvider ? 'Provider' : 'Customer'}</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isProvider ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isProvider}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10
    }
});

export default RoleSwitcher;
