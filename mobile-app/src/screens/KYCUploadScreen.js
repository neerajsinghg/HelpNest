import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const KYCUploadScreen = ({ navigation }) => {
    const { userInfo, API_URL } = useContext(AuthContext);
    const [aadharDoc, setAadharDoc] = useState(null);
    const [panDoc, setPanDoc] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [kycStatus, setKycStatus] = useState('pending');

    // Pick document (Aadhar/PAN)
    const pickDocument = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                if (type === 'aadhar') {
                    setAadharDoc(result.assets[0]);
                } else if (type === 'pan') {
                    setPanDoc(result.assets[0]);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    // Pick photo
    const pickPhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission Required', 'Camera permission is required');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setPhoto(result.assets[0]);
        }
    };

    // Upload KYC documents
    const uploadKYC = async () => {
        if (!aadharDoc || !panDoc || !photo) {
            Alert.alert('Missing Documents', 'Please upload all required documents');
            return;
        }

        setUploading(true);

        try {
            // Upload each document
            const documents = [
                { type: 'aadhar', file: aadharDoc },
                { type: 'pan', file: panDoc },
                { type: 'photo', file: photo }
            ];

            for (const doc of documents) {
                const formData = new FormData();
                formData.append('file', {
                    uri: doc.file.uri,
                    type: doc.file.mimeType || 'image/jpeg',
                    name: doc.file.name || `${doc.type}.jpg`
                });
                formData.append('document_type', doc.type);

                await axios.post(
                    `${API_URL}/kyc/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${userInfo.access_token}`
                        }
                    }
                );
            }

            Alert.alert(
                'Success',
                'KYC documents uploaded successfully! Waiting for admin approval.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            setKycStatus('pending');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to upload documents');
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>KYC Verification</Text>
            <Text style={styles.subtitle}>
                Upload your documents to become a verified service provider
            </Text>

            {/* Aadhar Card */}
            <View style={styles.documentSection}>
                <Text style={styles.label}>Aadhar Card *</Text>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickDocument('aadhar')}
                >
                    <Text style={styles.uploadButtonText}>
                        {aadharDoc ? '✓ Aadhar Uploaded' : '📄 Upload Aadhar'}
                    </Text>
                </TouchableOpacity>
                {aadharDoc && (
                    <Text style={styles.fileName}>{aadharDoc.name}</Text>
                )}
            </View>

            {/* PAN Card */}
            <View style={styles.documentSection}>
                <Text style={styles.label}>PAN Card *</Text>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickDocument('pan')}
                >
                    <Text style={styles.uploadButtonText}>
                        {panDoc ? '✓ PAN Uploaded' : '📄 Upload PAN'}
                    </Text>
                </TouchableOpacity>
                {panDoc && (
                    <Text style={styles.fileName}>{panDoc.name}</Text>
                )}
            </View>

            {/* Photo */}
            <View style={styles.documentSection}>
                <Text style={styles.label}>Your Photo *</Text>
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={pickPhoto}
                >
                    <Text style={styles.uploadButtonText}>
                        {photo ? '✓ Photo Taken' : '📷 Take Photo'}
                    </Text>
                </TouchableOpacity>
                {photo && (
                    <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                )}
            </View>

            {/* KYC Status */}
            {kycStatus && (
                <View style={styles.statusSection}>
                    <Text style={styles.statusLabel}>Current Status:</Text>
                    <Text style={[
                        styles.statusText,
                        kycStatus === 'approved' && styles.statusApproved,
                        kycStatus === 'rejected' && styles.statusRejected
                    ]}>
                        {kycStatus.toUpperCase()}
                    </Text>
                </View>
            )}

            {/* Submit Button */}
            <Button
                mode="contained"
                onPress={uploadKYC}
                loading={uploading}
                disabled={uploading || !aadharDoc || !panDoc || !photo}
                style={styles.submitButton}
            >
                Submit for Verification
            </Button>

            <Text style={styles.note}>
                ⓘ Your documents will be reviewed by our team within 24-48 hours
            </Text>
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
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    documentSection: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    fileName: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
    },
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 12,
        alignSelf: 'center',
    },
    statusSection: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFA500',
    },
    statusApproved: {
        color: '#4CAF50',
    },
    statusRejected: {
        color: '#F44336',
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 16,
    },
    note: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
});

export default KYCUploadScreen;
