import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import PlaylistCoverArt from '../../components/PlaylistCoverArt';
import SongCard from '../../components/SongCard';

export default function PlaylistScreen({ navigation, route }) {
  const { playlistSongs = [], playlistName = '', userInfo = {} } = route.params || {};

  const renderSongItem = ({ item }) => (
    <SongCard
      song={item}
      onPress={() => navigation.navigate('Player', { songId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient.pop[0], Colors.backgroundDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.playlistInfo}>
          <PlaylistCoverArt
            songs={playlistSongs}
            size={140}
            style={styles.coverArt}
          />
          <Text style={styles.playlistName}>{playlistName}</Text>
          <Text style={styles.songCount}>{playlistSongs.length} songs</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={[Colors.backgroundDark, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.6 }}
        style={styles.contentGradient}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.displayName}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
          </View>
          
          {/* Song List Section */}
          <View style={styles.songListSection}>
            <Text style={styles.sectionTitle}>Songs</Text>
            <FlatList
              data={playlistSongs}
              renderItem={renderSongItem}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.songList}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 50,
  },
  contentGradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
    marginTop: 16,
  },
  songCount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  coverArt: {
    alignSelf: 'center',
    marginLeft: 0,
    marginRight: 0,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  songListSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 24,
    marginBottom: 15,
  },
  songList: {
    paddingLeft: 24,
    paddingRight: 20,
  },
}); 