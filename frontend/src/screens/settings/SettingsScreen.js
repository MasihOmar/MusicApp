import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateApiUrl, getConnectionStatus, checkServerReachability } from '../../services/api';
import Colors from '../../constants/colors';

export default function SettingsScreen({ navigation }) {
  const [apiUrl, setApiUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    serverReachable: false,
    lastChecked: null
  });
  
  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedApiUrl = await AsyncStorage.getItem('apiUrl');
        if (storedApiUrl) {
          setApiUrl(storedApiUrl);
        }
        
        const darkModeValue = await AsyncStorage.getItem('darkMode');
        setIsDarkMode(darkModeValue !== 'false'); // Default to true
        
        // Get current connection status
        updateConnectionStatus();
      } catch (error) {
        console.error('Failed to load settings:', error);
        Alert.alert('Error', 'Failed to load settings');
      }
    };
    
    loadSettings();
  }, []);
  
  const updateConnectionStatus = async () => {
    const status = getConnectionStatus();
    setConnectionStatus({
      ...status,
      lastChecked: new Date()
    });
  };
  
  const handleTestConnection = async () => {
    if (!apiUrl) {
      Alert.alert('Error', 'Please enter an API URL to test');
      return;
    }
    
    // Validate URL format
    try {
      new URL(apiUrl);
    } catch (err) {
      Alert.alert('Invalid URL', 'Please enter a valid URL (e.g., http://192.168.1.100:8080)');
      return;
    }
    
    setIsTesting(true);
    
    try {
      // Try to save the URL first (but don't show alert yet)
      await AsyncStorage.setItem('apiUrl', apiUrl);
      
      // Then test the connection with the new URL
      const isReachable = await checkServerReachability();
      
      // Update connection status
      await updateConnectionStatus();
      
      if (isReachable) {
        Alert.alert(
          'Success', 
          'Connection to server successful! API URL has been updated.',
          [
            { text: 'OK', onPress: () => console.log('Connection test successful') }
          ]
        );
      } else {
        Alert.alert(
          'Connection Failed', 
          'Could not connect to the specified server. The URL has been saved, but please verify that the server is running and accessible.',
          [
            { text: 'Keep this URL', onPress: () => console.log('Keeping URL despite failed connection') },
            { text: 'Restore Previous URL', style: 'cancel', onPress: resetToPreviousUrl }
          ]
        );
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert(
        'Error', 
        'Failed to test connection: ' + error.message,
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsTesting(false);
    }
  };
  
  const resetToPreviousUrl = async () => {
    try {
      const previousUrl = await AsyncStorage.getItem('previousApiUrl');
      if (previousUrl) {
        await AsyncStorage.setItem('apiUrl', previousUrl);
        setApiUrl(previousUrl);
        Alert.alert('Restored', 'Previous API URL has been restored.');
      }
    } catch (error) {
      console.error('Failed to restore previous URL:', error);
    }
  };
  
  const handleSaveApiUrl = async () => {
    if (!apiUrl) {
      Alert.alert('Error', 'API URL cannot be empty');
      return;
    }
    
    // Validate URL format
    try {
      new URL(apiUrl);
    } catch (err) {
      Alert.alert('Invalid URL', 'Please enter a valid URL (e.g., http://192.168.1.100:8080)');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Backup the current URL before changing
      const currentUrl = await AsyncStorage.getItem('apiUrl');
      if (currentUrl) {
        await AsyncStorage.setItem('previousApiUrl', currentUrl);
      }
      
      const success = await updateApiUrl(apiUrl);
      if (success) {
        Alert.alert('Success', 'API URL saved successfully and connection verified!');
      } else {
        Alert.alert(
          'Warning', 
          'API URL saved, but the server could not be reached. Please verify the URL and server status.',
          [{ text: 'OK' }]
        );
      }
      
      // Update connection status
      await updateConnectionStatus();
    } catch (error) {
      console.error('Error saving API URL:', error);
      Alert.alert('Error', 'Failed to save API URL: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDarkModeToggle = async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
      // If you have a theme context, update it here
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  };
  
  const resetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['apiUrl', 'previousApiUrl', 'darkMode']);
              setApiUrl('');
              setIsDarkMode(true);
              
              // Reinitialize API config with defaults
              await updateApiUrl(getDefaultApiUrl());
              
              // Update connection status
              await updateConnectionStatus();
              
              Alert.alert('Success', 'Settings reset to default values');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        }
      ]
    );
  };
  
  // Helper to get default API URL based on platform
  const getDefaultApiUrl = () => {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8080';
    }
    return 'http://10.0.46.23:8080';
  };
  
  // Format the last checked time
  const getLastCheckedTime = () => {
    if (!connectionStatus.lastChecked) return 'Never';
    
    const date = new Date(connectionStatus.lastChecked);
    return date.toLocaleTimeString();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>
        
        <View style={styles.connectionStatus}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Internet:</Text>
            <View style={[
              styles.statusIndicator, 
              connectionStatus.isConnected ? styles.statusOnline : styles.statusOffline
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Server:</Text>
            <View style={[
              styles.statusIndicator, 
              connectionStatus.serverReachable ? styles.statusOnline : styles.statusOffline
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus.serverReachable ? 'Reachable' : 'Unreachable'}
            </Text>
          </View>
          
          <Text style={styles.lastChecked}>
            Last checked: {getLastCheckedTime()}
          </Text>
        </View>
        
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://192.168.1.100:8080"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Set the URL of your backend server. For local development, use your computer's IP address.
          For Android emulator, use 10.0.2.2:8080 to access localhost.
        </Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.secondaryButton,
              (isTesting || isSaving) && styles.buttonDisabled
            ]}
            onPress={handleTestConnection}
            disabled={isTesting || isSaving}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Text style={styles.secondaryButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, (isSaving || isTesting) && styles.buttonDisabled]}
            onPress={handleSaveApiUrl}
            disabled={isSaving || isTesting}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>Save API URL</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: '#767577', true: Colors.primary }}
            thumbColor={isDarkMode ? Colors.accent : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Advanced</Text>
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]}
          onPress={resetSettings}
        >
          <Text style={styles.buttonText}>Reset Settings</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Music App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  connectionStatus: {
    backgroundColor: Colors.backgroundDark,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    width: 80,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#4CAF50', // Green
  },
  statusOffline: {
    backgroundColor: '#F44336', // Red
  },
  statusText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  lastChecked: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 4,
    padding: 12,
    color: Colors.textPrimary,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  footer: {
    marginTop: 24,
    marginBottom: 48,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
}); 