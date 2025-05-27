import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { streamService } from '../services/api';

const { width } = Dimensions.get('window');

const SongCard = ({ song, onPress, onOptionsPress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const coverArtUrl = streamService.getCoverArtUrl(song);
  // console.log('Song:', song.title);
  // console.log('FileName:', song.fileName);
  // console.log('Cover Art URL:', coverArtUrl);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.content}
        onPress={onPress}
      >
        <View style={styles.imageWrapper}>
          {isLoading && (
            <View style={[styles.cover, styles.loadingContainer]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
          <Image 
            source={{ uri: coverArtUrl }} 
            style={[styles.cover, hasError && styles.errorImage]}
            defaultSource={{ uri: streamService.getDefaultCoverArt() }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={(error) => {
              // console.log('Image loading error for song:', song.title);
              // console.log('Error details:', error.nativeEvent.error);
              // console.log('Attempted URL:', coverArtUrl);
              setHasError(true);
              setIsLoading(false);
            }}
            onLoad={() => {
              // console.log('Image loaded successfully for song:', song.title);
              setHasError(false);
            }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0.3 }}
            style={styles.gradient}
          />
          <View style={styles.playIconContainer}>
            <LinearGradient
              colors={Colors.gradient.primary}
              style={styles.playIconGradient}
            >
              <Text style={styles.playIcon}>▶</Text>
            </LinearGradient>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist || 'Unknown Artist'}</Text>
      </TouchableOpacity>
      {onOptionsPress && (
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => onOptionsPress(song)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.4,
    marginRight: 16,
  },
  content: {
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: Colors.cardBackground,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
  },
  errorImage: {
    opacity: 0.5,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  playIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optionsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
});

export default SongCard; 