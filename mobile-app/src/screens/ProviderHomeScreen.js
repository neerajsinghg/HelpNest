import React, { useState, useEffect, useContext } from 'react';
import { View, FlatList, StyleSheet, Modal } from 'react-native';
import { Card, Title, Paragraph, Button, Text, TextInput, FAB } from 'react-native-paper';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

const ProviderHomeScreen = () => {
    const [jobs, setJobs] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const { userToken } = useContext(AuthContext);

    // Form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${API_URL}/jobs/`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            setJobs(response.data);
        } catch (e) {
            console.log(e);
        }
    };

    const createService = async () => {
        try {
            await axios.post(`${API_URL}/services/`, {
                name, category, price: parseFloat(price), description: desc
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            alert('Service created!');
            setModalVisible(false);
        } catch (e) {
            alert('Error creating service');
        }
    };

    const updateStatus = async (jobId, status) => {
        try {
            await axios.put(`${API_URL}/jobs/${jobId}/status?status=${status}`, {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            fetchJobs();
        } catch (e) {
            console.log(e);
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>Job #{item._id.slice(-4)}</Title>
                <Paragraph>Status: {item.status}</Paragraph>
                <Paragraph>{item.address}</Paragraph>
            </Card.Content>
            <Card.Actions>
                {item.status === 'pending' && <Button onPress={() => updateStatus(item._id, 'accepted')}>Accept</Button>}
                {item.status === 'accepted' && <Button onPress={() => updateStatus(item._id, 'completed')}>Complete</Button>}
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Jobs</Text>
            <FlatList
                data={jobs}
                renderItem={renderItem}
                keyExtractor={item => item._id}
            />

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modal}>
                    <Title>Add New Service</Title>
                    <TextInput label="Service Name" value={name} onChangeText={setName} style={styles.input} />
                    <TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} />
                    <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
                    <TextInput label="Description" value={desc} onChangeText={setDesc} style={styles.input} />
                    <Button mode="contained" onPress={createService} style={styles.button}>Save</Button>
                    <Button onPress={() => setModalVisible(false)} style={styles.button}>Cancel</Button>
                </View>
            </Modal>

            <FAB
                style={styles.fab}
                icon="plus"
                label="Add Service"
                onPress={() => setModalVisible(true)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 20, marginBottom: 10, fontWeight: 'bold' },
    card: { marginBottom: 10 },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
    modal: { padding: 20, marginTop: 50 },
    input: { marginBottom: 10 },
    button: { marginTop: 10 }
});

export default ProviderHomeScreen;
