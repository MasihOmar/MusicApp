// src/screens/main/HomeScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { songService, playlistService, streamService, recommendationService, playbackHistoryService, authService, interactionService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongOptionsModal from '../../components/SongOptionsModal';
import SongCard from '../../components/SongCard';
import PlaylistCoverArt from '../../components/PlaylistCoverArt';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [genreRecommendations, setGenreRecommendations] = useState([]);
  const [matrixRecommendations, setMatrixRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [recentSongs, setRecentSongs] = useState([]);

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('HomeScreen focused, refreshing data...');
      loadData();
    }, [userId])
  );

  // Move loadData outside useEffect so it can be called from useFocusEffect
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch songs and playlists in parallel
      const [songsResponse, playlistsData] = await Promise.all([
        songService.getAllSongs(),
        playlistService.getAllPlaylists()
      ]);
      
      console.log('Playlists data received:', playlistsData);
      
      // Handle error case for songs
      if (songsResponse && songsResponse.error) {
        console.error('Error fetching songs:', songsResponse.error);
        setError(songsResponse.error);
        setSongs([]);
      } else {
        setSongs(songsResponse || []);
      }
      
      // Handle error case for playlists
      if (playlistsData && playlistsData.error) {
        console.error('Error fetching playlists:', playlistsData.error);
        setError(playlistsData.error);
        setPlaylists([]);
      } else {
        console.log('Processing playlists:', playlistsData);
        // Fetch songs for each playlist (full song objects)
        const playlistsWithSongs = await Promise.all(
          (playlistsData || []).map(async (playlist) => {
            try {
              console.log('Fetching songs for playlist:', playlist.id);
              const songIds = await playlistService.getPlaylistSongs(playlist.id);
              console.log('Song IDs for playlist:', playlist.id, songIds);
              // Fetch full song objects for each song ID
              const fullSongs = await Promise.all(
                (songIds || []).map(async (song) => {
                  // If song is already a full object, just return it
                  if (song.fileName || song.file_name) return song;
                  try {
                    return await songService.getSongById(song.id);
                  } catch {
                    return null;
                  }
                })
              );
              const validSongs = fullSongs.filter(Boolean);
              return {
                ...playlist,
                songs: validSongs,
                songCount: validSongs.length
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
        
        setPlaylists(playlistsWithSongs);
      }
      
      // Get recent playbacks if user is logged in
      if (userId) {
        try {
          const isAuthenticated = await authService.isAuthenticated();
          if (isAuthenticated) {
            const recentPlaybacks = await playbackHistoryService.getRecentPlaybacks();
            if (recentPlaybacks && Array.isArray(recentPlaybacks)) {
              setRecentSongs(recentPlaybacks);
            } else {
              setRecentSongs([]);
            }
          } else {
            console.log('User not authenticated, skipping recent playbacks');
            setRecentSongs([]);
          }
        } catch (recError) {
          console.log('Error fetching recent playbacks:', recError.message);
          setRecentSongs([]);
        }
      }
      
      // Get recommendations if user is logged in
      if (userId) {
        try {
          // Get regular recommendations
          const userRecommendations = await recommendationService.getUserRecommendations(userId, 10);
          setRecommendations(userRecommendations || []);
          
          // Get matrix factorization recommendations
          try {
            const matrixRecs = await recommendationService.getMatrixRecommendations(userId, 10);
            setMatrixRecommendations(matrixRecs || []);
          } catch (matrixError) {
            console.error('Error fetching matrix recommendations:', matrixError);
            // Fall back to regular recommendations
            setMatrixRecommendations(userRecommendations || []);
          }
        } catch (recError) {
          console.error('Error fetching recommendations:', recError);
          // Fall back to filtering songs by genre
          if (songsResponse && songsResponse.length > 0) {
            const genres = [...new Set(songsResponse.map(song => song.genre))];
            if (genres.length > 0) {
              const randomGenre = genres[Math.floor(Math.random() * genres.length)];
              const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
              setRecommendations(filteredByGenre.slice(0, 10));
              setMatrixRecommendations(filteredByGenre.slice(0, 10));
            }
          }
        }
      } else {
        // If no user ID, use genre-based recommendations
        if (songsResponse && songsResponse.length > 0) {
          const genres = [...new Set(songsResponse.map(song => song.genre))];
          if (genres.length > 0) {
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
            setRecommendations(filteredByGenre.slice(0, 10));
            setMatrixRecommendations(filteredByGenre.slice(0, 10));
          }
        }
      }
      
      // Get genre-based recommendations (pick a random genre from available songs)
      if (songsResponse && songsResponse.length > 0) {
        const genres = [...new Set(songsResponse.map(song => song.genre))];
        if (genres.length > 0) {
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          try {
            const genreRecs = await recommendationService.getGenreRecommendations(randomGenre);
            setGenreRecommendations({
              genre: randomGenre,
              songs: genreRecs || []
            });
          } catch (genreError) {
            console.error('Error fetching genre recommendations:', genreError);
            // Fall back to filtering songs by the selected genre
            const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
            setGenreRecommendations({
              genre: randomGenre,
              songs: filteredByGenre.slice(0, 5)
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the old useEffect that called loadData
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      } catch (err) {
        console.error('Error getting user ID:', err);
      }
    };

    getUserId();
  }, []);

  // Helper function to get random items from an array
  const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Retry function for when API calls fail
  const retryFetch = () => {
    setSongs([]);
    setPlaylists([]);
    setRecommendations([]);
    setGenreRecommendations([]);
    setMatrixRecommendations([]);
    setIsLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        // Fetch songs and playlists in parallel
        const [songsResponse, playlistsData] = await Promise.all([
          songService.getAllSongs(),
          playlistService.getAllPlaylists()
        ]);
        
        console.log('Playlists data received:', playlistsData);
        
        // Handle error case for songs
        if (songsResponse && songsResponse.error) {
          console.error('Error fetching songs:', songsResponse.error);
          setError(songsResponse.error);
          setSongs([]);
        } else {
          setSongs(songsResponse || []);
        }
        
        // Fetch songs for each playlist (full song objects)
        const playlistsWithSongs = await Promise.all(
          (playlistsData || []).map(async (playlist) => {
            try {
              console.log('Fetching songs for playlist:', playlist.id);
              const songIds = await playlistService.getPlaylistSongs(playlist.id);
              console.log('Song IDs for playlist:', playlist.id, songIds);
              // Fetch full song objects for each song ID
              const fullSongs = await Promise.all(
                (songIds || []).map(async (song) => {
                  // If song is already a full object, just return it
                  if (song.fileName || song.file_name) return song;
                  try {
                    return await songService.getSongById(song.id);
                  } catch {
                    return null;
                  }
                })
              );
              const validSongs = fullSongs.filter(Boolean);
              return {
                ...playlist,
                songs: validSongs,
                songCount: validSongs.length
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
        
        setPlaylists(playlistsWithSongs);
        
        // Get recommendations if user is logged in
        if (userId) {
          try {
            // Get regular recommendations
            const userRecommendations = await recommendationService.getUserRecommendations(userId, 10);
            setRecommendations(userRecommendations || []);
            
            // Get matrix factorization recommendations
            try {
              const matrixRecs = await recommendationService.getMatrixRecommendations(userId, 10);
              setMatrixRecommendations(matrixRecs || []);
            } catch (matrixError) {
              console.error('Error fetching matrix recommendations on retry:', matrixError);
              // Fall back to regular recommendations
              setMatrixRecommendations(userRecommendations || []);
            }
          } catch (recError) {
            console.error('Error fetching recommendations on retry:', recError);
            // Fall back to filtering songs by genre
            if (songsResponse && songsResponse.length > 0) {
              const genres = [...new Set(songsResponse.map(song => song.genre))];
              if (genres.length > 0) {
                const randomGenre = genres[Math.floor(Math.random() * genres.length)];
                const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
                setRecommendations(filteredByGenre.slice(0, 10));
                setMatrixRecommendations(filteredByGenre.slice(0, 10));
              }
            }
          }
        } else {
          // If no user ID, use genre-based recommendations
          if (songsResponse && songsResponse.length > 0) {
            const genres = [...new Set(songsResponse.map(song => song.genre))];
            if (genres.length > 0) {
              const randomGenre = genres[Math.floor(Math.random() * genres.length)];
              const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
              setRecommendations(filteredByGenre.slice(0, 10));
              setMatrixRecommendations(filteredByGenre.slice(0, 10));
            }
          }
        }
        
        // Get genre-based recommendations
        if (songsResponse && songsResponse.length > 0) {
          const genres = [...new Set(songsResponse.map(song => song.genre))];
          if (genres.length > 0) {
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            try {
              const genreRecs = await recommendationService.getGenreRecommendations(randomGenre);
              setGenreRecommendations({
                genre: randomGenre,
                songs: genreRecs || []
              });
            } catch (genreError) {
              console.error('Error fetching genre recommendations on retry:', genreError);
              // Fall back to filtering songs by the selected genre
              const filteredByGenre = songsResponse.filter(song => song.genre === randomGenre);
              setGenreRecommendations({
                genre: randomGenre,
                songs: filteredByGenre.slice(0, 5)
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data on retry:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  };

  // Animasyonlu scroll değeri
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  // Selamlama metni oluşturma
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Günaydın';
    if (hours < 18) return 'İyi Günler';
    return 'İyi Akşamlar';
  };

  // State for song options modal
  const [selectedSong, setSelectedSong] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  // Add authentication check before recording interactions
  const checkAuthAndRecord = async (songId) => {
    try {
      // First check if we have a userId
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        console.log('No userId found, skipping interaction recording');
        return;
      }

      // Then check authentication
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping interaction recording');
        return;
      }

      // Get the current token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No auth token found, skipping interaction recording');
        return;
      }

      // Try to record interaction first
      try {
        const interactionResult = await interactionService.recordInteraction({
          songId,
          type: 'PLAY',
          timestamp: new Date().toISOString()
        });
        
        if (interactionResult && interactionResult.error) {
          console.log('Could not record interaction:', interactionResult.error);
          return; // Don't proceed with playback recording if interaction failed
        }

        // Try to record playback only if interaction was successful
        try {
          const playbackResult = await playbackHistoryService.recordPlayback(songId);
          if (playbackResult && playbackResult.error) {
            console.log('Could not record playback:', playbackResult.error);
          }
        } catch (playbackError) {
          console.log('Could not record playback:', playbackError.message);
        }
      } catch (interactionError) {
        console.log('Could not record interaction:', interactionError.message);
      }
    } catch (error) {
      console.log('Error in checkAuthAndRecord:', error.message);
      // Don't show error to user, just log it
    }
  };

  // Update the renderSongItem to use the new function
  const renderSongItem = ({ item }) => (
    <SongCard
      song={item}
      onPress={() => {
        checkAuthAndRecord(item.id);
        navigation.navigate('Player', { songId: item.id });
      }}
      onOptionsPress={(song) => {
        setSelectedSong(song);
        setOptionsModalVisible(true);
      }}
    />
  );

  // Update the renderRecommendationItem to use the new function
  const renderRecommendationItem = ({ item }) => (
    <SongCard
      song={item}
      onPress={() => {
        checkAuthAndRecord(item.id);
        navigation.navigate('Player', { songId: item.id });
      }}
      onOptionsPress={(song) => {
        setSelectedSong(song);
        setOptionsModalVisible(true);
      }}
    />
  );

  // Render playlist item - using API data
  const renderPlaylistItem = ({ item }) => {
    console.log('HomeScreen Playlist:', item);
    if (item.songs) {
      item.songs.forEach((song, idx) => {
        console.log(`  Song ${idx}:`, song.fileName || song.file_name, song);
      });
    } else {
      console.log('  No songs in this playlist');
    }
    return (
      <TouchableOpacity 
        style={styles.featuredItem}
        onPress={() => navigation.navigate('PlaylistDetail', { id: item.id })}
      >
        <View style={styles.featuredImageContainer}>
          <PlaylistCoverArt 
            songs={item.songs || []}
            size={180}
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 14, 23, 0.8)']}
            style={styles.featuredGradient}
          />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.name}</Text>
            <Text style={styles.featuredDescription}>{`${item.songCount || 0} songs`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.backgroundDark, Colors.background]}
        style={[styles.container, styles.centerContent]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </LinearGradient>
    );
  }

  // Show error message
  if (error) {
    return (
      <LinearGradient
        colors={[Colors.backgroundDark, Colors.background]}
        style={[styles.container, styles.centerContent]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={retryFetch}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.backgroundDark, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Song options modal */}
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        navigation={navigation}
      />
      
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <LinearGradient
            colors={Colors.gradient.primary}
            style={styles.profileGradient}
          >
            <Text style={styles.profileLetter}>K</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Ana İçerik */}
      <Animated.ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* API Songs Section */}
        {songs && songs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popüler Şarkılar</Text>
            <FlatList
              data={songs}
              renderItem={renderSongItem}
              keyExtractor={item => `song-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
        )}

        {/* API Playlists Section */}
        {playlists && playlists.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Çalma Listeleri</Text>
            {console.log('Rendering playlists:', playlists)}
            <FlatList
              data={playlists}
              renderItem={renderPlaylistItem}
              keyExtractor={item => `playlist-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalList}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
        )}
        
        {/* Recently Played Section */}
        {userId && recentSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <FlatList
              data={recentSongs}
              renderItem={renderSongItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueListContainer}
            />
          </View>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <FlatList
              data={recommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsContainer}
            />
          </View>
        )}

        {/* Matrix Factorization Recommendations Section */}
        {matrixRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover with AI</Text>
            <Text style={styles.sectionSubtitle}>Using matrix factorization</Text>
            <FlatList
              data={matrixRecommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={item => item.id.toString() + '_matrix'}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsContainer}
            />
          </View>
        )}

        {/* Genre Recommendations Section */}
        {genreRecommendations.songs && genreRecommendations.songs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best of {genreRecommendations.genre}</Text>
            <FlatList
              data={genreRecommendations.songs}
              renderItem={renderRecommendationItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendationsContainer}
            />
          </View>
        )}
        
        {/* Featured Playlists Section */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Featured Playlists</Text>
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredListContainer}
          />
        </View>
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 20,
    marginBottom: 15,
  },
  horizontalList: {
    paddingLeft: 0,
  },
  horizontalListContent: {
    paddingRight: 0,
    marginRight: 20,
  },
  continueItem: {
    width: width * 0.4,
    marginRight: 15,
    position: 'relative',
  },
  continueItemContent: {
    width: '100%',
  },
  songOptionsButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  continueItemImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  continueItemCover: {
    width: '100%',
    height: '100%',
  },
  continueItemGradient: {
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
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  playIconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  continueItemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  continueItemArtist: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  featuredItem: {
    width: width * 0.7,
    marginRight: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    zIndex: 2,
  },
  featuredTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  continueListContainer: {
    paddingRight: 16,
  },
  recommendationItem: {
    width: 140,
    marginRight: 16,
    position: 'relative',
  },
  recommendationContent: {
    width: '100%',
  },
  recommendationImageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.cardBackground,
  },
  recommendationCover: {
    width: '100%',
    height: '100%',
  },
  recommendationGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  recommendationPlayIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  recommendationPlayIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationPlayIcon: {
    color: 'white',
    fontSize: 16,
  },
  recommendationTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationArtist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  featuredListContainer: {
    paddingRight: 0,
    marginRight: 20,
  },
  lastSection: {
    paddingBottom: 40,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
});