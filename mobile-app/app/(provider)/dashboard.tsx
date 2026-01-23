import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Title, Paragraph, Button, Text, TextInput, FAB } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/context/AuthContext';
import ModernLayout from '../../src/components/ModernLayout';
import { theme } from '../../src/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProviderHomeScreen() {
    const [jobs, setJobs] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const { userToken } = useAuth();

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

    const updateStatus = async (jobId: string, status: string) => {
        try {
            await axios.put(`${API_URL}/jobs/${jobId}/status?status=${status}`, {}, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            fetchJobs();
        } catch (e) {
            console.log(e);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let backgroundColor = theme.colors.warning;
        if (status === 'accepted') backgroundColor = theme.colors.primary;
        if (status === 'completed') backgroundColor = theme.colors.success;

        return (
            <View style={[styles.statusBadge, { backgroundColor }]}>
                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
            </View>
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={theme.gradients.card}
                style={styles.cardGradient}
            >
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Title style={styles.cardTitle}>Job #{item._id.slice(-4)}</Title>
                        <StatusBadge status={item.status} />
                    </View>
                    <Paragraph style={styles.address}>{item.address}</Paragraph>

                    <View style={styles.actions}>
                        {item.status === 'pending' && (
                            <TouchableOpacity
                                onPress={() => updateStatus(item._id, 'accepted')}
                                style={styles.actionButton}
                            >
                                <LinearGradient colors={theme.gradients.primary} style={styles.buttonGradient}>
                                    <Text style={styles.buttonText}>Accept</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        {item.status === 'accepted' && (
                            <TouchableOpacity
                                onPress={() => updateStatus(item._id, 'completed')}
                                style={styles.actionButton}
                            >
                                <LinearGradient colors={[theme.colors.success, '#34D399'] as const} style={styles.buttonGradient}>
                                    <Text style={styles.buttonText}>Complete</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <ModernLayout>
            <Text style={styles.header}>My Jobs</Text>
            <FlatList
                data={jobs}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Title style={styles.modalTitle}>Add New Service</Title>
                        <TextInput label="Service Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
                        <TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} mode="outlined" />
                        <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} mode="outlined" />
                        <TextInput label="Description" value={desc} onChangeText={setDesc} style={styles.input} mode="outlined" multiline />

                        <Button mode="contained" onPress={createService} style={styles.saveButton} buttonColor={theme.colors.primary}>Save</Button>
                        <Button onPress={() => setModalVisible(false)} style={styles.cancelButton} textColor={theme.colors.textLight}>Cancel</Button>
                    </View>
                </View>
            </Modal>

            <FAB
                style={styles.fab}
                icon="plus"
                color="white"
                label="Add Service"
                onPress={() => setModalVisible(true)}
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
    cardContainer: {
        marginBottom: 16,
        borderRadius: 16,
        ...theme.shadows.small,
        backgroundColor: 'transparent',
    },
    cardGradient: { borderRadius: 16, padding: 2 },
    cardContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    address: { color: theme.colors.textLight, marginBottom: 15 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionButton: { borderRadius: 8, overflow: 'hidden' },
    buttonGradient: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    buttonText: { color: '#FFF', fontWeight: 'bold' },

    // Modal & FAB
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 80, backgroundColor: theme.colors.secondary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: '#FFF', padding: 25, borderRadius: 20, elevation: 10 },
    modalTitle: { textAlign: 'center', marginBottom: 20, color: theme.colors.primary },
    input: { marginBottom: 12, backgroundColor: '#FFF' },
    saveButton: { marginTop: 10, borderRadius: 8 },
    cancelButton: { marginTop: 10 }
});
