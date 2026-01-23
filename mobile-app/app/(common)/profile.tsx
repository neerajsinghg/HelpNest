import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { TextInput, Button, Title, Menu, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useAuth, API_URL } from '../../src/context/AuthContext';
import { theme } from '../../src/constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const { userInfo, updateProfile, isLoading } = useAuth();

    // Data State
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState(new Date());
    const [image, setImage] = useState<string | null>(null);

    // Address Data
    const [addressLine, setAddressLine] = useState('');
    const [district, setDistrict] = useState('');
    const [pincode, setPincode] = useState('');
    const [selectedState, setSelectedState] = useState('');

    // Metadata & UI
    const [statesList, setStatesList] = useState<any[]>([]);
    const [showStateMenu, setShowStateMenu] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setFullName(userInfo.full_name || '');
            if (userInfo.dob) {
                setDob(new Date(userInfo.dob));
            }
            if (userInfo.profile_picture_url) {
                setImage(userInfo.profile_picture_url);
            }
            if (userInfo.address) {
                setAddressLine(userInfo.address.address_line || '');
                setDistrict(userInfo.address.district || '');
                setPincode(userInfo.address.pincode || '');
                setSelectedState(userInfo.address.state || '');
            }
        }
        fetchStates();
    }, [userInfo]);

    const fetchStates = async () => {
        try {
            const res = await axios.get(`${API_URL}/states/`);
            setStatesList(res.data);
        } catch (e) {
            console.log('Error fetching states:', e);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        // Upload logic skipped for MVP, sending URI
        let profilePictureUrl = userInfo?.profile_picture_url;
        if (image && image !== userInfo?.profile_picture_url) {
            profilePictureUrl = image;
        }

        const updateData = {
            full_name: fullName,
            dob: dob.toISOString().split('T')[0],
            address: {
                address_line: addressLine,
                state: selectedState,
                district: district,
                pincode: pincode
            },
            profile_picture_url: profilePictureUrl
        };

        const result = await updateProfile(updateData);
        if (result?.success) {
            alert('Profile updated successfully!');
            router.back();
        }
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dob;
        setShowDatePicker(Platform.OS === 'ios');
        setDob(currentDate);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Title style={styles.title}>Edit Profile</Title>

            {/* Profile Picture */}
            <View style={styles.imageContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>No Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.changePhotoText}>Change Photo</Text>
            </View>

            {/* Read-Only Fields */}
            <TextInput
                label="Mobile Number"
                value={userInfo?.phone_number}
                editable={false}
                style={[styles.input, styles.disabledInput]}
                mode="outlined"
            />

            {/* Personal Info */}
            <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                mode="outlined"
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <View pointerEvents="none">
                    <TextInput
                        label="Date of Birth"
                        value={dob.toISOString().split('T')[0]}
                        editable={false}
                        right={<TextInput.Icon icon="calendar" />}
                        mode="outlined"
                        style={{ backgroundColor: '#fff' }}
                    />
                </View>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                />
            )}

            <Divider style={styles.divider} />
            <Title style={styles.subTitle}>Address</Title>

            <TextInput
                label="Address Line 1"
                value={addressLine}
                onChangeText={setAddressLine}
                style={styles.input}
                mode="outlined"
            />

            <Menu
                visible={showStateMenu}
                onDismiss={() => setShowStateMenu(false)}
                anchor={
                    <TouchableOpacity onPress={() => setShowStateMenu(true)}>
                        <View pointerEvents="none">
                            <TextInput
                                label="State"
                                value={selectedState}
                                editable={false}
                                right={<TextInput.Icon icon="chevron-down" />}
                                mode="outlined"
                                style={styles.input}
                            />
                        </View>
                    </TouchableOpacity>
                }
            >
                <ScrollView style={{ maxHeight: 200 }}>
                    {statesList.map((state) => (
                        <Menu.Item
                            key={state._id || state.name}
                            onPress={() => { setSelectedState(state.name); setShowStateMenu(false); }}
                            title={state.name}
                        />
                    ))}
                </ScrollView>
            </Menu>

            <View style={styles.row}>
                <TextInput
                    label="District"
                    value={district}
                    onChangeText={setDistrict}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                />
                <TextInput
                    label="Pincode"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                    style={[styles.input, styles.halfInput]}
                    mode="outlined"
                />
            </View>

            <Button
                mode="contained"
                onPress={handleUpdate}
                loading={isLoading}
                style={styles.button}
                contentStyle={{ paddingVertical: 8 }}
            >
                Save Changes
            </Button>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    title: { alignSelf: 'center', marginBottom: 20, fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
    subTitle: { fontSize: 18, marginBottom: 10, marginTop: 10, fontWeight: 'bold' },
    input: { marginBottom: 15, backgroundColor: '#fff' },
    disabledInput: { backgroundColor: '#f0f0f0' },
    imageContainer: { alignItems: 'center', marginBottom: 20 },
    imageWrapper: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
    profileImage: { width: 100, height: 100 },
    placeholderImage: { alignItems: 'center' },
    placeholderText: { fontSize: 12, color: '#888' },
    changePhotoText: { marginTop: 8, color: theme.colors.primary, fontWeight: 'bold' },
    dateInput: { marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfInput: { width: '48%' },
    divider: { marginVertical: 10 },
    button: { marginTop: 10, borderRadius: 8 },
});
