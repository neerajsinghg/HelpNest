import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps {
    onPress: () => void;
    style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ onPress, style }) => {
    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Ionicons name="logo-google" size={24} color="#DB4437" style={styles.icon} />
            <Text style={styles.text}>Continue with Google</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingVertical: 14,
        marginVertical: 10,
        width: '100%',
    },
    icon: {
        marginRight: 10,
    },
    text: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    }
});
