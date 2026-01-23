import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const ReviewScreen = ({ route, navigation }) => {
    const { jobId, providerId } = route.params;
    const { userInfo, API_URL } = useContext(AuthContext);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submitReview = async () => {
        if (!rating) {
            Alert.alert('Error', 'Please provide a rating');
            return;
        }

        setSubmitting(true);

        try {
            const reviewData = {
                job_id: jobId,
                customer_id: userInfo._id,
                provider_id: providerId,
                rating: rating,
                comment: comment.trim() || null
            };

            await axios.post(
                `${API_URL}/reviews/`,
                reviewData,
                {
                    headers: {
                        'Authorization': `Bearer ${userInfo.access_token}`
                    }
                }
            );

            Alert.alert(
                'Thank You!',
                'Your review has been submitted successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Rate Your Experience</Text>
            <Text style={styles.subtitle}>How was the service?</Text>

            <View style={styles.ratingSection}>
                <AirbnbRating
                    count={5}
                    reviews={['Terrible', 'Bad', 'OK', 'Good', 'Excellent']}
                    defaultRating={5}
                    size={40}
                    onFinishRating={setRating}
                    selectedColor="#FFD700"
                />
            </View>

            <View style={styles.commentSection}>
                <Text style={styles.label}>Share your thoughts (Optional)</Text>
                <TextInput
                    mode="outlined"
                    placeholder="Tell us more about your experience..."
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={4}
                    style={styles.commentInput}
                />
            </View>

            <Button
                mode="contained"
                onPress={submitReview}
                loading={submitting}
                disabled={submitting}
                style={styles.submitButton}
            >
                Submit Review
            </Button>

            <Text style={styles.note}>
                Your feedback helps us improve our service quality
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        textAlign: 'center',
    },
    ratingSection: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
    },
    commentSection: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    commentInput: {
        backgroundColor: '#f9f9f9',
    },
    submitButton: {
        marginBottom: 16,
    },
    note: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default ReviewScreen;
