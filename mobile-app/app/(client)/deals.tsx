import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ModernLayout from '../../src/components/ModernLayout';
import { theme } from '../../src/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function DealsScreen() {
    return (
        <ModernLayout>
            <View style={styles.container}>
                <MaterialIcons name="local-offer" size={80} color={theme.colors.primary} />
                <Text style={styles.title}>Top Deals</Text>
                <Text style={styles.subtitle}>Amazing deals and discounts coming soon!</Text>
            </View>
        </ModernLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
