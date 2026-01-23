import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface ModernButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    style?: ViewStyle;
    variant?: 'primary' | 'secondary' | 'outline';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
    title,
    onPress,
    loading = false,
    style,
    variant = 'primary'
}) => {
    if (variant === 'primary') {
        return (
            <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8} style={[styles.container, style]}>
                <LinearGradient
                    colors={theme.gradients.primary as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.textPrimary}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Outline / Secondary styles can be added here
    return null;
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: theme.borderRadius.m,
        ...theme.shadows.medium,
        marginVertical: 10,
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textPrimary: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
