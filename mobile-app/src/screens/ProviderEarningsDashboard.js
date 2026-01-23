import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ProviderEarningsDashboard = ({ navigation }) => {
    const { userInfo, API_URL } = useContext(AuthContext);
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/provider/earnings`,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`
                    }
                }
            );
            setEarnings(response.data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !earnings) {
        return (
            <View style={styles.container}>
                <Text>Loading earnings...</Text>
            </View>
        );
    }

    // Prepare chart data
    const chartData = {
        labels: earnings.earnings_history.slice(-6).map(e => e.month.split('-')[1]) || ['Jan', 'Feb', 'Mar'],
        datasets: [{
            data: earnings.earnings_history.slice(-6).map(e => e.amount) || [0, 0, 0]
        }]
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Earnings Dashboard</Text>

            {/* Summary Cards */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Total Earnings</Text>
                        <Text style={styles.statValue}>₹{earnings.total_earnings.toFixed(2)}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.statCard}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Jobs Completed</Text>
                        <Text style={styles.statValue}>{earnings.jobs_completed}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.statCard}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Average Rating</Text>
                        <Text style={styles.statValue}>⭐ {earnings.average_rating.toFixed(1)}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.statCard}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Avg per Job</Text>
                        <Text style={styles.statValue}>
                            ₹{earnings.jobs_completed > 0
                                ? (earnings.total_earnings / earnings.jobs_completed).toFixed(0)
                                : 0}
                        </Text>
                    </Card.Content>
                </Card>
            </View>

            {/* Earnings Chart */}
            {earnings.earnings_history.length > 0 && (
                <Card style={styles.chartCard}>
                    <Card.Content>
                        <Text style={styles.chartTitle}>Monthly Earnings</Text>
                        <BarChart
                            data={chartData}
                            width={Dimensions.get('window').width - 60}
                            height={220}
                            yAxisLabel="₹"
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                }
                            }}
                            style={styles.chart}
                        />
                    </Card.Content>
                </Card>
            )}

            {/* Recent Payments */}
            <Card style={styles.paymentsCard}>
                <Card.Content>
                    <Text style={styles.sectionTitle}>Recent Payments</Text>
                    {earnings.recent_payments && earnings.recent_payments.length > 0 ? (
                        earnings.recent_payments.map((payment, index) => (
                            <View key={index} style={styles.paymentRow}>
                                <View>
                                    <Text style={styles.paymentAmount}>₹{payment.amount}</Text>
                                    <Text style={styles.paymentDate}>
                                        {new Date(payment.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.paymentMethod}>{payment.payment_method.toUpperCase()}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No payments yet</Text>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        marginBottom: 12,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1976d2',
    },
    chartCard: {
        marginBottom: 20,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    paymentsCard: {
        marginBottom: 20,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4caf50',
    },
    paymentDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    paymentMethod: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        padding: 20,
    },
});

export default ProviderEarningsDashboard;
