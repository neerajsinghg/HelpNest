import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ModernLayout from '../../src/components/ModernLayout';
import { theme } from '../../src/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function CartScreen() {
    return (
        <ModernLayout>
            <View style={styles.container}>
                <MaterialIcons name="shopping-cart" size={80} color={theme.colors.primary} />
                <Text style={styles.title}>Your Cart</Text>
                <Text style={styles.subtitle}>Your cart is empty</Text>
                <Text style={styles.description}>
                    Browse our services and add items to your cart to get started!
                </Text>
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
        fontSize: 18,
        color: theme.colors.textSecondary,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        maxWidth: 250,
    },
});
