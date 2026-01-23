import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Searchbar, Card, Chip, Button } from 'react-native-paper';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const GeolocationSearchScreen = ({ navigation }) => {
    const { userInfo, API_URL } = useContext(AuthContext);
    const [location, setLocation] = useState(null);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [maxDistance, setMaxDistance] = useState(10); // km
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getLocationPermission();
        fetchCategories();
    }, []);

    const getLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to find nearby providers');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            searchProviders(currentLocation.coords.longitude, currentLocation.coords.latitude);
        } catch (error) {
            Alert.alert('Error', 'Failed to get your location');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_URL}/categories/`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const searchProviders = async (longitude, latitude, categoryId = null) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                longitude: longitude.toString(),
                latitude: latitude.toString(),
                max_distance_km: maxDistance.toString()
            });

            if (categoryId) {
                params.append('category_id', categoryId);
            }

            const response = await axios.get(
                `${API_URL}/geolocation/search?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`
                    }
                }
            );

            setProviders(response.data);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to search providers');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        if (location) {
            searchProviders(location.coords.longitude, location.coords.latitude, categoryId);
        }
    };

    const renderProvider = ({ item }) => (
        <Card style={styles.providerCard}>
            <Card.Content>
                <View style={styles.providerHeader}>
                    <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>Provider #{item.user_id.slice(-6)}</Text>
                        <Text style={styles.distance}>📍 {item.distance_km} km away</Text>
                    </View>
                    {item.average_rating > 0 && (
                        <Chip style={styles.ratingChip}>
                            ⭐ {item.average_rating.toFixed(1)}
                        </Chip>
                    )}
                </View>

                {item.services && item.services.length > 0 && (
                    <View style={styles.servicesSection}>
                        <Text style={styles.servicesLabel}>Services:</Text>
                        {item.services.slice(0, 3).map((service, idx) => (
                            <Text key={idx} style={styles.serviceName}>
                                • {service.name} - ₹{service.price}
                            </Text>
                        ))}
                    </View>
                )}

                <View style={styles.statsRow}>
                    <Text style={styles.stat}>
                        {item.total_jobs_completed || 0} jobs completed
                    </Text>
                    <Text style={styles.stat}>
                        {item.service_radius_km || 10} km radius
                    </Text>
                </View>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ProviderProfile', { providerId: item.user_id })}
                    style={styles.viewButton}
                >
                    View Profile
                </Button>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find Nearby Providers</Text>

            {location && (
                <Text style={styles.locationText}>
                    📍 Searching within {maxDistance} km of your location
                </Text>
            )}

            {/* Category Filter */}
            <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Filter by Category:</Text>
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <Chip
                            selected={selectedCategory === item._id}
                            onPress={() => handleCategorySelect(item._id)}
                            style={styles.categoryChip}
                        >
                            {item.icon} {item.name}
                        </Chip>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            {/* Distance Selector */}
            <View style={styles.distanceSection}>
                <Text style={styles.distanceLabel}>Search Radius:</Text>
                <View style={styles.distanceButtons}>
                    {[5, 10, 15, 20].map(km => (
                        <Chip
                            key={km}
                            selected={maxDistance === km}
                            onPress={() => {
                                setMaxDistance(km);
                                if (location) {
                                    searchProviders(location.coords.longitude, location.coords.latitude, selectedCategory);
                                }
                            }}
                            style={styles.distanceChip}
                        >
                            {km} km
                        </Chip>
                    ))}
                </View>
            </View>

            {/* Results */}
            {loading ? (
                <Text style={styles.loadingText}>Searching for providers...</Text>
            ) : providers.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🔍</Text>
                    <Text style={styles.emptyText}>No providers found nearby</Text>
                    <Text style={styles.emptySubtext}>Try increasing the search radius</Text>
                </View>
            ) : (
                <FlatList
                    data={providers}
                    keyExtractor={(item) => item._id}
                    renderItem={renderProvider}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
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
        marginBottom: 8,
        color: '#333',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    categorySection: {
        marginBottom: 16,
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666',
    },
    categoryChip: {
        marginRight: 8,
    },
    distanceSection: {
        marginBottom: 16,
    },
    distanceLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666',
    },
    distanceButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    distanceChip: {
        marginRight: 8,
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
    },
    emptyState: {
        flex: 1,
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
    },
    listContainer: {
        paddingBottom: 20,
    },
    providerCard: {
        marginBottom: 16,
        elevation: 2,
    },
    providerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    providerInfo: {
        flex: 1,
    },
    providerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    distance: {
        fontSize: 14,
        color: '#1976d2',
    },
    ratingChip: {
        backgroundColor: '#fff3e0',
    },
    servicesSection: {
        marginBottom: 12,
    },
    servicesLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 14,
        color: '#333',
        marginVertical: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    stat: {
        fontSize: 12,
        color: '#666',
    },
    viewButton: {
        marginTop: 8,
    },
});

export default GeolocationSearchScreen;
