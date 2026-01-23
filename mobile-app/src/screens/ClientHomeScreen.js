import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text } from 'react-native-paper';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

const ClientHomeScreen = () => {
    const [services, setServices] = useState([]);
    const { userToken } = useContext(AuthContext);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get(`${API_URL}/services`); // Public endpoint
            setServices(response.data);
        } catch (e) {
            console.log(e);
        }
    };

    const bookService = async (serviceId, providerId) => {
        try {
            await axios.post(`${API_URL}/jobs/`, {
                service_id: serviceId,
                provider_id: providerId,
                scheduled_time: new Date().toISOString(), // Mock time
                address: "My Home Address" // Mock address
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            alert('Service booked successfully!');
        } catch (e) {
            alert('Booking failed');
            console.log(e);
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>{item.name}</Title>
                <Paragraph>{item.category} - ${item.price}</Paragraph>
                <Paragraph>{item.description}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button onPress={() => bookService(item._id, item.provider_id)}>Book Now</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Available Services</Text>
            <FlatList
                data={services}
                renderItem={renderItem}
                keyExtractor={item => item._id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 20, marginBottom: 10, fontWeight: 'bold' },
    card: { marginBottom: 10 }
});

export default ClientHomeScreen;
