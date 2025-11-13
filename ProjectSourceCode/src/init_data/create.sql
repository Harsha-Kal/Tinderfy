CREATE TABLE users(
    id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(50),
    email VARCHAR(100),
    age INTEGER,
    gender VARCHAR(20),
    profile_picture_url VARCHAR(255)
);

CREATE TABLE songs(
    id SERIAL PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    spotify_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    acousticness INTEGER,
    danceability INTEGER,
    energy INTEGER,
    instrumentalness INTEGER,
    happiness INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_preferences(
    user_id INTEGER PRIMARY KEY NOT NULL,
    min_age INTEGER,
    max_age INTEGER,
    preferred_gender VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE matches(
    id SERIAL PRIMARY KEY NOT NULL,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES users(id),
    FOREIGN KEY (user2_id) REFERENCES users(id)
);