USE MusicApp;

-- Add sample users
INSERT INTO Users (username, password_hash) VALUES
('john_doe', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG'),  -- password: password123
('jane_smith', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG'), -- password: password123
('music_lover', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG'); -- password: password123

-- Add sample songs
INSERT INTO Songs (title, artist) VALUES
('Bohemian Rhapsody', 'Queen'),
('Hotel California', 'Eagles'),
('Sweet Child O'' Mine', 'Guns N'' Roses'),
('Stairway to Heaven', 'Led Zeppelin'),
('Smells Like Teen Spirit', 'Nirvana'),
('Billie Jean', 'Michael Jackson'),
('Sweet Home Alabama', 'Lynyrd Skynyrd'),
('Purple Haze', 'Jimi Hendrix');

-- Add sample playlists
INSERT INTO Playlists (name, user_id) VALUES
('Classic Rock', 1),
('80s Hits', 1),
('Guitar Heroes', 2),
('My Favorites', 3);

-- Add songs to playlists
INSERT INTO Playlist_Songs (playlist_id, song_id) VALUES
(1, 1), -- Bohemian Rhapsody to Classic Rock
(1, 2), -- Hotel California to Classic Rock
(1, 4), -- Stairway to Heaven to Classic Rock
(2, 5), -- Smells Like Teen Spirit to 80s Hits
(2, 6), -- Billie Jean to 80s Hits
(3, 3), -- Sweet Child O' Mine to Guitar Heroes
(3, 8), -- Purple Haze to Guitar Heroes
(4, 1), -- Bohemian Rhapsody to My Favorites
(4, 2), -- Hotel California to My Favorites
(4, 7); -- Sweet Home Alabama to My Favorites