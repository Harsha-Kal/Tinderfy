INSERT INTO users 
  (username, password, name, email, age, gender) 
VALUES 
    ('john_doe', 'pa$$word', 'John Doe', 'john.doe@email.com', 28, 'Male'),
    ('jane_smith', 'Shjk8930', 'Jane Smith', 'jane.smith@email.com', 32, 'Female'),
    ('user1', 'password1', 'Test User 1', 'user1@test.com', 25, 'Male'),
    ('user2', 'password2', 'Test User 2', 'user2@test.com', 27, 'Female'),
    ('user3', 'password3', 'Test User 3', 'user3@test.com', 30, 'Male'),
    ('user4', 'password4', 'Test User 4', 'user4@test.com', 24, 'Female'),
    ('user5', 'password5', 'Test User 5', 'user5@test.com', 29, 'Male'),
    ('user6', 'password6', 'Test User 6', 'user6@test.com', 26, 'Female'),
    ('user7', 'password7', 'Test User 7', 'user7@test.com', 31, 'Male'),
    ('user8', 'password8', 'Test User 8', 'user8@test.com', 23, 'Female'),
    ('user9', 'password9', 'Test User 9', 'user9@test.com', 28, 'Male'),
    ('user10', 'password10', 'Test User 10', 'user10@test.com', 25, 'Female');

INSERT INTO songs 
  (title, artist) 
VALUES 
    ('Bohemian Rhapsody', 'Queen'),
    ('Billie Jean', 'Michael Jackson'),
    ('Hotel California', 'Eagles'),
    ('Imagine', 'John Lennon'),
    ('Smells Like Teen Spirit', 'Nirvana'),
    ('Stairway to Heaven', 'Led Zeppelin'),
    ('Hey Jude', 'The Beatles'),
    ('Purple Rain', 'Prince'),
    ('Dancing Queen', 'ABBA'),
    ('Thriller', 'Michael Jackson'),
    ('Sweet Child O'' Mine', 'Guns N'' Roses'),
    ('Like a Rolling Stone', 'Bob Dylan'),
    ('Wonderwall', 'Oasis'),
    ('Don''t Stop Believin''', 'Journey'),
    ('Livin'' on a Prayer', 'Bon Jovi'),
    ('Shape of You', 'Ed Sheeran'),
    ('Blinding Lights', 'The Weeknd'),
    ('Watermelon Sugar', 'Harry Styles'),
    ('Levitating', 'Dua Lipa'),
    ('Good 4 U', 'Olivia Rodrigo'),
    ('Uptown Funk', 'Bruno Mars'),
    ('Happy', 'Pharrell Williams'),
    ('Shake It Off', 'Taylor Swift'),
    ('Someone Like You', 'Adele'),
    ('Rolling in the Deep', 'Adele'),
    ('Sweet Caroline', 'Neil Diamond'),
    ('I Will Always Love You', 'Whitney Houston'),
    ('Eye of the Tiger', 'Survivor'),
    ('Despacito', 'Luis Fonsi'),
    ('Old Town Road', 'Lil Nas X');

INSERT INTO users_to_songs 
  (user_id, song_id) 
VALUES 
    (1, 1), (1, 2), (1, 3), (1, 6), (1, 8), (1, 11), (1, 15), (1, 26),
    (2, 4), (2, 5), (2, 7), (2, 9), (2, 10), (2, 12), (2, 14), (2, 27),
    (3, 11), (3, 12), (3, 13), (3, 14), (3, 15), (3, 28),
    (4, 16), (4, 17), (4, 18), (4, 19), (4, 20), (4, 29),
    (5, 21), (5, 22), (5, 23), (5, 24), (5, 25), (5, 30);