import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// API URL configuration
let API_URL = '';
let API_VERSION = 'v1'; // Set version prefix to v1
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
    
    // Try to ping the server using the health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      console.log('Making test request to:', `${API_URL}/v1/api/health/ping`);
      const response = await fetch(`${API_URL}/v1/api/health/ping`, {
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

// Helper function to build a versioned endpoint URL
const getVersionedEndpoint = (endpoint) => {
  // Remove leading slash if present
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.substring(1);
  }
  // Add v1 prefix if not already present
  if (!endpoint.startsWith('v1/')) {
    return `/v1/${endpoint}`;
  }
  return `/${endpoint}`;
};

// Create a function to handle API requests
const apiRequest = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  // Check connection before attempting request
  if (!connectionStatus.isConnected) {
    console.log('No internet connection, cannot make request');
    throw new Error('No internet connection. Please check your network settings.');
  }
  
  // Apply API versioning
  const versionedEndpoint = endpoint.startsWith('/v1') ? endpoint : getVersionedEndpoint(endpoint);
  
  console.log('Current API_URL:', API_URL);
  console.log('Making request to endpoint:', versionedEndpoint);
  console.log('Full URL:', `${API_URL}${versionedEndpoint}`);
  
  const token = await AsyncStorage.getItem('userToken');
  console.log('Auth token present:', !!token);
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Added Authorization header with token');
  } else {
    console.log('No auth token available');
  }
  
  const config = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  try {
    console.log(`Making ${method} request to: ${API_URL}${versionedEndpoint}`);
    console.log('Request headers:', headers);
    
    // Add timeout to request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    config.signal = controller.signal;
    
    const response = await fetch(`${API_URL}${versionedEndpoint}`, config);
    
    clearTimeout(timeoutId);
    
    console.log(`Response status: ${response.status}`);
    
    // Check for Authorization header in response
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const newToken = authHeader.substring(7);
      console.log('Got new token from response headers');
      await AsyncStorage.setItem('userToken', newToken);
    }
    
    if (!response.ok) {
      // Handle 401 Unauthorized error
      if (response.status === 401) {
        console.log('Received 401 Unauthorized, clearing auth data');
        // Clear user data and token
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');
        return { error: 'Your session has expired. Please log in again.' };
      }
      
      // Handle 403 Forbidden error
      if (response.status === 403) {
        console.log('Received 403 Forbidden, checking auth status');
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          return { error: 'Please log in to access this feature.' };
        }
        return { error: 'You do not have permission to perform this action.' };
      }
      
      // Handle other error statuses
      const errorMessage = response.statusText || 'An error occurred';
      console.log(`Request failed with status ${response.status}: ${errorMessage}`);
      return { error: `Request failed: ${errorMessage}` };
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
      const data = JSON.parse(text);
      // Check if the response contains an error message
      if (data.error) {
        console.log('Response contains error:', data.error);
        return { error: data.error };
      }
      return data;
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
      return { error: 'The request timed out. Please try again.' };
    }
    
    // Update connection status if we get network errors
    if (error.message.includes('Network request failed')) {
      connectionStatus.serverReachable = false;
      await checkServerReachability();
      return { error: 'Unable to connect to the server. Please check your internet connection.' };
    }
    
    // Return a user-friendly error message
    return { error: error.message || 'An unexpected error occurred. Please try again.' };
  }
};

// API service functions aligned with database structure
export const userService = {
  // Use the new API structure
  getUser: (id) => apiRequest(`api/users/${id}`),
  updateUser: (id, userData) => apiRequest(`api/users/${id}`, 'PUT', userData),
  getAllUsers: () => apiRequest('api/users'),
  getUserPlaylists: (id) => apiRequest(`api/users/${id}/playlists`),
  getUserFavorites: (id) => apiRequest(`api/users/${id}/favorites`),
  addToFavorites: (userId, songId) => apiRequest(`api/users/${userId}/favorites`, 'POST', { songId }),
  addMultipleToFavorites: (userId, songIds) => apiRequest(`api/users/${userId}/favorites/batch`, 'POST', songIds),
  removeFromFavorites: (userId, songId) => apiRequest(`api/users/${userId}/favorites`, 'DELETE', { songId }),
};

// Auth service for new Spring Boot auth endpoints
export const authService = {
  login: (email, password) => apiRequest('/v1/api/auth/login', 'POST', { email, password }),
  register: (userData) => apiRequest('/v1/api/auth/register', 'POST', userData),
  logout: () => apiRequest('/v1/api/auth/logout', 'POST'),
  getCurrentUser: () => apiRequest('/v1/api/auth/me', 'GET'),
  refreshToken: () => apiRequest('/v1/api/auth/refresh', 'POST'),
  
  // Handle login with token storage
  handleLogin: async (email, password) => {
    try {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }

      const response = await apiRequest('/v1/api/auth/login', 'POST', { email, password });
      
      if (response.error) {
        return { error: response.error };
      }
      
      if (response.token && response.user) {
        // Store token and user ID
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id.toString());
        return response;
      } else {
        return { error: 'Invalid response from server' };
      }
    } catch (error) {
      return { error: error.message || 'Login failed' };
    }
  },
  
  // Handle registration with token storage
  handleRegister: async (userData) => {
    try {
      console.log('handleRegister called with data:', {
        email: userData.email,
        username: userData.username,
        password_present: !!userData.password_hash,
        role: userData.role,
        status: userData.status
      });
      
      // Validate required fields
      if (!userData.email || !userData.password_hash || !userData.username) {
        console.log('Registration validation failed - missing required fields');
        return { error: 'Email, password, and username are required' };
      }

      console.log('Making registration API request');
      const response = await apiRequest('/v1/api/auth/register', 'POST', {
        email: userData.email,
        username: userData.username,
        password_hash: userData.password_hash,
        role: userData.role || "USER",
        status: userData.status || "ACTIVE"
      });
      
      console.log('Registration API response:', {
        success: response.success,
        token_present: !!response.token,
        user_present: !!response.user,
        error: response.error
      });
      
      if (response.error) {
        console.log('Registration error from server:', response.error);
        return { error: response.error };
      }
      
      if (response.token && response.user) {
        console.log('Registration successful, storing token and user ID');
        // Store token and user ID from registration response
        await AsyncStorage.setItem('userToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id.toString());
        return response;
      } else {
        console.log('Registration succeeded but response missing token or user');
        return { error: 'Registration failed: Invalid server response' };
      }
    } catch (error) {
      console.log('Registration exception:', error);
      return { error: error.message || 'Registration failed' };
    }
  },
  
  // Handle logout with token removal
  handleLogout: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return { success: true };
      }

      // Call logout endpoint with token
      const response = await apiRequest('/v1/api/auth/logout', 'POST', null, {
        'Authorization': `Bearer ${token}`
      });
      
      // Clear stored credentials regardless of server response
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      
      return { success: true };
    } catch (error) {
      // Still clear credentials even if server request fails
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      
      return { success: true, error: error.message };
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  },
};

export const songService = {
  getAllSongs: async () => {
    const response = await apiRequest('api/songs');
    if (response && response.error) {
      console.error('Error in getAllSongs:', response.error);
      return { error: response.error };
    }
    return response || [];
  },
  getSongById: async (id) => {
    const response = await apiRequest(`api/songs/${id}`);
    if (response && response.error) {
      console.error('Error in getSongById:', response.error);
      return { error: response.error };
    }
    return response;
  },
  addSong: async (songData) => {
    const response = await apiRequest('api/songs', 'POST', songData);
    if (response && response.error) {
      console.error('Error in addSong:', response.error);
      return { error: response.error };
    }
    return response;
  },
  deleteSong: async (id) => {
    const response = await apiRequest(`api/songs/${id}`, 'DELETE');
    if (response && response.error) {
      console.error('Error in deleteSong:', response.error);
      return { error: response.error };
    }
    return response;
  },
  searchSongs: async (params) => {
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.append('title', params.title);
    if (params.artist) queryParams.append('artist', params.artist);
    if (params.genre) queryParams.append('genre', params.genre);
    if (params.album) queryParams.append('album', params.album);
    
    const response = await apiRequest(`api/songs/search?${queryParams.toString()}`);
    if (response && response.error) {
      console.error('Error in searchSongs:', response.error);
      return { error: response.error };
    }
    return response || [];
  },
};

export const playlistService = {
  getAllPlaylists: (userId) => {
    if (userId) {
      return apiRequest(`api/playlists?userId=${userId}`);
    }
    return apiRequest('api/playlists');
  },
  getPlaylist: (id) => apiRequest(`api/playlists/${id}`),
  createPlaylist: (playlistData) => apiRequest('api/playlists', 'POST', playlistData),
  getPlaylistSongs: (id) => apiRequest(`api/playlists/${id}/songs`),
  addSongToPlaylist: (playlistId, songId) => apiRequest(`api/playlists/${playlistId}/songs/${songId}`, 'POST'),
  addSongsToPlaylist: (playlistId, songIds) => apiRequest(`api/playlists/${playlistId}/songs`, 'POST', songIds),
  removeSongFromPlaylist: (playlistId, songId) => apiRequest(`api/playlists/${playlistId}/songs/${songId}`, 'DELETE'),
  removeSongsFromPlaylist: (playlistId, songIds) => apiRequest(`api/playlists/${playlistId}/songs`, 'DELETE', songIds),
  deletePlaylist: (id) => apiRequest(`api/playlists/${id}`, 'DELETE'),
  optimizePlaylist: (id) => apiRequest(`api/playlists/${id}/optimize`),
};

// Stream services for audio and images
export const streamService = {
  getSongStreamUrl: (song) => {
    if (!song) return null;
    // Use song ID if available, otherwise fall back to filename-based URL
    if (song.id) {
      return `${API_URL}/v1/api/songs/${song.id}/stream`;
    }
    // Legacy support for filename-based URLs
    return getLegacyStreamUrl(song.fileName || song.file_name);
  },
  getCoverArtUrl: (song) => {
    if (!song) return DEFAULT_PLACEHOLDER;
    // Use song ID if available, otherwise fall back to filename-based URL
    if (song.id) {
      return `${API_URL}/v1/api/songs/${song.id}/cover`;
    }
    // Legacy support for filename-based URLs
    const filename = song.fileName || song.file_name;
    if (!filename) return DEFAULT_PLACEHOLDER;
    let coverFilename = filename.replace(/\.mp3$/i, '') + '.png';
    return `${API_URL}/v1/api/streaming/cover/${encodeURIComponent(coverFilename)}`;
  },
  getDefaultCoverArt: () => {
    return DEFAULT_PLACEHOLDER;
  },
  // Legacy support for filename-based URLs
  getLegacyStreamUrl: (filename) => {
    if (!filename) return null;
    return `${API_URL}/v1/api/streaming/stream/${encodeURIComponent(filename)}`;
  }
};

// Search services
export const searchService = {
  // Search with fuzzy matching
  search: (query) => apiRequest(`api/search?query=${encodeURIComponent(query)}`),
};

// Recommendation services
export const recommendationService = {
  // Get personalized recommendations for a user
  getUserRecommendations: (userId, limit = 10) => 
    apiRequest(`api/recommendations/user/${userId}?limit=${limit}`),
  
  // Get recommendations based on genre
  getGenreRecommendations: (genre, limit = 10) => 
    apiRequest(`api/recommendations/genre/${encodeURIComponent(genre)}?limit=${limit}`),
    
  // Get recommendations using matrix factorization
  getMatrixRecommendations: (userId, limit = 10) =>
    apiRequest(`api/recommendations/matrix/${userId}?limit=${limit}`)
};

// New health service
export const healthService = {
  getHealth: () => apiRequest('api/health'),
  ping: () => apiRequest('api/health/ping')
};

// Get streaming URL for a song
export const getStreamingUrl = (songId) => {
  return `${API_URL}/v1/api/songs/${songId}/stream`;
};

// Get cover art URL for a song
export const getCoverArtUrl = (songId) => {
  return `${API_URL}/v1/api/songs/${songId}/cover`;
};

// Get streaming URL for a file
export const getFileStreamingUrl = (filename) => {
  return `${API_URL}/v1/api/streaming/stream/${encodeURIComponent(filename)}`;
};

// Get cover art URL for a file
export const getFileCoverArtUrl = (coverFilename) => {
  return `${API_URL}/v1/api/streaming/cover/${encodeURIComponent(coverFilename)}`;
};

export const interactionService = {
  recordInteraction: async (interactionData) => {
    try {
      // Ensure we have the required data
      if (!interactionData.songId) {
        console.error('Missing songId in interaction data');
        return { error: 'Missing songId' };
      }

      // Add timestamp if not provided
      if (!interactionData.timestamp) {
        interactionData.timestamp = new Date().toISOString();
      }

      console.log('Recording interaction:', interactionData);
      const response = await apiRequest('/v1/api/interactions', 'POST', interactionData);
      
      if (response && response.error) {
        if (response.error && response.error.toLowerCase().includes('permission')) {
          console.log('No permission to record interaction (likely unauthenticated user).');
        } else {
          console.error('Error in recordInteraction:', response.error);
        }
        return { error: response.error };
      }
      
      return response;
    } catch (error) {
      console.error('Error recording interaction:', error);
      // Don't throw the error, just log it and return
      return { error: 'Failed to record interaction' };
    }
  },
  getUserInteractions: async (userId) => {
    try {
      if (!userId) {
        console.error('Missing userId in getUserInteractions');
        return { error: 'Missing userId' };
      }

      const response = await apiRequest(`/v1/api/interactions/user/${userId}`);
      if (response && response.error) {
        console.error('Error in getUserInteractions:', response.error);
        return { error: response.error };
      }
      return response || [];
    } catch (error) {
      console.error('Error getting user interactions:', error);
      return { error: 'Failed to get user interactions' };
    }
  }
};

export const playbackHistoryService = {
    recordPlayback: async (songId) => {
        try {
            const response = await apiRequest('/v1/api/playback-history/record', 'POST', { songId });
            if (response && response.error) {
                if (response.error && response.error.toLowerCase().includes('permission')) {
                    console.log('No permission to record playback (likely unauthenticated user).');
                } else {
                    console.error('Error recording playback:', response.error);
                }
                return { error: response.error };
            }
            return response;
        } catch (error) {
            console.error('Error recording playback:', error);
            return { error: error.message };
        }
    },

    getRecentPlaybacks: async () => {
        try {
            const response = await apiRequest('/v1/api/playback-history/recent');
            if (response && response.error) {
                if (response.error && response.error.toLowerCase().includes('permission')) {
                    console.log('No permission to get recent playbacks (likely unauthenticated user).');
                } else {
                    console.error('Error getting recent playbacks:', response.error);
                }
                return { error: response.error };
            }
            return response || [];
        } catch (error) {
            console.error('Error getting recent playbacks:', error);
            return { error: error.message };
        }
    },

    clearHistory: async () => {
        try {
            const response = await apiRequest('/v1/api/playback-history/clear', 'DELETE');
            if (response && response.error) {
                console.error('Error clearing history:', response.error);
                return { error: response.error };
            }
            return response;
        } catch (error) {
            console.error('Error clearing history:', error);
            return { error: error.message };
        }
    }
};
