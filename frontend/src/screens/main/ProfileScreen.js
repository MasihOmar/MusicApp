// src/screens/main/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import Colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: ''
  });

  // Initialize edited user data when user data is available
  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // User info from context
  const userInfo = {
    displayName: user?.username || 'Username',
    email: user?.email || 'email@example.com',
    plan: 'Premium'
  };

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  // Handle save profile changes
  const handleSaveProfile = async () => {
    if (!editedUser.username.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to update user profile
      const response = await userService.updateUser(user.id, editedUser);
      
      // Check if response contains an error
      if (response.error) {
        Alert.alert('Error', response.error);
        // If session expired, the AuthContext will handle navigation
        if (response.error.includes('session has expired')) {
          await logout();
        }
        return;
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      // Refresh user data in context
      await refreshUser();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditedUser({
      username: user?.username || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext will handle the navigation state change
      // by switching to AuthNavigator when userToken is null
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Error',
        'Unable to log out. Please try again.'
      );
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundDark, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <LinearGradient
            colors={Colors.gradient.primary}
            style={styles.profileImage}
          >
            <Text style={styles.profileInitial}>{userInfo.displayName.charAt(0)}</Text>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedUser.username}
                  onChangeText={(text) => setEditedUser(prev => ({ ...prev, username: text }))}
                  placeholder="Username"
                  placeholderTextColor={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  value={editedUser.email}
                  onChangeText={(text) => setEditedUser(prev => ({ ...prev, email: text }))}
                  placeholder="Email"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]}
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.textPrimary} />
                    ) : (
                      <Text style={styles.editButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                    disabled={isLoading}
                  >
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{userInfo.displayName}</Text>
                <Text style={styles.profileEmail}>{userInfo.email}</Text>
                <View style={styles.planBadge}>
                  <LinearGradient
                    colors={Colors.gradient.energetic}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planGradient}
                  >
                    <Text style={styles.planText}>{userInfo.plan}</Text>
                  </LinearGradient>
                </View>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.accountButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <LinearGradient
              colors={Colors.gradient.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Settings</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {!isEditing && (
            <TouchableOpacity 
              style={styles.accountButton}
              onPress={handleEditProfile}
            >
              <LinearGradient
                colors={Colors.gradient.cardPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accountButtonGradient}
              >
                <Text style={styles.accountButtonText}>Edit Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.accountButton}>
            <LinearGradient
              colors={Colors.gradient.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Change Password</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.accountButton, styles.logoutButton]} onPress={handleLogout}>
            <LinearGradient
              colors={['#d31027', '#ea384d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 MusicApp</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerRight: {
    width: 40, // To balance the back button
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  planBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  planGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  planText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.error,
  },
  editButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  accountSection: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  accountButton: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: Colors.backgroundLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  accountButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  accountButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 5,
  },
});