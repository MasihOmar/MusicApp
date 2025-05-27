// src/screens/main/PlaylistDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import { playlistService, streamService, songService, checkServerReachability } from '../../services/api';
import NetworkStatus from '../../components/NetworkStatus';
import SongCard from '../../components/SongCard';
import SongOptionsModal from '../../components/SongOptionsModal';
import PlaylistCoverArt from '../../components/PlaylistCoverArt';
import { Ionicons } from '@expo/vector-icons';

export default function PlaylistDetailScreen({ navigation, route }) {
  const { id: playlistId } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const maxRetries = 3;
  
  const fetchPlaylistData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShowNetworkError(false);
    try {
      // Fetch playlist details
      const playlistData = await playlistService.getPlaylist(playlistId);
      setPlaylist(playlistData);

      // Fetch playlist songs
      const playlistSongs = await playlistService.getPlaylistSongs(playlistId);
      console.log('Fetched playlist songs:', playlistSongs);

      if (playlistSongs && playlistSongs.length > 0) {
        // Fetch full song details for each song
        const songDetails = await Promise.all(
          playlistSongs.map(async (song) => {
            try {
              const songData = await songService.getSongById(song.id);
              return songData;
            } catch (err) {
              console.error(`Error fetching song ${song.id}:`, err);
              return null;
            }
          })
        );

        // Filter out any null values and set the songs
        const validSongs = songDetails.filter(song => song !== null);
        console.log('Valid songs:', validSongs);
        setSongs(validSongs);
      } else {
        setSongs([]);
      }
    } catch (err) {
      console.error('Error fetching playlist data:', err);
      setError('Failed to load playlist. Please try again.');
      
      // Implement retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  }, [playlistId, retryCount]);
  
  // Initial fetch
  useEffect(() => {
    fetchPlaylistData();
  }, [fetchPlaylistData]);
  
  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPlaylistData();
    });

    return unsubscribe;
  }, [navigation, fetchPlaylistData]);
  
  // Default placeholder for cover art
  const placeholderImage = streamService.getDefaultCoverArt();
  
  const handlePlayAll = () => {
    if (songs.length > 0) {
      navigation.navigate('Player', { songId: songs[0].id });
    }
  };
  
  const handleSongPress = (song) => {
    navigation.navigate('Player', { songId: song.id });
  };
  
  // Handle network retry
  const handleNetworkRetry = () => {
    setShowNetworkError(false);
    fetchPlaylistData();
  };
  
  // Handle song options modal
  const handleSongOptions = (song) => {
    setSelectedSong(song);
    setOptionsModalVisible(true);
  };
  
  // Handle song added to playlist
  const handleSongAdded = (updatedPlaylist) => {
    console.log('Song added to playlist, updating data...');
    fetchPlaylistData();
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  // Show error state
  if (error && !showNetworkError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPlaylistData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If no playlist data was found
  if (!playlist) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Playlist not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If playlist is empty, show empty state
  if (songs.length === 0) {
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <PlaylistCoverArt 
              songs={[]}
              size={180}
            />
            
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle}>{playlist.name}</Text>
              <View style={styles.playlistStats}>
                <Text style={styles.playlistSongCount}>0 songs</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.emptyText}>This playlist is empty</Text>
          <Text style={styles.emptySubText}>Add some songs to get started</Text>
          <TouchableOpacity 
            style={styles.addSongsButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.addSongsButtonText}>Add Songs</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const renderSongItem = ({ item, index }) => (
    <SongCard
      song={item}
      onPress={() => handleSongPress(item)}
      onOptionsPress={(song) => {
        setSelectedSong(song);
        setOptionsModalVisible(true);
      }}
    />
  );
  
  return (
    <View style={styles.container}>
      {showNetworkError && <NetworkStatus />}
      
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={[Colors.gradient.pop[0], Colors.backgroundDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <PlaylistCoverArt 
            songs={songs}
            size={180}
          />
          
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            
            <View style={styles.playlistStats}>
              <Text style={styles.playlistSongCount}>{`${songs.length} songs`}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.playAllButton} 
            onPress={handlePlayAll}
            disabled={songs.length === 0}
          >
            <LinearGradient
              colors={Colors.gradient.primary}
              style={styles.playAllGradient}
            >
              <Text style={styles.playAllText}>▶ Play All</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <View style={styles.songsContainer}>
        <Text style={styles.songsTitle}>{`${songs.length} Songs`}</Text>
        
        <FlatList
          key="two-column"
          data={songs}
          renderItem={renderSongItem}
          keyExtractor={(item, index) => `song-${item.id || index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.songsList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs in this playlist</Text>
            </View>
          }
        />
      </View>
      
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        onSuccess={handleSongAdded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: 10,
  },
  playlistInfo: {
    alignItems: 'center',
  },
  playlistTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  playlistStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playlistSongCount: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  playAllButton: {
    flex: 1,
    maxWidth: 200,
    borderRadius: 30,
    overflow: 'hidden',
  },
  playAllGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAllText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  songsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  songsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
    marginLeft: 10,
  },
  songsList: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  songNumber: {
    width: 25,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginRight: 5,
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginRight: 6,
  },
  songArtist: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  addSongsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  addSongsButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});