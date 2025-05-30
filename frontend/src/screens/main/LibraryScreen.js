// src/screens/main/LibraryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { playlistService, streamService, songService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import PlaylistCoverArt from '../../components/PlaylistCoverArt';
import ArtistCard from '../../components/ArtistCard';

export default function LibraryScreen({ navigation }) {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('playlists');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);

  // Get user's display initial
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  // Fetch data based on active filter
  const fetchData = useCallback(async () => {
    if (activeFilter === 'playlists') {
      await fetchPlaylists();
    } else if (activeFilter === 'artists') {
      await fetchArtists();
    }
  }, [activeFilter]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation, fetchData]);

  const fetchPlaylists = async () => {
    if (activeFilter !== 'playlists') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const playlistsData = await playlistService.getAllPlaylists();
      
      // Fetch songs for each playlist
      const playlistsWithSongs = await Promise.all(
        playlistsData.map(async (playlist) => {
          try {
            const songs = await playlistService.getPlaylistSongs(playlist.id);
            return {
              ...playlist,
              songs: songs || [],
              songCount: songs ? songs.length : 0
            };
          } catch (err) {
            console.error(`Error fetching songs for playlist ${playlist.id}:`, err);
            return {
              ...playlist,
              songs: [],
              songCount: 0
            };
          }
        })
      );
      
      setPlaylists(playlistsWithSongs || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError('Failed to load playlists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchArtists = async () => {
    if (activeFilter !== 'artists') return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Get all songs to extract unique artists
      const songs = await songService.getAllSongs();
      
      // Extract unique artists from songs
      const artistMap = {};
      let processedCount = 0;
      const BATCH_SIZE = 20; // Process 20 songs at a time
      
      // Process songs in batches
      for (let i = 0; i < songs.length; i += BATCH_SIZE) {
        const batch = songs.slice(i, i + BATCH_SIZE);
        
        // Process each song in the batch
        batch.forEach(song => {
          if (song.artist) {
            const artistName = song.artist.trim();
            if (artistName && !artistMap[artistName]) {
              // Only get cover URL for the first song of each artist
              const coverUrl = streamService.getCoverArtUrl(song);
              artistMap[artistName] = {
                id: song.id,
                name: artistName,
                cover: coverUrl,
                songCount: 1
              };
            } else if (artistName) {
              // Just increment count for existing artists
              artistMap[artistName].songCount++;
            }
          }
        });
        
        processedCount += batch.length;
        
        // Update state with current progress
        const currentArtists = Object.values(artistMap);
        setArtists(currentArtists);
        
        // Add a small delay between batches
        if (i + BATCH_SIZE < songs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Failed to load artists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOptions = [
    { id: 'playlists', name: 'Çalma Listeleri' },
    { id: 'artists', name: 'Sanatçılar' },
    { id: 'albums', name: 'Albümler' }
  ];

  const handleDeletePlaylist = async (playlistId, playlistName) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlistName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await playlistService.deletePlaylist(playlistId);
              // Refresh the playlists list
              fetchPlaylists();
            } catch (err) {
              console.error('Error deleting playlist:', err);
              Alert.alert('Error', 'Failed to delete playlist. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => navigation.navigate('PlaylistDetail', { id: item.id })}
    >
      <LinearGradient
        colors={Colors.gradient.cardPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.playlistGradient}
      >
        <View style={styles.playlistCoverContainer}>
          <PlaylistCoverArt 
            songs={item.songs || []}
            size={60}
          />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle}>{item.title || item.name}</Text>
          <Text style={styles.playlistTracks}>
            {`Çalma Listesi • ${item.songCount || 0} şarkı`}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeletePlaylist(item.id, item.title || item.name)}
        >
          <Ionicons name="trash-outline" size={24} color={Colors.error || '#ff6b6b'} />
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }) => {
    if (!item || !item.name) {
      console.error('Invalid artist item:', item);
      return null;
    }
    
    return (
      <ArtistCard
        artist={item}
        onPress={() => navigation.navigate('ArtistProfile', { artistName: item.name })}
      />
    );
  };

  const renderFilterButton = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.filterButton, 
        activeFilter === item.id && styles.activeFilter
      ]}
      onPress={() => setActiveFilter(item.id)}
    >
      <Text 
        style={[
          styles.filterText, 
          activeFilter === item.id && styles.activeFilterText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaylistsSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading playlists...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchPlaylists}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const playlistsToRender = playlists.length > 0 ? playlists : [];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Çalma Listeleri</Text>
          <TouchableOpacity>
            <Text style={styles.sortButton}>Son Oynatılana Göre</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={playlistsToRender}
          renderItem={renderPlaylistItem}
          keyExtractor={item => `playlist-${item.id}`}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundDark, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kütüphanen</Text>
        
        <FlatList
          data={filterOptions}
          renderItem={renderFilterButton}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        />
      </View>

      <ScrollView style={styles.content}>
        {activeFilter === 'playlists' && renderPlaylistsSection()}
        
        {activeFilter === 'artists' && (
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sanatçılar</Text>
            </View>
            
            <FlatList
              data={artists}
              renderItem={renderArtistItem}
              keyExtractor={item => `artist-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {activeFilter === 'albums' && (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>Henüz hiç albümünüz yok.</Text>
            <TouchableOpacity 
              style={styles.exploreButtonContainer}
              onPress={() => navigation.navigate('Search')}
            >
              <LinearGradient
                colors={Colors.gradient.buttonPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreButton}
              >
                <Text style={styles.exploreButtonText}>Albümleri Keşfet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Alt padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilter: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sortButton: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  playlistItem: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  playlistCoverContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  playlistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  playlistTracks: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  artistItem: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  artistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  artistCoverContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
  },
  artistCover: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  artistType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreButtonContainer: {
    width: '80%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  exploreButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastSection: {
    marginBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    paddingVertical: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error || '#ff6b6b',
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
});