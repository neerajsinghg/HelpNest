import { Stack } from 'expo-router';
import RoleSwitcher from '../../src/components/RoleSwitcher';
import { Button } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';

export default function ProviderLayout() {
    const { logout } = useAuth();

    return (
        <Stack>
            <Stack.Screen
                name="dashboard"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
