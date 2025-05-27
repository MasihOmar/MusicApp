// src/screens/main/SearchScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { searchService, streamService, songService } from '../../services/api';
import { debounce } from 'lodash';
import SongOptionsModal from '../../components/SongOptionsModal';
import SongCard from '../../components/SongCard';

// Get category gradient
const getCategoryGradient = (type) => {
  return Colors.gradient[type] || Colors.gradient.primary;
};

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch songs for categories extraction
        const songs = await songService.getAllSongs();
        
        // Extract unique genres as categories
        const genreMap = {};
        let categoryId = 1;
        
        songs.forEach(song => {
          if (song.genre && !genreMap[song.genre]) {
            // Convert genre to a suitable type for gradients
            const type = song.genre.toLowerCase().replace(/\s+/g, '');
            
            genreMap[song.genre] = {
              id: String(categoryId++),
              name: song.genre,
              type: type
            };
          }
        });
        
        const extractedCategories = Object.values(genreMap);
        setCategories(extractedCategories);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    };
    
    fetchInitialData();
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // Try server-side search first
        const results = await searchService.search(query);
        
        // If results come back but don't seem to be filtered correctly
        // or if the results are empty, fall back to client-side filtering
        if (!results || results.length === 0 || !isResultsRelevant(results, query)) {
          console.log('Server search returned poor results, using client-side filtering');
          const allSongs = await songService.getAllSongs();
          const filteredResults = filterSongsByQuery(allSongs, query);
          setSearchResults(filteredResults);
        } else {
          setSearchResults(results || []);
        }
      } catch (err) {
        console.error('Error searching:', err);
        setError('Search failed. Falling back to local search.');
        
        // Fallback to client-side filtering
        try {
          const allSongs = await songService.getAllSongs();
          const filteredResults = filterSongsByQuery(allSongs, query);
          setSearchResults(filteredResults);
          setError(null);
        } catch (fallbackErr) {
          console.error('Error in fallback search:', fallbackErr);
          setError('Search failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );
  
  // Helper function to check if search results are relevant to the query
  const isResultsRelevant = (results, query) => {
    if (!results || results.length === 0) return false;
    
    const lowerQuery = query.toLowerCase();
    // Check if any result has the query in the title or artist with high relevance
    const hasHighRelevance = results.some(song => 
      song.title.toLowerCase().includes(lowerQuery) || 
      (song.artist && song.artist.toLowerCase().includes(lowerQuery))
    );
    
    return hasHighRelevance;
  };
  
  // Client-side song filtering function
  const filterSongsByQuery = (songs, query) => {
    if (!songs || !query) return [];
    
    const lowerQuery = query.toLowerCase();
    
    // First find exact matches in title and artist
    const exactMatches = songs.filter(song => 
      song.title.toLowerCase().includes(lowerQuery) || 
      (song.artist && song.artist.toLowerCase().includes(lowerQuery))
    );
    
    // If we have exact matches, return those
    if (exactMatches.length > 0) {
      // Sort by relevance - exact title matches first, then artist matches
      return exactMatches.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aArtist = (a.artist || '').toLowerCase();
        const bArtist = (b.artist || '').toLowerCase();
        
        // Exact title match gets highest priority
        if (aTitle === lowerQuery && bTitle !== lowerQuery) return -1;
        if (bTitle === lowerQuery && aTitle !== lowerQuery) return 1;
        
        // Then titles that start with the query
        if (aTitle.startsWith(lowerQuery) && !bTitle.startsWith(lowerQuery)) return -1;
        if (bTitle.startsWith(lowerQuery) && !aTitle.startsWith(lowerQuery)) return 1;
        
        // Then titles that contain the query
        if (aTitle.includes(lowerQuery) && !bTitle.includes(lowerQuery)) return -1;
        if (bTitle.includes(lowerQuery) && !aTitle.includes(lowerQuery)) return 1;
        
        // Then artist matches
        if (aArtist === lowerQuery && bArtist !== lowerQuery) return -1;
        if (bArtist === lowerQuery && aArtist !== lowerQuery) return 1;
        
        // Then artists that start with the query
        if (aArtist.startsWith(lowerQuery) && !bArtist.startsWith(lowerQuery)) return -1;
        if (bArtist.startsWith(lowerQuery) && !aArtist.startsWith(lowerQuery)) return 1;
        
        return 0;
      });
    }
    
    // Otherwise try fuzzy matching (simplified)
    return songs.filter(song => {
      // Check words in title
      const titleWords = song.title.toLowerCase().split(/\s+/);
      for (const word of titleWords) {
        if (word.startsWith(lowerQuery) || lowerQuery.startsWith(word)) {
          return true;
        }
      }
      
      // Check words in artist
      if (song.artist) {
        const artistWords = song.artist.toLowerCase().split(/\s+/);
        for (const word of artistWords) {
          if (word.startsWith(lowerQuery) || lowerQuery.startsWith(word)) {
            return true;
          }
        }
      }
      
      // Check by genre
      if (song.genre && song.genre.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
  };

  // Handle search input
  const handleSearch = (text) => {
    setSearchQuery(text);
    setSearching(text.length > 0);
    
    if (text.length > 0) {
      setIsLoading(true);
      setError(null);
      debouncedSearch(text);
    } else {
      setSearchResults([]);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearching(false);
    setSearchResults([]);
  };

  // Handle category selection
  const handleCategorySelect = async (category) => {
    setSearchQuery(category.name);
    setSearching(true);
    setIsLoading(true);
    
    try {
      const results = await searchService.search(category.name);
      
      // If server search doesn't return good results, filter locally
      if (!results || results.length === 0 || !isResultsRelevant(results, category.name)) {
        const allSongs = await songService.getAllSongs();
        const filteredResults = allSongs.filter(song => 
          song.genre && song.genre.toLowerCase() === category.name.toLowerCase()
        );
        setSearchResults(filteredResults);
      } else {
        setSearchResults(results || []);
      }
    } catch (err) {
      console.error('Error searching by category:', err);
      
      // Fallback to filtering locally
      try {
        const allSongs = await songService.getAllSongs();
        const filteredResults = allSongs.filter(song => 
          song.genre && song.genre.toLowerCase() === category.name.toLowerCase()
        );
        setSearchResults(filteredResults);
      } catch (fallbackErr) {
        console.error('Error in fallback category search:', fallbackErr);
        setError('Category search failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item)}
    >
      <LinearGradient
        colors={getCategoryGradient(item.type)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render search result item
  const renderSearchResultItem = ({ item }) => (
    <SongCard
      song={item}
      onPress={() => navigation.navigate('Player', { songId: item.id })}
      onOptionsPress={(song) => {
        setSelectedSong(song);
        setOptionsModalVisible(true);
      }}
    />
  );

  // State for song options modal
  const [selectedSong, setSelectedSong] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

  return (
    <LinearGradient
      colors={[Colors.backgroundDark, Colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.6 }}
      style={styles.gradientContainer}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>
      
      {/* Song options modal */}
      <SongOptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        song={selectedSong}
        navigation={navigation}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs or genres"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!searching ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={item => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.categoriesGrid}
              />
            </View>
          </>
        ) : (
          <View style={styles.searchResultsContainer}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResultItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.searchResultsList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={50} color={Colors.textSecondary} />
                <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>Try a different search term</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    marginBottom: 16,
  },
  optionsButton: {
    padding: 8,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInputContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  noResultsText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  searchResultsList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultArtist: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  playButton: {
    marginLeft: 8,
  },
  playButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: 'white',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  lastSection: {
    paddingBottom: 100, // Tab bar space
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingBottom: 8,
  },
  categoryItem: {
    flex: 1,
    height: 100,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  categoryName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});