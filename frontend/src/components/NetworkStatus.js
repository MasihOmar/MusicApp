import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getConnectionStatus, checkServerReachability } from '../services/api';
import Colors from '../constants/colors';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isServerReachable, setIsServerReachable] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        checkServerStatus();
      } else {
        setIsServerReachable(false);
        setIsVisible(true);
      }
    });
    
    // Check initial status
    checkInitialStatus();

    return () => {
      unsubscribe();
    };
  }, []);
  
  const checkInitialStatus = async () => {
    const netInfoState = await NetInfo.fetch();
    setIsConnected(netInfoState.isConnected);
    
    if (netInfoState.isConnected) {
      checkServerStatus();
    } else {
      setIsServerReachable(false);
      setIsVisible(true);
    }
  };
  
  const checkServerStatus = async () => {
    const result = await checkServerReachability();
    setIsServerReachable(result);
    setIsVisible(!result);
  };
  
  const handleRetry = () => {
    setIsVisible(false);
    setTimeout(() => {
      checkInitialStatus();
    }, 500);
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {!isConnected 
            ? 'No Internet Connection' 
            : !isServerReachable 
              ? 'Server Not Reachable' 
              : 'Connection Issue'}
        </Text>
        
        <Text style={styles.message}>
          {!isConnected 
            ? 'Please check your internet connection and try again.' 
            : !isServerReachable 
              ? 'The server cannot be reached. Please check server status or API URL configuration.' 
              : 'There is an issue with your connection.'}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        
        {!isServerReachable && isConnected && (
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              // Navigate to settings - need to implement this with navigation context
              // For now just hide the message
              setIsVisible(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Check API Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    zIndex: 1000,
  },
  contentContainer: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
  },
});

export default NetworkStatus; 