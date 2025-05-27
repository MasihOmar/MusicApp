-- Create playlist_nodes table for linked list implementation
CREATE TABLE playlist_nodes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    song_id BIGINT REFERENCES songs(id),
    playlist_id BIGINT REFERENCES playlists(id),
    position INT NOT NULL,
    next_node_id BIGINT REFERENCES playlist_nodes(id),
    prev_node_id BIGINT REFERENCES playlist_nodes(id)
);