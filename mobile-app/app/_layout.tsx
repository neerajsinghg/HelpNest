import { Slot, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect, useState } from 'react';

function RootLayoutNav() {
  const { userToken, userInfo, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    const unsubscribe = navigationRef?.addListener?.('state', () => {
      setIsNavigationReady(true);
    });
    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (isLoading || !isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log('RootLayout Nav Check:', {
      userToken: !!userToken,
      role: userInfo?.current_role,
      inAuthGroup,
      segments
    });

    // Use setTimeout to ensure navigation happens after mount
    const timeout = setTimeout(() => {
      if (!userToken && !inAuthGroup) {
        // Redirect to login if not authenticated
        console.log('Redirecting to login...');
        router.replace('/(auth)/login');
      } else if (userToken && inAuthGroup) {
        // Redirect to appropriate home based on role
        if (userInfo?.current_role === 'provider') {
          console.log('Redirecting to provider home...');
          router.replace('/(provider)/dashboard');
        } else {
          console.log('Redirecting to client home...');
          router.replace('/(client)/home');
        }
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [userToken, segments, isLoading, isNavigationReady, userInfo]);

  return <Slot />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
