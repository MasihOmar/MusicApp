-- Sample Users
INSERT INTO users (username, password_hash) VALUES ('user1', '$2a$10$aes.RoqKVtVXGf7OGLf0K.qGZrpXuSZje1pqryi5kAH3o9R/YRd9q'); -- Password: password1
INSERT INTO users (username, password_hash) VALUES ('user2', '$2a$10$aes.RoqKVtVXGf7OGLf0K.qGZrpXuSZje1pqryi5kAH3o9R/YRd9q'); -- Password: password1

-- Sample Songs
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Superstar', 'Jamelia', 'Pop', 2003, 128.0, 0.82, 213, 'Jamelia - Superstar.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Un Break My Heart', 'Toni Braxton', 'R&B', 1996, 68.0, 0.58, 273, 'Toni Braxton - Un Break My Heart.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('What''s Going On', 'Marvin Gaye', 'Soul', 1971, 82.0, 0.72, 234, 'Marvin Gaye - What''s Going On.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Strawberry Fields Forever', 'The Beatles', 'Rock', 1967, 88.0, 0.68, 251, 'The Beatles - Strawberry Fields Forever.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Back To Black', 'Amy Winehouse', 'Soul', 2006, 118.0, 0.78, 240, 'Amy Winehouse - Back To Black.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Fight The Power', 'Public Enemy', 'Hip Hop', 1989, 108.0, 0.92, 285, 'Public Enemy - Fight The Power.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Respect', 'Aretha Franklin', 'Soul', 1967, 118.0, 0.88, 147, 'Aretha Franklin _ Respect.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('A Change Is Gonna Come', 'Sam Cooke', 'Soul', 1964, 72.0, 0.55, 191, 'Sam Cooke - A Change Is Gonna Come.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Smells Like Teen Spirit', 'Nirvana', 'Grunge', 1991, 117.0, 0.93, 301, 'Nirvana - Smells Like Teen Spirit.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Like A Rolling Stone', 'The Rolling Stones', 'Rock', 1965, 102.0, 0.82, 329, 'The Rolling Stones - Like A Rolling Stone.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('ANTIFRAGILE', 'LE SSERAFIM', 'K-Pop', 2022, 132.0, 0.88, 184, 'LE SSERAFIM - ANTIFRAGILE.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Promise', 'Laufey', 'Jazz', 2023, 82.0, 0.52, 213, 'Laufey - Promise.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Sweetest Pie', 'Megan Thee Stallion & Dua Lipa', 'Pop', 2022, 118.0, 0.82, 204, 'Megan Thee Stallion & Dua Lipa - Sweetest Pie.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Arabella', 'Arctic Monkeys', 'Rock', 2013, 108.0, 0.78, 273, 'Arabella - Arctic Monkeys.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Still In Love', 'Thirdstory', 'R&B', 2016, 88.0, 0.68, 245, 'Thirdstory - Still In Love ft. Eryn Allen Kane.mp3');
INSERT INTO songs (title, artist, genre, release_year, tempo, energy, duration, file_name) VALUES ('Calling (Lose My Mind)', 'Sebastian Ingrosso, Alesso', 'Electronic', 2012, 128.0, 0.92, 206, 'Sebastian Ingrosso, Alesso - Calling (Lose My Mind) ft. Ryan Tedder.mp3');

-- Sample Playlists
INSERT INTO playlists (name, user_id) VALUES ('Workout', 1);
INSERT INTO playlists (name, user_id) VALUES ('Relaxing', 1);
INSERT INTO playlists (name, user_id) VALUES ('Party', 2);
INSERT INTO playlists (name, user_id) VALUES ('Study', 2);

-- Sample Playlist Songs
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 2);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 5);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 7);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (1, 10);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (2, 3);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (2, 6);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (2, 9);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 1);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 4);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 7);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (3, 10);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (4, 3);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (4, 6);
INSERT INTO playlist_songs (playlist_id, song_id) VALUES (4, 9); 