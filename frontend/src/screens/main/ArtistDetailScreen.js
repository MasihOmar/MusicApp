// src/screens/main/ArtistDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';

export default function ArtistDetailScreen({ navigation, route }) {
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Örnek sanatçı verisi (gerçekte route.params'dan gelecek)
  const artist = {
    id: '1',
    name: 'Popüler Sanatçı',
    image: 'https://via.placeholder.com/400',
    genres: ['Pop', 'R&B', 'Dance'],
    monthlyListeners: '12.5M',
    followers: '8.2M',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.',
    popularSongs: [
      { id: '1', title: 'Hit Şarkı 1', plays: '12.5M', duration: '3:45', albumCover: 'https://via.placeholder.com/60' },
      { id: '2', title: 'Hit Şarkı 2', plays: '10.2M', duration: '3:20', albumCover: 'https://via.placeholder.com/60' },
      { id: '3', title: 'Hit Şarkı 3', plays: '8.7M', duration: '4:10', albumCover: 'https://via.placeholder.com/60' },
      { id: '4', title: 'Hit Şarkı 4', plays: '7.4M', duration: '3:35', albumCover: 'https://via.placeholder.com/60' },
      { id: '5', title: 'Hit Şarkı 5', plays: '6.2M', duration: '2:55', albumCover: 'https://via.placeholder.com/60' },
    ],
    albums: [
      { id: '1', title: 'Son Albüm', year: '2025', cover: 'https://via.placeholder.com/150' },
      { id: '2', title: 'İkinci Albüm', year: '2023', cover: 'https://via.placeholder.com/150' },
      { id: '3', title: 'Debut Albüm', year: '2020', cover: 'https://via.placeholder.com/150' },
    ],
    similarArtists: [
      { id: '1', name: 'Benzer Sanatçı 1', image: 'https://via.placeholder.com/100' },
      { id: '2', name: 'Benzer Sanatçı 2', image: 'https://via.placeholder.com/100' },
      { id: '3', name: 'Benzer Sanatçı 3', image: 'https://via.placeholder.com/100' },
      { id: '4', name: 'Benzer Sanatçı 4', image: 'https://via.placeholder.com/100' },
    ]
  };
  
  const toggleFollow = () => setIsFollowing(!isFollowing);
  
  const handlePlayAll = () => {
    navigation.navigate('Player');
  };
  
  const handleSongPress = (song) => {
    navigation.navigate('Player');
  };
  
  const handleAlbumPress = (album) => {
    navigation.navigate('PlaylistDetail', { id: album.id, type: 'album' });
  };
  
  const handleArtistPress = (similarArtist) => {
    navigation.navigate('ArtistDetail', { id: similarArtist.id });
  };
  
  const renderPopularSong = ({ item, index }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
    >
      <Text style={styles.songNumber}>{index + 1}</Text>
      <Image source={{ uri: item.albumCover }} style={styles.songAlbumCover} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songPlays}>{item.plays} dinlenme</Text>
      </View>
      <Text style={styles.songDuration}>{item.duration}</Text>
    </TouchableOpacity>
  );
  
  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumPress(item)}
    >
      <Image source={{ uri: item.cover }} style={styles.albumCover} />
      <Text style={styles.albumTitle}>{item.title}</Text>
      <Text style={styles.albumYear}>{item.year}</Text>
    </TouchableOpacity>
  );
  
  const renderSimilarArtist = ({ item }) => (
    <TouchableOpacity
      style={styles.similarArtistItem}
      onPress={() => handleArtistPress(item)}
    >
      <Image source={{ uri: item.image }} style={styles.similarArtistImage} />
      <Text style={styles.similarArtistName}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['rgba(29, 185, 84, 0.8)', Colors.backgroundDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.artistImageContainer}>
            <Image source={{ uri: artist.image }} style={styles.artistImage} />
          </View>
          
          <View style={styles.artistInfoContainer}>
            <Text style={styles.artistName}>{artist.name}</Text>
            
            <View style={styles.genresContainer}>
              {artist.genres.map((genre, index) => (
                <View key={index} style={styles.genreBadge}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>{`${artist.monthlyListeners} aylık dinleyici • ${artist.followers} takipçi`}</Text>
            </View>
            
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={toggleFollow}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                <LinearGradient
                  colors={Colors.gradient.primary}
                  style={styles.playButtonGradient}
                >
                  <Text style={styles.playButtonText}>▶ Çal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.aboutText}>{artist.description}</Text>
        </View>
        
        <View style={styles.popularSongsSection}>
          <Text style={styles.sectionTitle}>Popüler</Text>
          
          <FlatList
            data={artist.popularSongs}
            renderItem={renderPopularSong}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
          
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllButtonText}>Tümünü Gör</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.albumsSection}>
          <Text style={styles.sectionTitle}>Albümler</Text>
          
          <FlatList
            data={artist.albums}
            renderItem={renderAlbum}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsList}
          />
        </View>
        
        <View style={styles.similarArtistsSection}>
          <Text style={styles.sectionTitle}>Benzer Sanatçılar</Text>
          
          <FlatList
            data={artist.similarArtists}
            renderItem={renderSimilarArtist}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.similarArtistsList}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 10,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: 24,
  },
  artistImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  artistImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: Colors.background,
  },
  artistInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  genreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  genreText: {
    color: Colors.textPrimary,
    fontSize: 12,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: 10,
  },
  followingButton: {
    backgroundColor: 'rgba(0, 198, 255, 0.2)',
  },
  followButtonText: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  playButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  playButtonText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  aboutSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  aboutText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  popularSongsSection: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  songNumber: {
    width: 25,
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  songAlbumCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  songPlays: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  songDuration: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: 10,
  },
  seeAllButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: 10,
  },
  seeAllButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  albumsSection: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  albumsList: {
    paddingHorizontal: 16,
  },
  albumItem: {
    marginRight: 16,
    width: 150,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  albumTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  albumYear: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  similarArtistsSection: {
    paddingTop: 10,
    paddingBottom: 50,
  },
  similarArtistsList: {
    paddingHorizontal: 16,
  },
  similarArtistItem: {
    marginRight: 16,
    width: 100,
    alignItems: 'center',
  },
  similarArtistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  similarArtistName: {
    color: Colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
});