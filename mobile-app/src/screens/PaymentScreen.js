import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, RadioButton } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const PaymentScreen = ({ route, navigation }) => {
    const { jobId, amount, providerId, serviceId } = route.params;
    const { userInfo, API_URL } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);

    const processPayment = async () => {
        setProcessing(true);

        try {
            const paymentData = {
                job_id: jobId,
                customer_id: userInfo._id,
                provider_id: providerId,
                amount: amount,
                payment_method: paymentMethod
            };

            const response = await axios.post(
                `${API_URL}/payments/`,
                paymentData,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`
                    }
                }
            );

            if (response.data.status === 'completed') {
                Alert.alert(
                    'Payment Successful!',
                    `Your payment of ₹${amount} has been processed successfully.`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Home')
                        }
                    ]
                );
            } else if (paymentMethod === 'cod') {
                Alert.alert(
                    'Job Booked!',
                    'Your job has been booked. Payment will be collected on completion.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Home')
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Payment</Text>

            <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Amount to Pay</Text>
                <Text style={styles.amountValue}>₹{amount}</Text>
            </View>

            <View style={styles.paymentMethodSection}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
                    <View style={styles.radioOption}>
                        <RadioButton value="upi" />
                        <Text style={styles.radioLabel}>💳 UPI (Google Pay, PhonePe, Paytm)</Text>
                    </View>

                    <View style={styles.radioOption}>
                        <RadioButton value="card" />
                        <Text style={styles.radioLabel}>💳 Credit/Debit Card</Text>
                    </View>

                    <View style={styles.radioOption}>
                        <RadioButton value="wallet" />
                        <Text style={styles.radioLabel}>👛 Wallet</Text>
                    </View>

                    <View style={styles.radioOption}>
                        <RadioButton value="cod" />
                        <Text style={styles.radioLabel}>💵 Cash on Delivery</Text>
                    </View>
                </RadioButton.Group>
            </View>

            {paymentMethod === 'upi' && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ⓘ You will be redirected to your UPI app to complete the payment
                    </Text>
                </View>
            )}

            {paymentMethod === 'cod' && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        ⓘ Pay the service provider directly upon job completion
                    </Text>
                </View>
            )}

            <Button
                mode="contained"
                onPress={processPayment}
                loading={processing}
                disabled={processing}
                style={styles.payButton}
            >
                {paymentMethod === 'cod' ? 'Confirm Booking' : `Pay ₹${amount}`}
            </Button>

            <Text style={styles.secureText}>🔒 Secure Payment Gateway</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333',
    },
    amountSection: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    amountValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    paymentMethodSection: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    radioLabel: {
        fontSize: 16,
        marginLeft: 8,
        color: '#333',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        color: '#1976D2',
    },
    payButton: {
        marginTop: 16,
        marginBottom: 8,
    },
    secureText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
});

export default PaymentScreen;
