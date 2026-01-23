import React, { useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const { register, isLoading } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Create Account</Title>
            <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={styles.input}
            />
            <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={() => register(email, password, name, phone)}
                loading={isLoading}
                style={styles.button}
            >
                Register
            </Button>
            <Button
                onPress={() => navigation.goBack()}
                style={styles.link}
            >
                Already have an account? Login
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { alignSelf: 'center', marginBottom: 20 },
    input: { marginBottom: 10 },
    button: { marginTop: 10 },
    link: { marginTop: 10 }
});

export default RegisterScreen;
