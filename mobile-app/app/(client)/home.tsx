import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/context/AuthContext';
import ModernLayout from '../../src/components/ModernLayout';
import { theme } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientHomeScreen() {
    const [services, setServices] = useState([]);
    const { userToken } = useAuth();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_URL}/services`);
            setServices(response.data);
        } catch (e) {
            console.log(e);
        }
    };

    const bookService = async (serviceId: string, providerId: string) => {
        try {
            await axios.post(`${API_URL}/jobs/`, {
                service_id: serviceId,
                provider_id: providerId,
                scheduled_time: new Date().toISOString(),
                address: "My Home Address"
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            alert('Service booked successfully!');
        } catch (e) {
            alert('Booking failed');
            console.log(e);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={theme.gradients.card}
                style={styles.cardGradient}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Title style={styles.cardTitle}>{item.name}</Title>
                        <Text style={styles.priceTag}>${item.price}</Text>
                    </View>
                    <Text style={styles.category}>{item.category}</Text>
                    <Paragraph style={styles.description}>{item.description}</Paragraph>

                    <TouchableOpacity
                        style={styles.bookButton}
                        activeOpacity={0.8}
                        onPress={() => bookService(item._id, item.provider_id)}
                    >
                        <LinearGradient
                            colors={theme.gradients.primary}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Book Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <ModernLayout>
            <Text style={styles.header}>Available Services</Text>
            <FlatList
                data={services}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ModernLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primaryDark,
        marginBottom: 20,
        marginTop: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    cardContainer: {
        marginBottom: 16,
        borderRadius: 16,
        ...theme.shadows.small,
        backgroundColor: 'transparent',
    },
    cardGradient: {
        borderRadius: 16,
        padding: 2, // Border effect if needed, otherwise just container
    },
    cardContent: {
        backgroundColor: '#FFF', // Or transparent if using full gradient
        borderRadius: 15,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    priceTag: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        backgroundColor: '#FDF2F8',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    category: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        color: theme.colors.text,
        marginBottom: 16,
        lineHeight: 20,
    },
    bookButton: {
        borderRadius: 12,
        ...theme.shadows.medium,
    },
    buttonGradient: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
