import { Stack } from 'expo-router';
import RoleSwitcher from '../../src/components/RoleSwitcher';
import { Button } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';

export default function ClientLayout() {
    const { logout } = useAuth();

    return (
        <Stack>
            <Stack.Screen
                name="home"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
