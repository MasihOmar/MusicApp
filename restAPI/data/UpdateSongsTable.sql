USE MusicApp;

-- Add missing columns to Songs table for recommendation features
ALTER TABLE Songs 
ADD COLUMN genre VARCHAR(50) DEFAULT 'Rock',
ADD COLUMN release_year INT DEFAULT 2000,
ADD COLUMN tempo DOUBLE DEFAULT 120.0,
ADD COLUMN energy DOUBLE DEFAULT 0.5,
ADD COLUMN duration INT DEFAULT 180;

-- Update existing songs with some sample genre data
UPDATE Songs SET genre = 'Rock', release_year = 1975, tempo = 144.0, energy = 0.8, duration = 354 WHERE title = 'Bohemian Rhapsody';
UPDATE Songs SET genre = 'Rock', release_year = 1976, tempo = 75.0, energy = 0.7, duration = 390 WHERE title = 'Hotel California';
UPDATE Songs SET genre = 'Rock', release_year = 1987, tempo = 126.0, energy = 0.9, duration = 355 WHERE title = 'Sweet Child O'' Mine';
UPDATE Songs SET genre = 'Rock', release_year = 1971, tempo = 63.0, energy = 0.6, duration = 482 WHERE title = 'Stairway to Heaven';
UPDATE Songs SET genre = 'Grunge', release_year = 1991, tempo = 116.0, energy = 0.9, duration = 301 WHERE title = 'Smells Like Teen Spirit';
UPDATE Songs SET genre = 'Pop', release_year = 1983, tempo = 117.0, energy = 0.8, duration = 294 WHERE title = 'Billie Jean';
UPDATE Songs SET genre = 'Southern Rock', release_year = 1974, tempo = 99.0, energy = 0.7, duration = 283 WHERE title = 'Sweet Home Alabama';
UPDATE Songs SET genre = 'Rock', release_year = 1967, tempo = 110.0, energy = 0.8, duration = 273 WHERE title = 'Purple Haze';

-- Create an index on the genre column for faster queries
CREATE INDEX idx_songs_genre ON Songs(genre); 