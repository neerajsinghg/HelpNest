import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const OTPLoginScreen = ({ navigation }) => {
    const { API_URL, login } = useContext(AuthContext);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            // Call backend to generate and send OTP
            const response = await axios.post(`${API_URL}/auth/send-otp`, {
                phone_number: phoneNumber
            });

            Alert.alert('Success', 'OTP sent to your phone number');
            setOtpSent(true);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Call backend to verify OTP
            const response = await axios.post(`${API_URL}/auth/verify-otp`, {
                phone_number: phoneNumber,
                otp: otp
            });

            // Login successful
            await login(response.data);
            navigation.replace('Home');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        setOtp('');
        await sendOTP();
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>OTP Login</Text>
                <Text style={styles.subtitle}>
                    {!otpSent
                        ? 'Enter your phone number to receive OTP'
                        : 'Enter the OTP sent to your phone'}
                </Text>

                {!otpSent ? (
                    <>
                        <TextInput
                            label="Phone Number"
                            mode="outlined"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            placeholder="+91 9876543210"
                            style={styles.input}
                            maxLength={13}
                        />

                        <Button
                            mode="contained"
                            onPress={sendOTP}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                        >
                            Send OTP
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            style={styles.linkButton}
                        >
                            Login with Email/Password
                        </Button>
                    </>
                ) : (
                    <>
                        <Text style={styles.phoneDisplay}>
                            {phoneNumber}
                        </Text>

                        <TextInput
                            label="Enter OTP"
                            mode="outlined"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            placeholder="000000"
                            style={styles.input}
                            maxLength={6}
                            autoFocus
                        />

                        <Button
                            mode="contained"
                            onPress={verifyOTP}
                            loading={loading}
                            disabled={loading || otp.length !== 6}
                            style={styles.button}
                        >
                            Verify OTP
                        </Button>

                        <Button
                            mode="text"
                            onPress={resendOTP}
                            disabled={loading}
                            style={styles.linkButton}
                        >
                            Resend OTP
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => setOtpSent(false)}
                            style={styles.linkButton}
                        >
                            Change Phone Number
                        </Button>
                    </>
                )}
            </View>

            <Text style={styles.footer}>
                By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    phoneDisplay: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1976d2',
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    linkButton: {
        marginTop: 8,
    },
    footer: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        padding: 16,
    },
});

export default OTPLoginScreen;
