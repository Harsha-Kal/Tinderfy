INSERT INTO users 
  (username, password, name, email, age, gender) 
VALUES 
    ('john_doe', 'pa$$word', 'John Doe', 'john.doe@email.com', 28, 'Male'),
    ('jane_smith', 'Shjk8930', 'Jane Smith', 'jane.smith@email.com', 32, 'Female');

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