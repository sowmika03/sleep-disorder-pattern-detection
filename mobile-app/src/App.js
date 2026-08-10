import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // Log app state changes for debugging
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('App State:', nextAppState);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AuthProvider>
  );
}

