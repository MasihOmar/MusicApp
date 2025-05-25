import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import Navigation from './navigation';
import { configureAudioSession } from './services/audioConfig';
import { initApiConfig } from './services/api';
import NetworkStatus from './components/NetworkStatus';

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize audio configuration
        await configureAudioSession();
        
        // Initialize API configuration
        await initApiConfig();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <Navigation />
        <NetworkStatus />
      </AuthProvider>
    </SafeAreaProvider>
  );
} 