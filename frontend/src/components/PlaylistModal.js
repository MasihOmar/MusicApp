import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { playlistService } from '../services/api';

const PlaylistModal = ({ visible, onClose, songId, onSuccess }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  // Fetch all user playlists when modal opens
  useEffect(() => {
    if (visible) {
      fetchPlaylists();
    }
  }, [visible]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const playlistsData = await playlistService.getAllPlaylists();
      setPlaylists(playlistsData || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError('Failed to load playlists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!songId) return;
    
    setAddingToPlaylist(true);
    try {
      // Add song to playlist and get updated playlist data
      const updatedPlaylist = await playlistService.addSongToPlaylist(playlistId, songId);
      console.log('Updated playlist after adding song:', updatedPlaylist);
      
      // Call onSuccess with the updated playlist data
      onSuccess?.(updatedPlaylist);
      Alert.alert('Success', 'Song added to playlist successfully');
      onClose();
    } catch (err) {
      console.error('Error adding song to playlist:', err);
      Alert.alert('Error', 'Failed to add song to playlist. Please try again.');
    } finally {
      setAddingToPlaylist(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }
    
    setAddingToPlaylist(true);
    try {
      // Create new playlist
      const newPlaylist = await playlistService.createPlaylist({
        name: newPlaylistName.trim(),
        songs: songId ? [songId] : []
      });
      
      if (newPlaylist) {
        onSuccess?.();
        onClose();
        Alert.alert('Success', 'Playlist created successfully');
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      Alert.alert('Error', 'Failed to create playlist. Please try again.');
    } finally {
      setAddingToPlaylist(false);
      setIsCreatingNew(false);
      setNewPlaylistName('');
    }
  };

  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.playlistItem}
      onPress={() => handleAddToPlaylist(item.id)}
      disabled={addingToPlaylist}
    >
      <LinearGradient
        colors={Colors.gradient.cardPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.playlistGradient}
      >
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle}>{item.title || item.name}</Text>
          <Text style={styles.playlistTracks}>
            {`${item.trackCount || item.songCount || 0} songs`}
          </Text>
        </View>
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCreateNewPlaylist = () => (
    <View style={styles.createNewContainer}>
      <TextInput
        style={styles.input}
        placeholder="Enter playlist name"
        placeholderTextColor={Colors.textSecondary}
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
        autoFocus
      />
      <View style={styles.createButtonsContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsCreatingNew(false);
            setNewPlaylistName('');
          }}
          disabled={addingToPlaylist}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlaylist}
          disabled={addingToPlaylist}
        >
          <LinearGradient
            colors={Colors.gradient.buttonPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            {addingToPlaylist ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[Colors.backgroundDark, Colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isCreatingNew ? 'Create New Playlist' : 'Add to Playlist'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isCreatingNew ? (
            renderCreateNewPlaylist()
          ) : (
            <>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading playlists...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchPlaylists}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={playlists}
                  renderItem={renderPlaylistItem}
                  keyExtractor={item => `playlist-${item.id}`}
                  contentContainerStyle={styles.listContainer}
                  ListHeaderComponent={
                    <TouchableOpacity 
                      style={styles.createNewButton}
                      onPress={() => setIsCreatingNew(true)}
                    >
                      <LinearGradient
                        colors={Colors.gradient.buttonPrimary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.createNewGradient}
                      >
                        <Ionicons name="add" size={24} color="#fff" />
                        <Text style={styles.createNewText}>Create New Playlist</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No playlists found. Create one!</Text>
                    </View>
                  }
                />
              )}
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: Colors.backgroundDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  playlistItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  playlistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  playlistTracks: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  createNewButton: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createNewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.error || '#ff6b6b',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  createNewContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  createButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 8,
  },
  createButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default PlaylistModal; 