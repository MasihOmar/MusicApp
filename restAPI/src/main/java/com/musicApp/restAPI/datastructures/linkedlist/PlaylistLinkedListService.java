package com.musicApp.restAPI.datastructures.linkedlist;

import com.musicApp.restAPI.sql.persistance.Playlist.PlaylistEntity;
import com.musicApp.restAPI.sql.persistance.Song.SongEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistLinkedListService {

    private final PlaylistNodeRepository playlistNodeRepository;

    @Autowired
    public PlaylistLinkedListService(PlaylistNodeRepository playlistNodeRepository) {
        this.playlistNodeRepository = playlistNodeRepository;
    }

    @Transactional
    public void addSongToPlaylist(PlaylistEntity playlist, SongEntity song) {
        List<PlaylistNode> nodes = playlistNodeRepository.findByPlaylistIdOrderByPositionAsc(playlist.getId());
        int newPosition = nodes.isEmpty() ? 0 : nodes.size();
        
        PlaylistNode newNode = new PlaylistNode(song, newPosition);
        newNode.setPlaylist(playlist);
        
        if (!nodes.isEmpty()) {
            PlaylistNode lastNode = nodes.get(nodes.size() - 1);
            lastNode.setNextNodeId(newNode.getId());
            newNode.setPrevNodeId(lastNode.getId());
            playlistNodeRepository.save(lastNode);
        }
        
        playlistNodeRepository.save(newNode);
    }

    @Transactional
    public void removeSongFromPlaylist(PlaylistEntity playlist, SongEntity song) {
        List<PlaylistNode> nodes = playlistNodeRepository.findByPlaylistIdOrderByPositionAsc(playlist.getId());
        
        for (int i = 0; i < nodes.size(); i++) {
            PlaylistNode node = nodes.get(i);
            if (node.getSong().getId().equals(song.getId())) {
                // Update previous node's next pointer
                if (node.getPrevNodeId() != null) {
                    PlaylistNode prevNode = playlistNodeRepository.findById(node.getPrevNodeId()).orElse(null);
                    if (prevNode != null) {
                        prevNode.setNextNodeId(node.getNextNodeId());
                        playlistNodeRepository.save(prevNode);
                    }
                }
                
                // Update next node's previous pointer
                if (node.getNextNodeId() != null) {
                    PlaylistNode nextNode = playlistNodeRepository.findById(node.getNextNodeId()).orElse(null);
                    if (nextNode != null) {
                        nextNode.setPrevNodeId(node.getPrevNodeId());
                        playlistNodeRepository.save(nextNode);
                    }
                }
                
                // Delete the node
                playlistNodeRepository.delete(node);
                
                // Update positions of remaining nodes
                for (int j = i + 1; j < nodes.size(); j++) {
                    PlaylistNode remainingNode = nodes.get(j);
                    remainingNode.setPosition(remainingNode.getPosition() - 1);
                    playlistNodeRepository.save(remainingNode);
                }
                break;
            }
        }
    }

    @Transactional
    public void reorderSongs(PlaylistEntity playlist, List<Long> songIds) {
        List<PlaylistNode> nodes = playlistNodeRepository.findByPlaylistIdOrderByPositionAsc(playlist.getId());
        
        // Clear existing links
        for (PlaylistNode node : nodes) {
            node.setNextNodeId(null);
            node.setPrevNodeId(null);
            playlistNodeRepository.save(node);
        }
        
        // Create new links based on the new order
        for (int i = 0; i < songIds.size(); i++) {
            Long songId = songIds.get(i);
            PlaylistNode node = nodes.stream()
                .filter(n -> n.getSong().getId().equals(songId))
                .findFirst()
                .orElse(null);
                
            if (node != null) {
                node.setPosition(i);
                
                if (i > 0) {
                    node.setPrevNodeId(nodes.get(i - 1).getId());
                }
                if (i < songIds.size() - 1) {
                    node.setNextNodeId(nodes.get(i + 1).getId());
                }
                
                playlistNodeRepository.save(node);
            }
        }
    }

    public List<SongEntity> getPlaylistSongs(PlaylistEntity playlist) {
        return playlistNodeRepository.findByPlaylistIdOrderByPositionAsc(playlist.getId())
            .stream()
            .map(PlaylistNode::getSong)
            .toList();
    }
} 