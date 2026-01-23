
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = 60;

export default function DraggableProfile() {
    const { userInfo, logout } = useAuth();
    const [expanded, setExpanded] = useState(false);

    const x = useSharedValue(width - BUTTON_SIZE - 20); // Initial position (right side)
    const y = useSharedValue(50); // Initial top position

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const context = useSharedValue({ x: 0, y: 0 });

    const pan = Gesture.Pan()
        .onStart(() => {
            context.value = { x: x.value, y: y.value };
        })
        .onUpdate((event) => {
            x.value = context.value.x + event.translationX;
            y.value = context.value.y + event.translationY;
        })
        .onEnd(() => {
            // Snap to nearest side
            if (x.value > width / 2) {
                x.value = withSpring(width - BUTTON_SIZE - 20);
            } else {
                x.value = withSpring(20);
            }
            // Keep Y within bounds (roughly)
            if (y.value < 50) y.value = withSpring(50);
            if (y.value > 500) y.value = withSpring(500);
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: x.value }, { translateY: y.value }],
        };
    });

    return (
        <>
            {/* Expanded Menu Overlay */}
            {expanded && (
                <View style={styles.expandedContainer}>
                    <TouchableOpacity style={styles.overlay} onPress={toggleExpand} />
                    <View style={styles.menuCard}>
                        <LinearGradient
                            colors={theme.gradients.primary as any}
                            style={styles.menuHeader}
                        >
                            <Text style={styles.menuName}>{userInfo?.full_name || 'User'}</Text>
                            <Text style={styles.menuRole}>{userInfo?.current_role}</Text>
                        </LinearGradient>
                        <View style={styles.menuItems}>
                            <TouchableOpacity style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Settings</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.menuItem, styles.logoutButton]}
                                onPress={logout}
                            >
                                <Text style={styles.logoutText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Draggable Button */}
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.draggableContainer, animatedStyle]}>
                    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.9}>
                        <LinearGradient
                            colors={theme.gradients.primary as any}
                            style={styles.circle}
                        >
                            <Text style={styles.initials}>
                                {userInfo?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </>
    );
}

const styles = StyleSheet.create({
    draggableContainer: {
        position: 'absolute',
        zIndex: 1000,
        ...theme.shadows.medium,
    },
    circle: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    initials: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    expandedContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    menuCard: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        overflow: 'hidden',
        ...theme.shadows.large,
    },
    menuHeader: {
        padding: 20,
        alignItems: 'center',
    },
    menuName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuRole: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    menuItems: {
        padding: 10,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    logoutButton: {
        borderBottomWidth: 0,
        marginTop: 10,
    },
    logoutText: {
        color: theme.colors.error,
        fontWeight: 'bold',
    }
});
