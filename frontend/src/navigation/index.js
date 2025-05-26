// src/navigation/index.js
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import Colors from '../constants/colors';

export default function Navigation() {
  const { isLoading, userToken } = useAuth();
  const navigationRef = useRef(null);

  // Set up global navigation function
  React.useEffect(() => {
    global.navigate = (name, params) => {
      if (navigationRef.current) {
        navigationRef.current.navigate(name, params);
      }
    };
    
    return () => {
      global.navigate = undefined;
    };
  }, []);

  // Track when navigation state changes to update current route
  const onStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute && global.setCurrentRouteName) {
      global.setCurrentRouteName(currentRoute.name);
    }
  };

  console.log('Navigation state:', { isLoading, userToken });

  if (isLoading) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  console.log('Rendering navigator:', userToken ? 'MainNavigator' : 'AuthNavigator');
  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={onStateChange}
      onReady={() => {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        if (currentRoute && global.setCurrentRouteName) {
          global.setCurrentRouteName(currentRoute.name);
        }
      }}
    >
      {userToken ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});