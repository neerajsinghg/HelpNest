import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export const Logo = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.gradients.primary as any}
                style={styles.background}
            >
                <MaterialCommunityIcons name="wrench" size={40} color="white" />
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        ...theme.shadows.medium,
    },
    background: {
        width: 80,
        height: 80,
        borderRadius: 20, // Squircle shape like reference
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-10deg' }] // Slight tilt for style
    },
});
