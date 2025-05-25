-- Drop tables if they exist
IF OBJECT_ID('playlist_songs', 'U') IS NOT NULL
    DROP TABLE playlist_songs;
IF OBJECT_ID('playlists', 'U') IS NOT NULL
    DROP TABLE playlists;
IF OBJECT_ID('songs', 'U') IS NOT NULL
    DROP TABLE songs;
IF OBJECT_ID('users', 'U') IS NOT NULL
    DROP TABLE users;

-- Create users table
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(255),
    password_hash NVARCHAR(255)
);

-- Create songs table
CREATE TABLE songs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255),
    artist NVARCHAR(255),
    genre NVARCHAR(255),
    release_year INT,
    tempo FLOAT,
    energy FLOAT,
    duration INT,
    file_name VARCHAR(255)
);

-- Create playlists table
CREATE TABLE playlists (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255),
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