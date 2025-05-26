import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// API URL configuration
let API_URL = '';
let connectionStatus = {
  isConnected: true,
  serverReachable: false
};

// Default IP addresses by platform
const getDefaultApiUrl = () => {
  // For Android emulator
  return 'http://10.0.2.2:8080'; // Special IP for Android emulator to access host's localhost
};

// Initialize API URL
export const initApiConfig = async () => {
  try {
    // Clear stored URL to force using the new default
    await AsyncStorage.removeItem('apiUrl');
    
    // Use default URL
    API_URL = getDefaultApiUrl();
    console.log('Using default API URL:', API_URL);
    
    // Store the default URL
    await AsyncStorage.setItem('apiUrl', API_URL);
    
    // Check if server is reachable
    const isReachable = await checkServerReachability();
    console.log('Server reachability check:', isReachable ? 'SUCCESS' : 'FAILED');
    
    return isReachable;
  } catch (error) {
    console.error('Failed to initialize API config:', error);
    // Fallback to default URL if storage fails
    API_URL = getDefaultApiUrl();
    return false;
  }
};

// Check if the server is reachable
export const checkServerReachability = async () => {
  try {
    // First check if device has internet connection
    const netInfo = await NetInfo.fetch();
    connectionStatus.isConnected = netInfo.isConnected;
    
    if (!netInfo.isConnected) {
      console.log('Device not connected to internet');
      connectionStatus.serverReachable = false;
      return false;
    }
    
    console.log('Testing connection to:', API_URL);
    console.log('Network type:', netInfo.type);
    console.log('Network details:', JSON.stringify(netInfo.details, null, 2));
    
    // Try to ping the server using the playlists endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds
    
    try {
      console.log('Making test request to:', `${API_URL}/sql/playlists`);
      const response = await fetch(`${API_URL}/sql/playlists`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      connectionStatus.serverReachable = response.ok;
      
      console.log(`Server response status: ${response.status}`);
      console.log(`Server reachability check: ${response.ok ? 'SUCCESS' : 'FAILED'}`);
      return response.ok;
    } catch (err) {
      clearTimeout(timeoutId);
      console.log('Server unreachable. Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      connectionStatus.serverReachable = false;
      return false;
    }
  } catch (error) {
    console.error('Error checking server reachability:', error);
    connectionStatus.serverReachable = false;
    return false;
  }
};

// Call initApiConfig immediately
initApiConfig();

// Allow manually updating the API URL (for settings screen)
export const updateApiUrl = async (newUrl) => {
  try {
    await AsyncStorage.setItem('apiUrl', newUrl);
    API_URL = newUrl;
    console.log('API URL updated to:', API_URL);
    
    // Check if the new server is reachable
    const isReachable = await checkServerReachability();
    return isReachable;
  } catch (error) {
    console.error('Failed to update API URL:', error);
    return false;
  }
};

// Default placeholder image for fallback
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/300';

// Get current connection status
export const getConnectionStatus = () => {
  return { ...connectionStatus };
};

// Create a function to handle API requests
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  // Check connection before attempting request
  if (!connectionStatus.isConnected) {
    console.log('No internet connection, cannot make request');
    throw new Error('No internet connection. Please check your network settings.');
  }
  
  console.log('Current API_URL:', API_URL);
  console.log('Making request to endpoint:', endpoint);
  console.log('Full URL:', `${API_URL}${endpoint}`);
  
  const token = await AsyncStorage.getItem('userToken');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    console.log(`Making ${method} request to: ${API_URL}${endpoint}`);
    console.log('Request headers:', headers);
    
    // Add timeout to request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15 seconds
    config.signal = controller.signal;
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    clearTimeout(timeoutId);
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    // Get response text first to check if empty
    const text = await response.text();
    
    // If empty response, return empty array or object depending on endpoint
    if (!text) {
      console.log(`Empty response from ${endpoint}, returning empty result`);
      if (endpoint.includes('/songs') || endpoint.includes('/playlists')) {
        return [];
      }
      return {};
    }
    
    // Parse JSON only if there's something to parse
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'for text:', text);
      // If parsing fails, return a sensible default
      if (endpoint.includes('/songs') || endpoint.includes('/playlists')) {
        return [];
      }
      return {};
    }
  } catch (error) {
    console.error('API request failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Check if the error is due to a timeout
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Server might be down or network is slow.');
    }
    
    // Update connection status if we get network errors
    if (error.message.includes('Network request failed')) {
      connectionStatus.serverReachable = false;
      await checkServerReachability();
    }
    
    throw error;
  }
};

// API service functions aligned with database structure
export const userService = {
  login: (username, password) => apiRequest('/users/login', 'POST', { email: username, password: password }),
  register: (userData) => apiRequest('/users/add', 'POST', userData),
  getUser: (id) => apiRequest(`/sql/users/${id}`),
  validateToken: async (token) => {
    try {
      // Since there's no dedicated endpoint to validate tokens,
      // we'll try to make a basic API call that requires authentication
      // If it succeeds, the token is valid
      const songs = await apiRequest('/sql/songs');
      
      // If we get here, token is valid (or no auth required for /songs)
      // Get the user ID from the token if possible
      if (token) {
        try {
          // Try to extract user ID from JWT token or get it from storage
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            return await apiRequest(`/sql/users/${userId}`);
          }
        } catch (err) {
          console.log('Error getting user data:', err);
        }
      }
      
      // Return a minimal valid object if we can't get the user details
      return { valid: true };
    } catch (error) {
      console.log('Token validation failed:', error);
      return null; // If request fails, token is invalid
    }
  },
};

export const songService = {
  getAllSongs: () => apiRequest('/sql/songs'),
  getSongById: async (id) => {
    const response = await apiRequest(`/sql/songs/${id}`);
    console.log('Raw API response for song:', JSON.stringify(response, null, 2));
    return response;
  },
  addSong: (songData) => apiRequest('/sql/songs/add', 'POST', songData),
};

export const playlistService = {
  getAllPlaylists: () => apiRequest('/sql/playlists'),
  getPlaylist: (id) => apiRequest(`/sql/playlists/${id}`),
  createPlaylist: (playlistData) => apiRequest('/sql/playlists/add', 'POST', playlistData),
  getPlaylistSongs: (id) => apiRequest(`/sql/playlists/${id}/songs`),
  addSongToPlaylist: async (playlistId, songId) => {
    try {
      // First add the song to the playlist
      await apiRequest(`/sql/playlists/add-song/playlist/${playlistId}/song/${songId}`, 'POST');
      
      // Then fetch the updated playlist to ensure we have the latest data
      const updatedPlaylist = await apiRequest(`/sql/playlists/${playlistId}`);
      return updatedPlaylist;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  },
  removeSongFromPlaylist: (playlistId, songId) => 
    apiRequest(`/playlist-songs/delete/playlist/${playlistId}/song/${songId}`, 'DELETE'),
  deletePlaylist: (id) => apiRequest(`/sql/playlists/delete/${id}`, 'DELETE'),
};

// Stream services for audio and images
export const streamService = {
  getSongStreamUrl: (filename) => {
    // console.log('API_URL:', API_URL);
    // console.log('Filename:', filename);
    if (!filename) {
      // console.log('Filename is null or undefined');
      return null;
    }
    // const url = `${API_URL}/api/music/stream/${encodeURIComponent(filename)}`;
    // console.log('Constructed stream URL:', url);
    return `${API_URL}/api/music/stream/${encodeURIComponent(filename)}`;
  },
  getCoverArtUrl: (filename) => {
    // if (!filename) return DEFAULT_PLACEHOLDER;
    if (!filename) return DEFAULT_PLACEHOLDER;
    // let coverFilename = filename.replace(/\.mp3$/i, '') + '.png';
    let coverFilename = filename.replace(/\.mp3$/i, '') + '.png';
    // return `${API_URL}/api/music/cover/${encodeURIComponent(coverFilename)}`;
    return `${API_URL}/api/music/cover/${encodeURIComponent(coverFilename)}`;
  },
  getDefaultCoverArt: () => {
    // console.log('Using default cover art');
    return DEFAULT_PLACEHOLDER;
  }
};

// Search services
export const searchService = {
  // Search with fuzzy matching
  fuzzySearch: (query, maxDistance = 2) => 
    apiRequest(`/api/search/fuzzy?query=${encodeURIComponent(query)}&maxDistance=${maxDistance}`),
  
  // Get autocomplete suggestions
  getAutocomplete: (query) => 
    apiRequest(`/api/search/autocomplete?query=${encodeURIComponent(query)}`),
  
  // Build search index (admin function)
  buildSearchIndex: () => apiRequest('/api/search/index', 'POST')
};

// Recommendation services
export const recommendationService = {
  // Get personalized recommendations for a user
  getUserRecommendations: (userId, limit = 10) => 
    apiRequest(`/api/recommendations/user/${userId}?limit=${limit}`),
  
  // Get recommendations based on genre
  getGenreRecommendations: (genre, clusters = 5) => 
    apiRequest(`/api/recommendations/genre/${encodeURIComponent(genre)}?clusters=${clusters}`),
    
  // Get recommendations using matrix factorization
  getMatrixRecommendations: (userId, limit = 10) =>
    apiRequest(`/api/recommendations/matrix/${userId}?limit=${limit}`),
    
  // Simple recommendation methods that don't require training
  getPopularRecommendations: (limit = 10) =>
    apiRequest(`/api/simple-recommendations/popular?limit=${limit}`),
    
  getRandomRecommendations: (limit = 10) =>
    apiRequest(`/api/simple-recommendations/random?limit=${limit}`),
    
  getSimilarSongs: (songId, limit = 10) =>
    apiRequest(`/api/simple-recommendations/similar/${songId}?limit=${limit}`),
    
  getSimpleGenreRecommendations: (genre, limit = 10) =>
    apiRequest(`/api/simple-recommendations/genre/${encodeURIComponent(genre)}?limit=${limit}`)
};

// User interaction tracking service
export const interactionService = {
  // Record any user interaction with a song (play, skip, complete)
  recordInteraction: async (interactionData) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found, cannot record interaction');
        return null;
      }
      
      // Add userId to the interaction data
      const data = {
        ...interactionData,
        userId: parseInt(userId, 10),
        timestamp: new Date().toISOString()
      };
      
      return apiRequest('/api/interactions', 'POST', data);
    } catch (error) {
      console.error('Error recording interaction:', error);
      return null;
    }
  },
  
  // Get all interactions for the current user
  getUserInteractions: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found, cannot get interactions');
        return [];
      }
      
      return apiRequest(`/api/interactions/user/${userId}`);
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return [];
    }
  },
  
  // Get all skipped songs for the current user
  getSkippedSongs: async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.log('No user ID found, cannot get skipped songs');
        return [];
      }
      
      return apiRequest(`/api/interactions/user/${userId}/skipped`);
    } catch (error) {
      console.error('Error getting skipped songs:', error);
      return [];
    }
  }
}; 