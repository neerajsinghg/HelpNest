import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface ModernInputProps extends TextInputProps {
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onRightIconPress?: () => void;
    error?: string;
}

export const ModernInput: React.FC<ModernInputProps> = ({
    icon,
    rightIcon,
    onRightIconPress,
    error,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={[styles.inputContainer, error ? styles.errorBorder : null]}>
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={22}
                        color={theme.colors.textSecondary}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.textSecondary}
                    selectionColor={theme.colors.primary}
                    {...props}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
                        <MaterialCommunityIcons
                            name={rightIcon}
                            size={22}
                            color={theme.colors.textSecondary}
                            style={styles.rightIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        paddingHorizontal: 16,
        height: 56,
        ...theme.shadows.small,
        shadowColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
        height: '100%',
    },
    icon: {
        marginRight: 10,
    },
    rightIcon: {
        marginLeft: 10,
    },
    errorBorder: {
        borderColor: theme.colors.error,
    },
});
