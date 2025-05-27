import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { streamService } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_SPACING = 24;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (width - (HORIZONTAL_PADDING * 2) - CARD_SPACING) / 2;

const SongCard = ({ song, onPress, onOptionsPress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const coverArtUrl = streamService.getCoverArtUrl(song);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

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
            source={{
              uri: coverArtUrl,
              width: CARD_WIDTH,
              height: CARD_WIDTH,
            }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
            cachePolicy="none"
            recyclingKey={song.id.toString()}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            placeholder={streamService.getDefaultCoverArt()}
            placeholderContentFit="cover"
            contentPosition="center"
            quality={0.5}
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
    width: CARD_WIDTH,
    marginBottom: 24,
    marginHorizontal: CARD_SPACING / 2,
  },
  content: {
    flex: 1,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
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
    backgroundColor: Colors.backgroundDark,
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
    bottom: 12,
    right: 12,
  },
  playIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  optionsButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 8,
  },
});

export default SongCard; 