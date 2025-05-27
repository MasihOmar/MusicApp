import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { streamService, interactionService, playbackHistoryService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [originalSongs, setOriginalSongs] = useState([]);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [songDuration, setSongDuration] = useState(0);
  const soundRef = useRef(null);

  const playSong = async (song, songList, index) => {
    try {
      // Record completion of previous song if applicable
      if (currentSong && playStartTime) {
        recordSongCompletion();
      }
      
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      setSongs(songList);
      setOriginalSongs(songList);
      setCurrentIndex(index);
      setCurrentSong(song);

      const streamUrl = streamService.getSongStreamUrl(song);
      if (!streamUrl) {
        console.error('No stream URL available for song:', song);
        return;
      }

      console.log('Loading song from URL:', streamUrl);
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setPlayStartTime(Date.now());

      // Get initial duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        console.log('Song loaded successfully. Duration:', status.durationMillis);
        setSongDuration(status.durationMillis || 0);
        
        // Record that user started playing this song
        recordSongPlay(song.id, status.durationMillis);
        
        // Record in playback history
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          await playbackHistoryService.recordPlayback(song.id);
        }
      } else {
        console.log('Song not loaded yet');
        setSongDuration(0);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setIsPlaying(false);
    }
  };

  // Record that user played a song
  const recordSongPlay = async (songId, durationMs) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found, skipping interaction recording');
        return;
      }

      const result = await interactionService.recordInteraction({
        songId,
        played: true,
        skipped: false,
        completed: false,
        songDurationMs: durationMs
      });
      
      if (result.error) {
        console.warn('Failed to record song play:', result.error);
      }
    } catch (error) {
      console.warn('Error recording song play:', error);
    }
  };

  // Record that user completed a song
  const recordSongCompletion = async () => {
    if (!currentSong) return;
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found, skipping interaction recording');
        return;
      }

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      
      const positionMs = status.positionMillis || 0;
      const durationMs = songDuration;
      
      // Consider it completed if user listened to at least 90%
      const completed = positionMs >= durationMs * 0.9;
      
      const result = await interactionService.recordInteraction({
        songId: currentSong.id,
        played: false,
        completed: completed,
        skipped: false,
        listenDurationMs: positionMs,
        songDurationMs: durationMs
      });
      
      if (result.error) {
        console.warn('Failed to record song completion:', result.error);
      }
    } catch (error) {
      console.warn('Error recording song completion:', error);
    }
  };

  // Record that user skipped a song
  const recordSongSkip = async () => {
    if (!currentSong) return;
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found, skipping interaction recording');
        return;
      }

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      
      const positionMs = status.positionMillis || 0;
      
      const result = await interactionService.recordInteraction({
        songId: currentSong.id,
        played: false,
        completed: false,
        skipped: true,
        skipPositionMs: positionMs,
        listenDurationMs: positionMs,
        songDurationMs: songDuration
      });
      
      if (result.error) {
        console.warn('Failed to record song skip:', result.error);
      }
    } catch (error) {
      console.warn('Error recording song skip:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const playNext = async () => {
    if (!songs || songs.length === 0) return;
    
    // Record skip for the current song
    if (currentSong) {
      await recordSongSkip();
    }
    
    if (isLooping) {
      if (soundRef.current) {
        soundRef.current.setPositionAsync(0);
        soundRef.current.playAsync();
      }
    } else if (currentIndex < songs.length - 1) {
      playSong(songs[currentIndex + 1], songs, currentIndex + 1);
    } else {
      playSong(songs[0], songs, 0);
    }
  };

  const playPrevious = () => {
    if (!songs || songs.length === 0) return;
    
    if (isLooping) {
      if (soundRef.current) {
        soundRef.current.setPositionAsync(0);
        soundRef.current.playAsync();
      }
    } else if (currentIndex > 0) {
      playSong(songs[currentIndex - 1], songs, currentIndex - 1);
    } else {
      playSong(songs[songs.length - 1], songs, songs.length - 1);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      setSongs(shuffledSongs);
    } else {
      setSongs(originalSongs);
    }
    setIsShuffled(!isShuffled);
  };

  // Skip to the next song explicitly (for skip button)
  const skipSong = async () => {
    await playNext();
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish) {
      // Song finished naturally, record it as completed
      if (currentSong) {
        try {
          await interactionService.recordInteraction({
            songId: currentSong.id,
            played: false,
            completed: true,
            skipped: false,
            listenDurationMs: songDuration,
            songDurationMs: songDuration
          });
        } catch (error) {
          console.error('Error recording song completion at end:', error);
        }
      }
      
      if (isLooping) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } else {
        playNext();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        isLooping,
        isShuffled,
        songs,
        currentIndex,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        toggleLoop,
        toggleShuffle,
        soundRef,
        skipSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}; 