// src/navigation/MainNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import PlayerScreen from '../screens/player/PlayerScreen';
import PlaylistDetailScreen from '../screens/main/PlaylistDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ArtistProfileScreen from '../screens/main/ArtistProfileScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="ArtistProfile" 
        component={ArtistProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}