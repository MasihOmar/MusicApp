-- Drop tables if they exist
DROP TABLE IF EXISTS playlist_nodes;
DROP TABLE IF EXISTS playlist_songs;
DROP TABLE IF EXISTS user_song_interactions;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(255),
    password_hash VARCHAR(255),
    email VARCHAR(255)
);

-- Create songs table
CREATE TABLE songs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255),
    artist VARCHAR(255),
    genre VARCHAR(255),
    release_year INT,
    tempo FLOAT,
    energy FLOAT,
    duration INT,
    file_name VARCHAR(255)
);

-- Create playlists table
CREATE TABLE playlists (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255),
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create playlist_nodes table for linked list implementation
CREATE TABLE playlist_nodes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    song_id BIGINT,
    playlist_id BIGINT,
    position INT NOT NULL,
    next_node_id BIGINT,
    prev_node_id BIGINT,
    FOREIGN KEY (song_id) REFERENCES songs(id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (next_node_id) REFERENCES playlist_nodes(id),
    FOREIGN KEY (prev_node_id) REFERENCES playlist_nodes(id)
);

-- Create playlist_songs table
CREATE TABLE playlist_songs (
    playlist_id BIGINT,
    song_id BIGINT,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Create user_song_interactions table
CREATE TABLE user_song_interactions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT,
    song_id BIGINT,
    played BIT DEFAULT 0,
    completed BIT DEFAULT 0,
    skipped BIT DEFAULT 0,
    skip_position_ms INT DEFAULT 0,
    listen_duration_ms INT DEFAULT 0,
    song_duration_ms INT DEFAULT 0,
    timestamp DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Create playback_history table
CREATE TABLE playback_history (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    song_id BIGINT NOT NULL,
    played_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
); 