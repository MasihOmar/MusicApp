import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { streamService } from '../services/api';

const { width } = Dimensions.get('window');

const PlaylistCoverArt = ({ songs, size = 180, circular = true }) => {
  const [coverArtUrls, setCoverArtUrls] = useState([]);

  useEffect(() => {
    if (songs && songs.length > 0) {
      // Get up to 4 songs for the cover art
      const songsToUse = songs.slice(0, 4);
      const urls = songsToUse.map(song => {
        return streamService.getCoverArtUrl(song);
      });
      setCoverArtUrls(urls);
    }
  }, [songs]);

  const borderRadius = circular ? size / 2 : 8;

  if (!songs || songs.length === 0) {
    return (
      <Image
        source={{ uri: streamService.getDefaultCoverArt() }}
        style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}
      />
    );
  }

  const renderGrid = () => {
    switch (coverArtUrls.length) {
      case 1:
        return (
          <Image
            source={{ uri: coverArtUrls[0] }}
            style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}
          />
        );
      case 2:
        return (
          <View style={{ width: size, height: size, borderRadius, overflow: 'hidden', flexDirection: 'column' }}>
            <Image
              source={{ uri: coverArtUrls[0] }}
              style={{ width: size, height: size / 2, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
            />
            <Image
              source={{ uri: coverArtUrls[1] }}
              style={{ width: size, height: size / 2, borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }}
            />
          </View>
        );
      case 3:
        return (
          <View style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}>
            <Image
              source={{ uri: coverArtUrls[0] }}
              style={{ width: size, height: size / 2, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
            />
            <View style={{ flexDirection: 'row', width: size, height: size / 2 }}>
              <Image
                source={{ uri: coverArtUrls[1] }}
                style={{ width: size / 2, height: size / 2, borderBottomLeftRadius: borderRadius }}
              />
              <Image
                source={{ uri: coverArtUrls[2] }}
                style={{ width: size / 2, height: size / 2, borderBottomRightRadius: borderRadius }}
              />
            </View>
          </View>
        );
      case 4:
        return (
          <View style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', width: size, height: size / 2 }}>
              <Image
                source={{ uri: coverArtUrls[0] }}
                style={{ width: size / 2, height: size / 2, borderTopLeftRadius: borderRadius }}
              />
              <Image
                source={{ uri: coverArtUrls[1] }}
                style={{ width: size / 2, height: size / 2, borderTopRightRadius: borderRadius }}
              />
            </View>
            <View style={{ flexDirection: 'row', width: size, height: size / 2 }}>
              <Image
                source={{ uri: coverArtUrls[2] }}
                style={{ width: size / 2, height: size / 2, borderBottomLeftRadius: borderRadius }}
              />
              <Image
                source={{ uri: coverArtUrls[3] }}
                style={{ width: size / 2, height: size / 2, borderBottomRightRadius: borderRadius }}
              />
            </View>
          </View>
        );
      default:
        return (
          <Image
            source={{ uri: streamService.getDefaultCoverArt() }}
            style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}
          />
        );
    }
  };

  return renderGrid();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  halfImage: {
    resizeMode: 'cover',
  },
  quarterImage: {
    resizeMode: 'cover',
  },
  topRow: {
    flexDirection: 'row',
  },
  bottomRow: {
    flexDirection: 'row',
  },
});

export default PlaylistCoverArt; 