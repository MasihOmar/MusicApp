// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import Navigation from './src/navigation';
import { configureAudioSession } from './src/services/audioConfig';
import { initApiConfig, streamService } from './src/services/api';
import NetworkStatus from './src/components/NetworkStatus';
import MiniPlayer from './src/components/MiniPlayer';
import { usePlayer } from './src/context/PlayerContext';

function AppContent() {
  const { currentSong, isPlaying, togglePlayPause, playNext, playPrevious } = usePlayer();
  const [currentRouteName, setCurrentRouteName] = useState(null);

  // Setup route change listener to track current screen
  useEffect(() => {
    // Function to be called by navigation when route changes
    global.setCurrentRouteName = (routeName) => {
      setCurrentRouteName(routeName);
    };
    
    return () => {
      global.setCurrentRouteName = undefined;
    };
  }, []);

  // Don't show mini player when on the full player screen
  const shouldShowMiniPlayer = currentSong && currentRouteName !== 'Player';

  return (
    <>
      <Navigation />
      <NetworkStatus />
      {shouldShowMiniPlayer && (
        <MiniPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onNext={playNext}
          onPrevious={playPrevious}
          onPress={() => {
            // Pass the current song's ID when navigating to the Player screen
            if (global.navigate) {
              global.navigate('Player', { songId: currentSong.id });
            } else {
              console.warn('Navigation not available yet');
            }
          }}
          coverArtUrl={streamService.getCoverArtUrl(currentSong.fileName)}
        />
      )}
    </>
  );
}

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize audio configuration
        await configureAudioSession();
        
        // Initialize API configuration
        await initApiConfig();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}