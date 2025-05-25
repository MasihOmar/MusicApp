// src/screens/player/PlayerScreen.js
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useCallback, useState, useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Colors from '../../constants/colors';
import { songService, streamService } from '../../services/api';

const { width } = Dimensions.get('window');

// Memoized Icon Components
const ChevronDownIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const MoreIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="6" r="1.5" fill="white" />
    <Circle cx="12" cy="12" r="1.5" fill="white" />
    <Circle cx="12" cy="18" r="1.5" fill="white" />
  </Svg>
));

const HeartIcon = memo(({ filled }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={filled ? "#00C6FF" : "none"}
      stroke="white"
      strokeWidth="2"
    />
  </Svg>
));

const ShuffleIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 9H7C8.86384 9 10.4299 10.2822 10.874 12"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 4L16 8M20 20L16 16M4 15H7C8.86384 15 10.4299 13.7178 10.874 12"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 4H20V9M15 20H20V15"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const PreviousIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 5L9 12L19 19V5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 5V19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const NextIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 5L15 12L5 19V5Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 5V19"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const PauseIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
    <Rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
  </Svg>
));

const PlayIcon = memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 4L19 12L5 20V4Z"
      fill="white"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
));

const RepeatIcon = memo(({ mode }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 2L21 6L17 10"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 11V10C3 7.79086 4.79086 6 7 6H21"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 22L3 18L7 14"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 13V14C21 16.2091 19.2091 18 17 18H3"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {mode === 2 && (
      <Circle cx="12" cy="12" r="3" fill="white" opacity="0.5" />
    )}
  </Svg>
));

// Memoized Control Button Component
const ControlButton = memo(({ isActive, onPress, icon, size = 40 }) => (
  <TouchableOpacity
    style={styles.controlButton}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={isActive ? Colors.gradient.primary : ['transparent', 'transparent']}
      style={[
        styles.controlGradient,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {icon}
    </LinearGradient>
  </TouchableOpacity>
));

/**
 * PlayerScreen Component - Müzik çalma ekranı
 */
const PlayerScreen = ({ navigation, route }) => {
  // State hooks
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: no repeat, 1: repeat one, 2: repeat all
  const [sliderValue, setSliderValue] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Audio player refs
  const sound = useRef(null);
  const positionUpdateInterval = useRef(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, []);

  // Load and play song when currentSong changes
  useEffect(() => {
    const loadAndPlaySong = async () => {
      if (!currentSong) {
        console.log('No current song available');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // console.log('Current song data:', JSON.stringify(currentSong, null, 2));
        // console.log('Available fields:', Object.keys(currentSong));
        // console.log('fileName field:', currentSong.fileName);
        // console.log('file_name field:', currentSong.file_name);
        const streamUrl = streamService.getSongStreamUrl(currentSong.fileName);
        // console.log('Stream URL:', streamUrl);
        // console.log('Creating new sound object with URL:', streamUrl);

        // Unload previous sound if exists
        if (sound.current) {
          console.log('Unloading previous sound');
          await sound.current.unloadAsync();
        }

        // Create new sound object
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        sound.current = newSound;
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading song:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          currentSong: currentSong
        });
        setError('Failed to load song. Please try again.');
        setIsLoading(false);
      }
    };

    loadAndPlaySong();
  }, [currentSong]);

  // Playback status update handler
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000);
      setPosition(status.positionMillis / 1000);
      setSliderValue(status.positionMillis / status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  // Fetch song data when route params change
  useEffect(() => {
    const fetchSongData = async () => {
      if (route.params?.songId) {
        try {
          const songData = await songService.getSongById(route.params.songId);
          // console.log('Raw song data from API:', JSON.stringify(songData, null, 2));
          // console.log('Available fields:', Object.keys(songData));
          setCurrentSong(songData);
        } catch (error) {
          console.error('Error fetching song:', error);
          setError('Failed to load song data. Please try again.');
        }
      }
    };
    fetchSongData();
  }, [route.params?.songId]);

  // Playback control handlers
  const togglePlay = useCallback(async () => {
    try {
      if (!sound.current) return;

      if (isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.playAsync();
      }
    } catch (err) {
      console.error('Error toggling play:', err);
      setError('Failed to control playback. Please try again.');
    }
  }, [isPlaying]);

  const handleSliderChange = useCallback(async (value) => {
    try {
      if (!sound.current) return;
      const newPosition = value * duration;
      await sound.current.setPositionAsync(newPosition * 1000);
    } catch (err) {
      console.error('Error seeking:', err);
    }
  }, [duration]);

  // Callback handlers
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => (prev + 1) % 3);
  }, []);

  const toggleLike = useCallback(() => {
    setIsLiked(prev => !prev);
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  if (error) {
    return (
      <LinearGradient
        colors={[Colors.gradient.pop[0], Colors.backgroundDark]}
        style={[styles.container, styles.centerContent]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradient.pop[0], Colors.backgroundDark]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBackPress}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>NOW PLAYING</Text>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Album Cover */}
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: currentSong ? streamService.getCoverArtUrl(currentSong.fileName) : streamService.getDefaultCoverArt() }}
              style={styles.coverArt}
              defaultSource={{ uri: streamService.getDefaultCoverArt() }}
            />
          </View>

          {/* Song Info */}
          <View style={styles.songInfoContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {currentSong?.title || 'Loading...'}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {currentSong?.artist || 'Unknown Artist'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${sliderValue * 100}%` }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={toggleShuffle}>
              <Text style={[styles.controlButton, isShuffle && styles.activeControl]}>
                🔀
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playButton} onPress={togglePlay} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleRepeat}>
              <Text style={[styles.controlButton, repeatMode > 0 && styles.activeControl]}>
                {repeatMode === 1 ? '🔂' : '🔁'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Like Button */}
          <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
            <Text style={[styles.likeButtonText, isLiked && styles.likedButtonText]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// Stillerda tutarlı değerler kullanalım (DRY prensibine uygun)
const STANDARD_SPACING = 10;
const BORDER_RADIUS = 10;
const ICON_BUTTON_SIZE = 40;
const PLAY_BUTTON_SIZE = 60;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Main layout and album cover adjustments
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: STANDARD_SPACING,
    marginBottom: 10,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  iconButton: {
    padding: STANDARD_SPACING,
  },
  // Album Cover and Content Containers
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // İçeriği dikey olarak ortalar
  },
  coverContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  coverArt: {
    width: width * 0.7, // Ekran genişliğinin %70'i
    height: width * 0.7, // Kare görünümü korumak için
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  songInfoContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  songTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: STANDARD_SPACING,
  },
  artistName: {
    color: Colors.textSecondary,
    fontSize: 18,
  },
  progressContainer: {
    marginVertical: 15,
  },
  progressBar: {
    height: 40,
    backgroundColor: Colors.textSecondary,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10, // Alttaki boşluğu azalttık
    paddingHorizontal: 10, // Kontrolleri daha geniş dağıtmak için
  },
  controlButton: {
    padding: 5,
  },
  activeControl: {
    color: Colors.primary,
  },
  playButtonContainer: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  playButton: {
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    borderRadius: PLAY_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  backButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  likeButton: {
    padding: 10,
  },
  likeButtonText: {
    fontSize: 24,
  },
  likedButtonText: {
    color: Colors.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
});

export default memo(PlayerScreen);