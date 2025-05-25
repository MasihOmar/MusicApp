// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import LibraryScreen from '../screens/main/LibraryScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();

// Özel Tab Bar bileşeni
function MyTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient
      colors={Colors.gradient.dark}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={[
        styles.tabBarContainer,
        { paddingBottom: Platform.OS === 'android' ? insets.bottom > 0 ? insets.bottom : 8 : insets.bottom }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              {renderIcon(route.name, isFocused)}
              {isFocused && (
                <LinearGradient
                  colors={Colors.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeIndicator}
                />
              )}
            </View>
            <Text style={[styles.tabLabel, { color: isFocused ? Colors.primary : Colors.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}

// İkonları render etme fonksiyonu
const renderIcon = (routeName, isFocused) => {
  const color = isFocused ? Colors.primary : Colors.textSecondary;

  if (routeName === 'Home') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 9.5L12 2L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" 
          stroke={color} 
          strokeWidth="2" 
          fill={isFocused ? "rgba(0, 198, 255, 0.1)" : "none"}
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M9 21V12H15V21" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  } else if (routeName === 'Search') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" 
          stroke={color} 
          strokeWidth="2" 
          fill={isFocused ? "rgba(0, 198, 255, 0.1)" : "none"}
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M21 21L17 17" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    );
  } else if (routeName === 'Library') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H19.5C19.7761 4 20 4.22386 20 4.5V19.5C20 19.7761 19.7761 20 19.5 20H4.5C4.22386 20 4 19.7761 4 19.5Z" 
          stroke={color} 
          strokeWidth="2" 
          fill={isFocused ? "rgba(0, 198, 255, 0.1)" : "none"}
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        <Path 
          d="M8 9H16" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <Path 
          d="M8 13H16" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <Path 
          d="M8 17H12" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
      </Svg>
    );
  }
  return null;
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Ana Sayfa',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Ara',
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Kütüphane',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 'auto', // Auto height to adjust with safe area
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: Colors.backgroundDark,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    position: 'relative',
    height: 30,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 4,
    borderRadius: 2,
  },
});