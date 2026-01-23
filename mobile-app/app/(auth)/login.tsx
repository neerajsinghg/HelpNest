import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Title style={styles.title}>HelpNest Login</Title>
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
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
                onPress={async () => {
                    const result = await login(email, password);
                    if (result?.success) {
                        if (result.role === 'provider') {
                            router.replace('/(provider)/dashboard');
                        } else {
                            router.replace('/(client)/home');
                        }
                    }
                }}
                loading={isLoading}
                style={styles.button}
            >
                Login
            </Button>
            <Button
                onPress={() => router.push('/(auth)/register')}
                style={styles.link}
            >
                Don't have an account? Register
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { alignSelf: 'center', marginBottom: 20 },
    input: { marginBottom: 10 },
    button: { marginTop: 10 },
    link: { marginTop: 10 }
});
