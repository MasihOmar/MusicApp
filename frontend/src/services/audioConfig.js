import { Audio } from 'expo-av';

export const configureAudioSession = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
    });
    console.log('Audio session configured successfully');
  } catch (error) {
    console.error('Error configuring audio session:', error);
  }
}; 