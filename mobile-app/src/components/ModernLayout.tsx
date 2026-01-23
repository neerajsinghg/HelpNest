
import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import DraggableProfile from './DraggableProfile';
import ModernMenuButton from './ModernMenuButton';

interface ModernLayoutProps {
    children: React.ReactNode;
    title?: string; // Optional title for accessibility or custom header if needed
}

export default function ModernLayout({ children }: ModernLayoutProps) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background Gradient */}
            <LinearGradient
                colors={theme.gradients.background}
                style={StyleSheet.absoluteFill}
            />

            {/* Persistent Floating UI */}
            <DraggableProfile />
            <ModernMenuButton onPress={() => alert('Menu clicked!')} />

            {/* Main Content Area */}
            <SafeAreaView style={styles.contentContainer}>
                <View style={styles.content}>
                    {children}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        padding: theme.spacing.m,
        // Add padding at bottom to avoid overlapping with menu button
        paddingBottom: 80,
    }
});
