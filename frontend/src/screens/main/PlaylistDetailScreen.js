// src/screens/main/PlaylistDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
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

export default function PlaylistDetailScreen({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlist, setPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  
  // Get playlist ID from route params
  const playlistId = route?.params?.id;
  
  // Reference to the fetchPlaylistData function for retry mechanism
  const fetchPlaylistData = async () => {
    if (!playlistId) return;
    
    setIsLoading(true);
    setError(null);
    setShowNetworkError(false);
    
    try {
      // Check if server is reachable first
      const isReachable = await checkServerReachability();
      
      if (!isReachable) {
        setShowNetworkError(true);
        setIsLoading(false);
        setError('Server not reachable');
        return;
      }
      
      // Fetch both playlist details and songs
      const [playlistData, playlistSongsData] = await Promise.all([
        playlistService.getPlaylistById(playlistId),
        playlistService.getPlaylistSongs(playlistId)
      ]);
      
      setPlaylist(playlistData);

      // In case we only get IDs instead of full song objects
      if (playlistSongsData && playlistSongsData.length > 0 && playlistSongsData[0].song_id) {
        // Fetch each song's details
        const songDetailsPromises = playlistSongsData.map(item => 
          songService.getSongById(item.song_id)
        );
        
        const songDetails = await Promise.all(songDetailsPromises);
        setPlaylistSongs(songDetails.filter(song => song && song.id));
      } else {
        setPlaylistSongs(playlistSongsData || []);
      }
      
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching playlist data:', err);
      
      // Check if this is a network error
      if (err.message && (
          err.message.includes('Network request failed') || 
          err.message.includes('timed out') ||
          err.message.includes('Server not reachable')
        )) {
        setShowNetworkError(true);
      }
      
      setError('Failed to load playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch playlist details and songs
  useEffect(() => {
    fetchPlaylistData();
  }, [playlistId]);
  
  // Auto-retry mechanism for network issues
  useEffect(() => {
    if (error && error.includes('Network') && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying fetch (attempt ${retryCount + 1})...`);
        setRetryCount(prev => prev + 1);
        fetchPlaylistData();
      }, 3000); // Retry after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);
  
  // Default placeholder for cover art
  const placeholderImage = streamService.getDefaultCoverArt();
  
  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      navigation.navigate('Player', { songId: playlistSongs[0].id });
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
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
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
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <Image 
            source={{ uri: placeholderImage }} 
            style={styles.playlistCover}
            defaultSource={{ uri: placeholderImage }}
          />
          
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            
            <View style={styles.playlistStats}>
              <Text style={styles.playlistSongCount}>{`${playlistSongs.length} songs`}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.playAllButton} 
            onPress={handlePlayAll}
            disabled={playlistSongs.length === 0}
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
        <Text style={styles.songsTitle}>{`${playlistSongs.length} Songs`}</Text>
        
        <FlatList
          data={playlistSongs}
          renderItem={renderSongItem}
          keyExtractor={(item, index) => `song-${item.id || index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.songsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs in this playlist</Text>
            </View>
          }
        />
      </View>
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
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: 24,
  },
  playlistCover: {
    width: 180,
    height: 180,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
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
    paddingHorizontal: 16,
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
    color: Colors.textSecondary,
    fontSize: 16,
  },
});