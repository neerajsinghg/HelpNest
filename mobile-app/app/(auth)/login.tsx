import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { theme } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!identifier.trim()) {
            alert("Please enter a valid Phone Number or Email");
            return;
        }

        // Basic validation - checks if it's 10 digits (phone) or contains @ (email)
        // Adjust regex logic as per specific requirements if needed
        const isPhone = /^[0-9]{10}$/.test(identifier);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        if (!isPhone && !isEmail) {
            // If strict validation is needed given "login by email or mobile no both available"
            // But for now we just pass it to the backend to handle or basic check
            // Depending on backend, we might need to send a flag if it's email vs phone
            // But usually backend detects it.
        }

        const result = await login(identifier, password);
        if (result?.success) {
            if (result.role === 'provider') {
                router.replace('/(provider)/dashboard');
            } else {
                router.replace('/(client)/home');
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Top Gradient Section - approximating the purple curve */}
            <LinearGradient
                colors={['#E6E6FA', '#F3E5F5', '#E1F5FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backgroundGradient}
            />

            <View style={styles.contentContainer}>

                {/* Logo / Icon Area */}
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={['#8E24AA', '#AB47BC']}
                        style={styles.logoBackground}
                    >
                        <MaterialIcons name="home-repair-service" size={40} color="#fff" />
                    </LinearGradient>
                </View>

                {/* Title */}
                <Text style={styles.title}>Log In</Text>
                <Text style={styles.subtitle}>Enter your credentials to continue</Text>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <TextInput
                        label="Phone Number or Email"
                        value={identifier}
                        onChangeText={setIdentifier}
                        style={styles.input}
                        mode="outlined"
                        theme={{ roundness: 12 }}
                        left={<TextInput.Icon icon="cellphone" color="#aaa" />}
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} color="#aaa" />}
                        left={<TextInput.Icon icon="lock" color="#aaa" />}
                        style={styles.input}
                        mode="outlined"
                        theme={{ roundness: 12 }}
                        outlineColor="#E0E0E0"
                        activeOutlineColor={theme.colors.primary}
                    />

                    {/* Login Button */}
                    <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                        <LinearGradient
                            colors={['#7B1FA2', '#4A148C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginButton}
                        >
                            <Text style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Google Login Placeholder */}
                    <TouchableOpacity style={styles.googleButton} onPress={() => alert('Google Login features coming soon!')}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    {/* Signup Link */}
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.signupContainer}>
                        <Text style={styles.signupText}>New user? <Text style={styles.signupLink}>Sign up</Text></Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40%', // Top part background effect
        borderBottomRightRadius: 60,
        borderBottomLeftRadius: 60,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
        alignItems: 'center',
        marginTop: 50
    },
    logoContainer: {
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 20, // Rounded square shape like mockup
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 14,
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#7B1FA2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#9E9E9E',
        fontSize: 12,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    googleButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold', // Slightly bolder as per mockup
    },
    signupContainer: {
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#757575',
    },
    signupLink: {
        color: '#7B1FA2',
        fontWeight: 'bold',
    },
});
