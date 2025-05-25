import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import PlaylistModal from './PlaylistModal';

const SongOptionsModal = ({ visible, onClose, song, navigation }) => {
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);

  const handleAddToPlaylist = () => {
    onClose();
    setPlaylistModalVisible(true);
  };

  const handlePlayNext = () => {
    // TODO: Implement play next functionality
    onClose();
  };

  const handleGoToArtist = () => {
    onClose();
    if (song?.artist) {
      navigation.navigate('Search', { searchQuery: song.artist });
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    onClose();
  };

  return (
    <>
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
              <View style={styles.headerInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {song?.title || 'Song title'}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                  {song?.artist || 'Artist'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.option} onPress={handleAddToPlaylist}>
                <Ionicons name="list" size={24} color={Colors.textPrimary} />
                <Text style={styles.optionText}>Add to Playlist</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handlePlayNext}>
                <Ionicons name="play-skip-forward" size={24} color={Colors.textPrimary} />
                <Text style={styles.optionText}>Play Next</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleGoToArtist}>
                <Ionicons name="person" size={24} color={Colors.textPrimary} />
                <Text style={styles.optionText}>Go to Artist</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.option} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={Colors.textPrimary} />
                <Text style={styles.optionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      <PlaylistModal
        visible={playlistModalVisible}
        onClose={() => setPlaylistModalVisible(false)}
        songId={song?.id}
        onSuccess={() => {}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: '40%',
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
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  songArtist: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 16,
  },
});

export default SongOptionsModal; 