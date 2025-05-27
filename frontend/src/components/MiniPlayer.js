import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Colors from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { streamService } from '../services/api';

const { width } = Dimensions.get('window');

const PlayIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 4L19 12L5 20V4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PauseIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M6 4H10V20H6V4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 4H18V20H14V4Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const NextIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 5L15 12L5 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PreviousIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M19 5L9 12L19 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MiniPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause, 
  onNext,
  onPrevious,
  onPress
}) => {
  const insets = useSafeAreaInsets();
  
  if (!currentSong) return null;

  // Use tab bar height (49) and add safe area if available
  // Add extra padding (20) to position it higher above the tab bar
  const TAB_BAR_HEIGHT = 49;
  const EXTRA_PADDING = 20;
  const bottomPosition = TAB_BAR_HEIGHT + (insets.bottom > 0 ? insets.bottom : 0) + EXTRA_PADDING;

  // Generate cover art URL just like SongCard
  const coverArtUrl = streamService.getCoverArtUrl(currentSong);

  return (
    <TouchableOpacity 
      style={[styles.container, { bottom: bottomPosition }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[`${Colors.background}E6`, `${Colors.background}E6`]} // 90% opacity
        style={styles.gradient}
      >
        <Image
          source={{ uri: coverArtUrl || 'https://via.placeholder.com/300' }}
          style={styles.artwork}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity onPress={onPrevious}>
            <PreviousIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext}>
            <NextIcon />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: 'transparent',
    zIndex: 999, // Ensure it appears above other elements
    borderRadius: 30, // Rounded corners
    overflow: 'hidden', // Ensure content doesn't overflow rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make artwork circular
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export default MiniPlayer; 