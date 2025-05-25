# Music App Recommendation System

This project implements a music recommendation system using several different algorithms, including matrix factorization.

## Features

- **Collaborative Filtering:** Uses user similarity based on Jaccard similarity to recommend songs
- **K-means Clustering:** Recommends songs based on genre using k-means clustering
- **Matrix Factorization:** Uses matrix factorization with SGD optimization to provide personalized recommendations
- **Simple Recommendations:** Provides recommendations without requiring model training

## Matrix Factorization Implementation

The matrix factorization algorithm is implemented in `RecommendationService.java` and includes:

1. **User-Item Matrix:** Maps user interactions with songs (via playlists)
2. **Latent Factors:** Discovers hidden factors that influence user preferences
3. **Stochastic Gradient Descent (SGD):** Optimization algorithm to learn the latent factors
4. **Bias Terms:** Global, user, and item biases to capture rating tendencies

### Technical Details

- **Latent Factors:** The system uses 10 latent factors by default
- **Learning Rate:** Starts at 0.01 and decays by 0.9 each iteration
- **Regularization:** Uses L2 regularization with a parameter of 0.01
- **Iterations:** Performs 100 iterations of SGD by default

## Simple Recommendation Approaches (No Training Required)

For educational purposes, we've also implemented recommendation approaches that don't require model training:

1. **Popularity-Based:** Recommends the most popular songs based on play count
2. **Content-Based:** Recommends songs similar to a seed song using metadata (genre, tempo, energy, etc.)
3. **Random Recommendations:** Provides random song recommendations as a baseline
4. **Genre Filtering:** Simple filtering of songs by genre

These approaches are useful for:
- Comparison with more sophisticated algorithms
- Cold-start scenarios when not enough data is available
- Educational purposes to understand recommendation basics
- Fallback strategies when model training fails

## API Endpoints

The recommendation system exposes these endpoints:

- `/api/recommendations/user/{userId}?limit={limit}` - Get recommendations using collaborative filtering
- `/api/recommendations/genre/{genre}?clusters={clusters}` - Get recommendations for a specific genre
- `/api/recommendations/matrix/{userId}?limit={limit}` - Get recommendations using matrix factorization

Simple recommendation endpoints:
- `/api/simple-recommendations/popular?limit={limit}` - Get popular songs
- `/api/simple-recommendations/random?limit={limit}` - Get random songs
- `/api/simple-recommendations/similar/{songId}?limit={limit}` - Get songs similar to a given song
- `/api/simple-recommendations/genre/{genre}?limit={limit}` - Get songs of a specific genre

## How It Works

1. **Initialization:** Random latent factor matrices are created for users and songs
2. **Learning:** The SGD algorithm iteratively updates these matrices to minimize prediction error
3. **Prediction:** The dot product of user and song latent factors predicts user preference
4. **Recommendation:** Songs with the highest predicted ratings are recommended

## Educational Value

This implementation simplifies real-world recommendation systems to focus on the core concepts:

- Matrix decomposition
- Latent factor models
- Gradient descent optimization
- Bias handling
- Cold-start problem management
- Comparison of training vs. non-training approaches

## References

- [Matrix Factorization for Recommender Systems](https://medium.com/@eliasah/deep-dive-into-matrix-factorization-for-recommender-systems-from-basics-to-implementation-79e4f1ea1660)
- Google Developers Matrix Factorization Documentation

## Future Improvements

- Implement implicit feedback handling
- Add time decay for older interactions
- Incorporate content-based features into the matrix factorization model
- Implement ALS (Alternating Least Squares) as an alternative to SGD
- Add cross-validation for hyperparameter tuning 