-- Drop tables if they exist
DROP TABLE IF EXISTS playlist_songs;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS user_song_interactions;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    password_hash VARCHAR(255)
);

-- Create songs table
CREATE TABLE songs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    user_id BIGINT REFERENCES users(id)
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
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    song_id BIGINT,
    played BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    skipped BOOLEAN DEFAULT FALSE,
    skip_position_ms INT DEFAULT 0,
    listen_duration_ms INT DEFAULT 0,
    song_duration_ms INT DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
); 