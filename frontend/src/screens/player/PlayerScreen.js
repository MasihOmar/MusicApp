// src/screens/player/PlayerScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Colors from '../../constants/colors';
import { songService, streamService } from '../../services/api';
import { usePlayer } from '../../context/PlayerContext';

const { width } = Dimensions.get('window');

// SVG icons
const PreviousIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 5L9 12L19 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const NextIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 5L15 12L5 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const PauseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
    <Rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
  </Svg>
);
const PlayIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 4L19 12L5 20V4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LoopIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M17 2L21 6L17 10" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M3 12V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M7 22L3 18L7 14" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M21 12V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
);

const ShuffleIcon = ({ active }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M16 3H21V8" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M4 20L21 3" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M21 16V21H16" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M15 15L21 21" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <Path 
      d="M4 4L9 9" 
      stroke={active ? Colors.primary : "white"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </Svg>
);

// Skip icon for explicitly skipping a song
const SkipIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 5L15 12L5 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 22L21 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayerScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const statusUpdateInterval = useRef(null);

  const {
    currentSong,
    isPlaying,
    isLooping,
    isShuffled,
    songs,
    currentIndex,
    playSong,
    togglePlayPause,
    playNext,
    toggleLoop,
    toggleShuffle,
    soundRef,
    skipSong,
  } = usePlayer();

  // Set up status update interval
  useEffect(() => {
    const updateStatus = async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
        }
      }
    };

    // Update status every 100ms
    statusUpdateInterval.current = setInterval(updateStatus, 100);

    return () => {
      if (statusUpdateInterval.current) {
        clearInterval(statusUpdateInterval.current);
      }
    };
  }, [soundRef]);

  // Fetch songs from API and play the selected song
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsData = await songService.getAllSongs();
        if (songsData.length > 0) {
          // If a specific songId is provided in the route params, find and play that song
          if (route.params?.songId) {
            const songIndex = songsData.findIndex(song => song.id === route.params.songId);
            if (songIndex !== -1) {
              playSong(songsData[songIndex], songsData, songIndex);
            } else {
              // If song not found, play the first song
              playSong(songsData[0], songsData, 0);
            }
          } else {
            // If no specific song is requested, play the first song
            playSong(songsData[0], songsData, 0);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs');
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, [route.params?.songId]);

  // Handle seek
  const handleSeekStart = () => setIsSeeking(true);
  const handleSeekComplete = async value => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(value);
      setPosition(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
    setIsSeeking(false);
  };
  const handleSeekChange = value => {
    setSeekValue(value);
    setPosition(value);
  };

  // Format time
  const formatTime = ms => {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      playSong(songs[currentIndex - 1], songs, currentIndex - 1);
    } else {
      playSong(songs[songs.length - 1], songs, songs.length - 1);
    }
  };

  // Add a handler for the skip button
  const handleSkip = () => {
    skipSong();
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>{error}</Text>
      </LinearGradient>
    );
  }

  if (!currentSong) {
    return (
      <LinearGradient
        colors={Colors.gradient.dark}
        style={styles.loadingContainer}
      >
        <Text style={styles.errorText}>No song selected</Text>
      </LinearGradient>
    );
  }

  const coverArtUrl = streamService.getCoverArtUrl(currentSong.fileName);

  return (
    <LinearGradient
      colors={Colors.gradient.dark}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <BackIcon />
      </TouchableOpacity>

      <View style={styles.artworkContainer}>
        <Image
          source={{ uri: coverArtUrl }}
          style={styles.artwork}
          resizeMode="cover"
        />
      </View>
      
      <Text style={styles.title}>{currentSong.title}</Text>
      <Text style={styles.artist}>{currentSong.artist}</Text>
      
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={isSeeking ? seekValue : position}
        minimumTrackTintColor={Colors.primary}
        maximumTrackTintColor={Colors.textSecondary}
        thumbTintColor={Colors.primary}
        onSlidingStart={handleSeekStart}
        onValueChange={handleSeekChange}
        onSlidingComplete={handleSeekComplete}
      />
      
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTime(isSeeking ? seekValue : position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleShuffle}>
          <ShuffleIcon active={isShuffled} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrevious}>
          <PreviousIcon />
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayPause}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </TouchableOpacity>
        <TouchableOpacity onPress={playNext}>
          <NextIcon />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLoop}>
          <LoopIcon active={isLooping} />
        </TouchableOpacity>
      </View>
      
      {/* Add skip button below the main controls */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <SkipIcon />
        <Text style={styles.skipText}>Skip this song</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  artworkContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  slider: {
    width: width - 40,
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginBottom: 24,
  },
  time: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 280,
    marginTop: 16,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipText: {
    color: Colors.textPrimary,
    marginLeft: 10,
    fontSize: 16,
  },
});

export default PlayerScreen;