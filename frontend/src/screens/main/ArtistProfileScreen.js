import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { songService, streamService } from '../../services/api';
import SongCard from '../../components/SongCard';

const BATCH_SIZE = 10; // Number of songs to load at once

export default function ArtistProfileScreen({ navigation, route }) {
  const { artistName } = route.params;
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artistCover, setArtistCover] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchArtistSongs();
  }, [artistName]);

  const fetchArtistSongs = async (pageNum = 0) => {
    try {
      const allSongs = await songService.getAllSongs();
      const artistSongs = allSongs.filter(song => 
        song.artist && song.artist.trim() === artistName
      );
      
      // Set artist cover from first song if not already set
      if (artistSongs.length > 0 && !artistCover) {
        const coverUrl = streamService.getCoverArtUrl(artistSongs[0]);
        setArtistCover(coverUrl);
      }
      
      // Calculate pagination
      const start = pageNum * BATCH_SIZE;
      const end = start + BATCH_SIZE;
      const batch = artistSongs.slice(start, end);
      
      setSongs(prev => pageNum === 0 ? batch : [...prev, ...batch]);
      setHasMore(end < artistSongs.length);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching artist songs:', err);
      setError('Failed to load artist songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchArtistSongs(page + 1);
    }
  };

  const handleSongPress = (song) => {
    navigation.navigate('Player', { songId: song.id });
  };

  const renderSongItem = ({ item }) => (
    <SongCard
      song={item}
      onPress={() => handleSongPress(item)}
    />
  );

  const keyExtractor = (item) => item.id.toString();

  if (isLoading && songs.length === 0) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchArtistSongs(0)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={[Colors.gradient.pop[0], Colors.backgroundDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.artistInfo}>
          <Image
            source={artistCover || streamService.getDefaultCoverArt()}
            style={styles.artistImage}
            contentFit="cover"
            transition={1000}
            cachePolicy="memory-disk"
          />
          <Text style={styles.artistName}>{artistName}</Text>
          <Text style={styles.songCount}>{songs.length} songs</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[Colors.backgroundDark, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.contentGradient}
      >
        <ScrollView style={styles.songsContainer}>
          <Text style={styles.sectionTitle}>Songs</Text>
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={keyExtractor}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.songsList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={4}
            windowSize={3}
            initialNumToRender={4}
            updateCellsBatchingPeriod={50}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => 
              isLoading ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : null
            }
          />
          {/* Bottom padding */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 50,
  },
  contentGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  artistInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  songCount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  songsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  songsList: {
    paddingBottom: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
}); 