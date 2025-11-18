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
  (user_id, title, artist) 
VALUES 
    (1, 'Bohemian Rhapsody', 'Queen'),
    (1, 'Billie Jean', 'Michael Jackson'),
    (1, 'Hotel California', 'Eagles'),
    (2, 'Imagine', 'John Lennon'),
    (2, 'Smells Like Teen Spirit', 'Nirvana'),
    (1, 'Stairway to Heaven', 'Led Zeppelin'),
    (2, 'Hey Jude', 'The Beatles'),
    (1, 'Purple Rain', 'Prince'),
    (2, 'Dancing Queen', 'ABBA'),
    (2, 'Thriller', 'Michael Jackson');