import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import { streamService } from '../services/api';

export default function ArtistCard({ artist, onPress }) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <LinearGradient
        colors={Colors.gradient.cardHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.coverContainer}>
          <Image 
            source={{ uri: streamService.getCoverArtUrl(artist) }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory"
            recyclingKey={`artist-${artist.id}`}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{artist.name}</Text>
          <Text style={styles.type}>{`${artist.songCount} şarkı`}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  coverContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  type: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
}); 