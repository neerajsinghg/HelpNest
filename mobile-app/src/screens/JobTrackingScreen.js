import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const JobTrackingScreen = ({ navigation }) => {
    const { userInfo, API_URL } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/jobs/`,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`
                    }
                }
            );
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFA500';
            case 'accepted': return '#2196F3';
            case 'completed': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳';
            case 'accepted': return '✅';
            case 'completed': return '🎉';
            case 'cancelled': return '❌';
            default: return '📋';
        }
    };

    const handleReview = (jobId, providerId) => {
        navigation.navigate('Review', { jobId, providerId });
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.title}>My Bookings</Text>

            {jobs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No bookings yet</Text>
                    <Text style={styles.emptySubtext}>Start browsing services to make your first booking</Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('Home')}
                        style={styles.browseButton}
                    >
                        Browse Services
                    </Button>
                </View>
            ) : (
                jobs.map((job) => (
                    <Card key={job._id} style={styles.jobCard}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={styles.serviceName}>Service #{job.service_id.slice(-6)}</Text>
                                <Chip
                                    style={[styles.statusChip, { backgroundColor: getStatusColor(job.status) }]}
                                    textStyle={styles.statusText}
                                >
                                    {getStatusIcon(job.status)} {job.status.toUpperCase()}
                                </Chip>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.label}>📍 Address:</Text>
                                <Text style={styles.value}>{job.address}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.label}>📅 Scheduled:</Text>
                                <Text style={styles.value}>
                                    {new Date(job.scheduled_time).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>

                            {job.payment_id && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>💳 Payment:</Text>
                                    <Text style={[styles.value, styles.paidText]}>✓ Paid</Text>
                                </View>
                            )}

                            {job.status === 'completed' && !job.reviewed && (
                                <Button
                                    mode="outlined"
                                    onPress={() => handleReview(job._id, job.provider_id)}
                                    style={styles.reviewButton}
                                    icon="star"
                                >
                                    Write a Review
                                </Button>
                            )}

                            {job.status === 'completed' && job.reviewed && (
                                <Text style={styles.reviewedText}>✓ Review submitted</Text>
                            )}
                        </Card.Content>
                    </Card>
                ))
            )}
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
        marginBottom: 16,
        color: '#333',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        marginTop: 8,
    },
    jobCard: {
        marginBottom: 16,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusChip: {
        height: 28,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginRight: 8,
        minWidth: 100,
    },
    value: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    paidText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    reviewButton: {
        marginTop: 12,
    },
    reviewedText: {
        marginTop: 12,
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default JobTrackingScreen;
