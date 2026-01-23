
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface ModernMenuButtonProps {
    onPress?: () => void;
}

export default function ModernMenuButton({ onPress }: ModernMenuButtonProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={theme.gradients.secondary as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Custom 4-line Icon */}
                <View style={styles.iconContainer}>
                    <View style={[styles.line, { width: 14 }]} />
                    <View style={[styles.line, { width: 22 }]} />
                    <View style={[styles.line, { width: 18 }]} />
                    <View style={[styles.line, { width: 22 }]} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 50,
        height: 50,
        borderRadius: 16,
        ...theme.shadows.medium,
        zIndex: 100,
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'space-between',
        height: 20,
        alignItems: 'flex-start', // Align lines to the left
    },
    line: {
        height: 3,
        backgroundColor: '#FFF',
        borderRadius: 1.5,
    }
});
