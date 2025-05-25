// src/screens/main/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  
  // User info from context
  const userInfo = {
    displayName: user?.username || 'Kullanıcı Adı',
    email: user?.email || 'user@example.com',
    plan: 'Premium'
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await logout();
      // After logout, navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundDark, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        
        <View style={styles.profileSection}>
          <LinearGradient
            colors={Colors.gradient.primary}
            style={styles.profileImage}
          >
            <Text style={styles.profileInitial}>{userInfo.displayName.charAt(0)}</Text>
          </LinearGradient>
          
          <View style={styles.profileInfo}>
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
          </View>
        </View>
        
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          
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
              <Text style={styles.accountButtonText}>Ayarlar</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountButton}>
            <LinearGradient
              colors={Colors.gradient.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Hesap Bilgilerini Düzenle</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountButton}>
            <LinearGradient
              colors={Colors.gradient.cardPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Şifreni Değiştir</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.accountButton, styles.logoutButton]} onPress={handleLogout}>
            <LinearGradient
              colors={['#d31027', '#ea384d']} // Kırmızı gradyan
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accountButtonGradient}
            >
              <Text style={styles.accountButtonText}>Çıkış Yap</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versiyon 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 MusicApp</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 10,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: 24,
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