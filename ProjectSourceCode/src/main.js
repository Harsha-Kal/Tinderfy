const express = require('express'); // To build an application server or API
const axios = require('axios');
const app = express(); //creates express instance
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars'); //imports handlebar library
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs');
const KMeans = require('ml-kmeans'); //for clustering

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  defaultLayout: 'main',
});

// Serve static assets from the 'css' directory (e.g., stylesheets)
app.use(express.static(path.join(__dirname, 'css')));

// --- NEW ADDITION ---
// Serve static HTML files from a dedicated directory (views/pages/html/)
app.use('/html', express.static(path.join(__dirname, 'views', 'pages', 'html')));
// --- END NEW ADDITION ---

// database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST || 'db', // the database server
  port: process.env.POSTGRES_PORT || 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// // *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);


app.get("/", (req, res) => {
  res.render('pages/home');
});
app.get("/login", (req, res) => {
  res.render('pages/login');
});
app.get("/register", (req, res) => {
  res.render('pages/register');
});

// Route with session check for home-logged-in
app.get("/home-logged-in", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('pages/home-logged-in', { user: req.session.user });
});

// *****************************************************
// // *****************************************************
app.get("/Matches", (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Serve the static HTML file using res.sendFile
  // IMPORTANT: The path must be absolute when using res.sendFile
  res.sendFile(path.join(__dirname, 'views', 'pages', 'Matches.html'));
});

app.get("/Account_info", (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Serve the static HTML file using res.sendFile
  // IMPORTANT: The path must be absolute when using res.sendFile
  res.sendFile(path.join(__dirname, 'views', 'pages', 'Account_info.html'));
});

app.get("/myMatches", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // Assuming your static HTML is in views/pages/
  res.sendFile(path.join(__dirname, 'views', 'pages', 'myMatches.html'));
});

const testUsers = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "user3", password: "password3" },
  { username: "user4", password: "password4" },
  { username: "user5", password: "password5" },
  { username: "user6", password: "password6" },
  { username: "user7", password: "password7" },
  { username: "user8", password: "password8" },
  { username: "user9", password: "password9" },
  { username: "user10", password: "password10" }
];

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const hash = await bcrypt.hash(req.body.password, 10);
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
  try {
    const insertedUser = await db.one(query, [username, hash])
    console.log(insertedUser);

    //added for home-logged-in.hbs
    req.session.user = {
      id: insertedUser.id,
      username: insertedUser.username
    };
    console.log('Inserted user:', insertedUser);


    res.redirect('/home-logged-in');
  }
  catch (err) {
    const error = true;
    console.log(err);
    res.status(400).render('pages/register', { message: "Username already exists", error: true });
  }
});


//login page
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(400).render('pages/login', { message: "Invalid username or password", error: true });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).render('pages/login', { message: "Invalid username or password", error: true });
    }

    req.session.user = {
      id: user.id,
      username: user.username
    };
    console.log('Logged in user:', user);

    res.redirect('/home-logged-in');
  } catch (err) {
    console.error(err);
    res.status(400).render('pages/login', { message: "An error occurred", error: true });
  }
});


//destroy session when logout button is clicked
app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy(err => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
});



//Route for account customization
// app.get("/account-custom", (req, res) => {
//   res.render("pages/account-custom");
// });

// app.post("/account-custom", async (req, res) => {
//   const { username, password, name, email, age, gender } = req.body;
//   const hash = await bcrypt.hash(password, 10);
//   const query = `
//     INSERT INTO users (username, password, name, email, age, gender)
//     VALUES ($1, $2, $3, $4, $5, $6)
//     RETURNING *;
//   `;
//   try {
//     const insertedUser = await db.one(query, [username, hash, name, email, age, gender]);
//     console.log(insertedUser);
//     res.render('pages/account-custom');
//   }
//   catch (err) {
//     const error = true;
//     console.log(err);
//     res.render('pages/account-custom', { message: "Error creating profile.", error: true });
//   }
// });


//Lab 10 Dummy Endpoint
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

//Gets a Spotify acess token to call their endpoint
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.log('Error receiving Spotify API token:', error.message);
    return null;
  }
}

//Takes track name and artist name and returns the track's spotify id
async function getSpotifyId(trackName, artistName) {
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      console.log('Failed to receive Spotify API Token');
      return null;
    }
    const query = `track:${trackName} artist:${artistName}`;

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: query,
        type: 'track',
        limit: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.tracks.items.length > 0) {
      const track = response.data.tracks.items[0];
      //console.log(`SPOTIFY ID IS: ${track.id}`);
      return track.id;
    } else {
      console.log(`No results found for "${trackName}" by "${artistName}"`);
      return null;
    }
  } catch (error) {
    console.log('Error searching Spotify:', error.message);
    return null;
  }
}

//Takes Spotify Id and returns track's features
const RAPIDAPI_HOST = 'track-analysis.p.rapidapi.com';
async function getTrackFeatures(spotifyId) {
  try {
    query = 'https://track-analysis.p.rapidapi.com/pktx/spotify/' + spotifyId;
    const responce = await axios.get(query, {
      headers: {
        'x-rapidapi-key': process.env.API_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    return responce.data;
  } catch (error) {
    console.log(`Error fetching track features for ${spotifyId}:`, error.message);
    return null;
  }
}

//Function to extract track feaures from API per song
async function processSongById(songId) {
  try {
    const song = await db.oneOrNone('SELECT id, title, artist FROM songs WHERE id = $1', [songId]);
    if (!song) {
      console.error('Song not found');
    }

    //I will rewrite so it takes spotify_id from db intead of running getSpotifyId again
    const spotifyId = await getSpotifyId(song.title, song.artist);
    if (spotifyId == null) {
      console.error(`Could not find Spotify ID for "${song.title}" by "${song.artist}"`);
      return;
    }

    const analysis = await getTrackFeatures(spotifyId);
    if (analysis.acousticness == null) {
      console.error('Could not get track features from API');
      return;
    }

    await db.none('UPDATE songs SET acousticness = $1, danceability = $2, energy = $3, instrumentalness = $4, happiness = $5 WHERE id = $6',
      [
        analysis.acousticness,
        analysis.danceability,
        analysis.energy,
        analysis.instrumentalness,
        analysis.happiness,
        song.id
      ]
    );
    return;
  } catch (error) {
    console.error('Error processing song:', error);
  }
}

//function to process all user songs and update user db
async function processUserSongs(userId) {
  try {
    const songs = await db.any(`SELECT s.id, s.title, s.artist, s.acousticness
FROM songs s
JOIN users_to_songs uts ON s.id = uts.song_id
WHERE uts.user_id = $1;`, [userId]);
    if (songs.length == 0) {
      console.error('No songs found from user');
    }
    for (const song of songs) {
      if (song.acousticness == null || song.acousticness == undefined) {
        const spotifyId = await getSpotifyId(song.title, song.artist);
        if (!spotifyId) {
          console.log(`Could not find Spotify ID for "${song.title}" by "${song.artist}"`);
          continue;
        }
        const analysis = await getTrackFeatures(spotifyId);
        if (analysis.acousticness !== null && analysis.acousticness !== undefined) {
          await db.none('UPDATE songs SET acousticness = $1, danceability = $2, energy = $3, instrumentalness = $4, happiness = $5 WHERE id = $6',
            [
              analysis.acousticness,
              analysis.danceability,
              analysis.energy,
              analysis.instrumentalness,
              analysis.happiness,
              song.id
            ]
          );
          const result = await db.one('SELECT count(*)::int AS user_count FROM users');
          const userNumber = result.user_count;
          if (userNumber < 4) {
            await K_clustering(userNumber);
          }
          else {
            await K_clustering(4);
          }
        } else {
          console.error(`Failed to get anaylsis for ${song.title}`);
        }
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    const updatedSongs = await db.any(`SELECT s.acousticness, s.danceability, s.energy, s.instrumentalness, s.happiness
FROM songs s
JOIN users_to_songs uts ON s.id = uts.song_id
WHERE uts.user_id = $1
  AND s.acousticness IS NOT NULL;`, [userId]);
    if (updatedSongs.length == 0) {
      console.error(`No songs with analysis data from user: ${userId}`);
    }
    let average_song_acousticness = 0;
    let average_song_danceability = 0;
    let average_song_energy = 0;
    let average_song_instrumentalness = 0;
    let average_song_happiness = 0;
    const count = updatedSongs.length;
    for (const song of updatedSongs) {
      average_song_acousticness += song.acousticness;
      average_song_danceability += song.danceability;
      average_song_energy += song.energy;
      average_song_instrumentalness += song.instrumentalness;
      average_song_happiness += song.happiness;
    }
    const averages = {
      acousticness: Math.round(average_song_acousticness / count),
      danceability: Math.round(average_song_danceability / count),
      energy: Math.round(average_song_energy / count),
      instrumentalness: Math.round(average_song_instrumentalness / count),
      happiness: Math.round(average_song_happiness / count)
    };

    await db.none('UPDATE users SET average_song_acousticness = $1, average_song_danceability = $2, average_song_energy = $3, average_song_instrumentalness = $4, average_song_happiness = $5 WHERE id = $6',
      [
        averages.acousticness,
        averages.danceability,
        averages.energy,
        averages.instrumentalness,
        averages.happiness,
        userId
      ]
    );
    console.log(`Added feature averages to user: ${userId}`);
    await K_clustering(4)
  } catch (error) {
    console.error(`Error processing user ${userId} songs`, error.message);
  }
}
//k-means clustering
async function K_clustering(k) {
  try {
    const query = `SELECT id, average_song_acousticness, average_song_danceability, average_song_energy, average_song_instrumentalness, average_song_happiness 
  FROM users 
  WHERE average_song_acousticness IS NOT NULL 
  AND average_song_danceability IS NOT NULL 
  AND average_song_energy IS NOT NULL 
  AND average_song_instrumentalness IS NOT NULL 
  AND average_song_happiness IS NOT NULL
  ;`;

    const users = await db.any(query);

    if (users.length === 0) {
      console.error('No users with complete feature vectors');
      return null;
    }
    //Extract User ID and feature vectors
    const userIds = users.map(user => user.id);
    const features = users.map(user => [
      user.average_song_acousticness,
      user.average_song_danceability,
      user.average_song_energy,
      user.average_song_instrumentalness,
      user.average_song_happiness
    ]);

    //Normalize features (0-1)
    const normalized = normalizeFeatures(features);
    const result = KMeans.kmeans(normalized, k, { initialization: 'kmeans++' });

    //Update database with cluster ids
    for (let i = 0; i < userIds.length; i++) {
      await db.none('UPDATE users SET cluster_id = $1 WHERE id = $2;',
        [result.clusters[i], userIds[i]])
    }
    //confirmation
    console.log(`Clustered ${users.length} users into ${k} clusters`);
    return result;
  } catch (error) {
    console.error('Error in k means clustering: ', error);
    return null
  }

}

function normalizeFeatures(features) {
  const numFeatures = features[0].length;
  const mins = [];
  const maxs = [];

  //Find min and max for each feature
  for (let i = 0; i < numFeatures; i++) {
    const values = features.map(row => row[i]);
    mins.push(Math.min(...values));
    maxs.push(Math.max(...values));
  }
  return features.map(row => row.map((value, index) => {
    const range = maxs[index] - mins[index];
    return range === 0 ? 0 : (value - mins[index]) / range;
  }))
}

async function calculateSimilarity(user1_id, user2_id) {
  const user1_info = await db.oneOrNone('SELECT average_song_acousticness, average_song_danceability, average_song_energy, average_song_instrumentalness, average_song_happiness FROM users WHERE id = $1', [user1_id]);
  const user2_info = await db.oneOrNone('SELECT average_song_acousticness, average_song_danceability, average_song_energy, average_song_instrumentalness, average_song_happiness FROM users WHERE id = $1', [user2_id]);
  if (!user1_info || !user2_info) {
    console.error('User not found');
    return null;
  }

  // Check if users have all required features
  if (!user1_info || !user2_info) {
    return null;
  }

  const distance = (user1_info.average_song_acousticness - user2_info.average_song_acousticness) ** 2 + (user1_info.average_song_danceability - user2_info.average_song_danceability) ** 2 + (user1_info.average_song_energy - user2_info.average_song_energy) ** 2 + (user1_info.average_song_instrumentalness - user2_info.average_song_instrumentalness) ** 2 + (user1_info.average_song_happiness - user2_info.average_song_happiness) ** 2;
  const k = 0.001; // decay constant tuned to your 200–500 range
  const similarity = 100 * Math.exp(-k * distance);
  console.log(`Similarity between user ${user1_id} and user ${user2_id} is ${similarity}`);
  return similarity;
}

// //endpoint for clustering
// app.post('/api/cluster', async (req, res) => {
//   const k = 5
//   const result = await K_clustering(k);
//   res.json({
//     success: result !== null,
//     message: result ? `Clustered users into ${k} clusters` : `Clustering failed`
//   })
// })

//endpoint to debug backend work

app.get('/api/songs', async (req, res) => {
  try {
    const songs = await db.any('SELECT * FROM songs ORDER BY id');
    res.json({
      success: true,
      count: songs.length,
      songs: songs
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.any('SELECT * FROM users ORDER BY id');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/profile - Fetch the logged-in user's profile data
app.get('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.session.user.id;

  try {
    const query = `
      SELECT 
        id,
        username,
        name,
        dob,
        bio,
        location,
        gender,
        email,
        phonenumber,
        profile_picture_url,
        average_song_acousticness,
        average_song_danceability,
        average_song_energy,
        average_song_instrumentalness,
        average_song_happiness,
        cluster_id
      FROM users
      WHERE id = $1;
    `;

    const user = await db.one(query, [userId]);

    // Get user's liked songs from users_to_songs table
    const likedSongs = await db.any(`
      SELECT s.title, s.artist
      FROM songs s
      JOIN users_to_songs uts ON s.id = uts.song_id
      WHERE uts.user_id = $1
      ORDER BY uts.id
    `, [userId]);

    // Format songs as comma-separated string: "Title by Artist, Title 2 by Artist 2"
    const likedSongsString = likedSongs.map(song => `${song.title} by ${song.artist}`).join(', ');

    // Return user data including liked songs
    res.json({
      ...user,
      liked_songs: likedSongsString || ''
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: "Error fetching profile. Please try again." });
  }
});


// PUT /api/profile - Update user's profile data
app.put('/api/profile', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {
    username,
    name,
    dob,
    bio,
    location,
    gender,
    email,
    phoneNumber,
    liked_songs
  } = req.body;

  const userId = req.session.user.id;

  // Validate required fields
  if (!username || username.trim() === '') {
    return res.status(400).json({ error: "Username is required" });
  }
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    // Update all relevant fields
    const query = `
      UPDATE users
      SET
        username = $1,
        name = $2,
        dob = $3,
        bio = $4,
        location = $5,
        gender = $6,
        email = $7,
        phonenumber = $8,
        liked_songs = $9
      WHERE id = $10
      RETURNING *;
    `;

    const updatedUser = await db.one(query, [
      username.trim(),
      name.trim(),
      dob || null,
      bio || null,
      location || null,
      gender || null,
      email || null,
      phoneNumber || null,
      liked_songs || null,
      userId
    ]);

    // Update session info if username changed
    req.session.user.username = updatedUser.username;

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);

    if (err.code === '23505' || err.constraint === 'users_username_key') {
      return res.status(400).json({
        error: "Username already exists. Please choose a different username."
      });
    }

    res.status(500).json({
      error: "Error updating profile. Please try again."
    });
  }
});

app.post('/api/profile/songs', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { title, artist } = req.body;
  const userId = req.session.user.id;

  const songTitle = title.trim();
  const songArtist = artist.trim();

  //Ensures both fields are not empty
  if (!songTitle || !songArtist) {
    return res.status(400).json({
      error: "Both song title and artist name are required"
    });
  }

  try {
    console.log(`Validating song: "${songTitle}" by "${songArtist}"`);
    const spotifyId = await getSpotifyId(songTitle, songArtist);

    //ensures that the API returns a spotify ID
    if (!spotifyId) {
      return res.status(404).json({
        error: `Could not find "${songTitle}" by ${songArtist} on Spotify`
      });
    }

    //console.log(`Song Found. ID: ${spotifyId}`);

    //Checks to see if song is already in db
    let song = await db.oneOrNone(
      'SELECT id, spotify_id FROM songs WHERE LOWER(title) = LOWER($1) AND LOWER(artist) = LOWER($2)', [songTitle, songArtist]
    );
    let songId;

    if (song) {
      //Song exists
      songId = song.id;
      //console.log('Song already exists in DB');
      //Updates spotify id in db if not already inserted
      if (!song.spotify_id) {
        await db.none(
          'UPDATE songs SET spotify_id = $1 WHERE id = $2', [spotifyId, songId]
        );
      }
    } else {
      //Song does not exist, puts song into db
      const newSong = await db.one(
        'INSERT INTO songs (title, artist, spotify_id) VALUES ($1, $2, $3) RETURNING id', [songTitle, songArtist, spotifyId]
      );
      songId = newSong.id;
    }

    //Sees if user has song already liked
    const userHasSongLiked = await db.oneOrNone(
      'SELECT id FROM users_to_songs WHERE user_id = $1 AND song_id = $2', [userId, songId]
    );

    if (userHasSongLiked) {
      return res.status(409).json({
        error: 'You have already added this song to your profile'
      });
    }

    //Insert data into linking table
    await db.none(
      'INSERT INTO users_to_songs (user_id, song_id) VALUES ($1, $2)', [userId, songId]
    );
    console.log('Added song to user profile');
    processUserSongs(userId);

    res.json({
      success: true,
      message: 'Song added and validated with Spotify!',
      song: {
        title: songTitle,
        artist: songArtist,
        spotifyId: spotifyId
      }
    });

  } catch (err) {
    console.error('Error adding song:', err);

    if (err.message === 'You have already added this song to your profile') {
      return res.status(409).json({ error: err.message });
    }

    if (err.code === '403') {
      return res.status(409).json({
        error: 'This song is already in your profile'
      });
    }

    res.status(500).json({
      error: 'Error adding song. Please try again.'
    });
  }
});

// DELETE /api/profile/songs - Remove a song from user's profile
app.delete('/api/profile/songs', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { title, artist } = req.body;
  const userId = req.session.user.id;

  if (!title || !artist) {
    return res.status(400).json({ error: "Song title and artist are required" });
  }

  try {
    // Find the song
    const song = await db.oneOrNone(
      'SELECT id FROM songs WHERE LOWER(title) = LOWER($1) AND LOWER(artist) = LOWER($2)',
      [title.trim(), artist.trim()]
    );

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Remove the link between user and song
    const result = await db.result(
      'DELETE FROM users_to_songs WHERE user_id = $1 AND song_id = $2',
      [userId, song.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Song not in your profile" });
    }

    res.json({
      success: true,
      message: 'Song removed successfully'
    });

  } catch (err) {
    console.error('Error removing song:', err);
    res.status(500).json({
      error: 'Error removing song. Please try again.'
    });
  }
});

async function matching(user1_id, user2_id) {
  const match = await db.oneOrNone(`SELECT * FROM matches 
  WHERE (user1_id = $1 AND user2_id = $2) 
    OR (user1_id = $2 AND user2_id = $1);`, [user1_id, user2_id]);
  if (match)
    //update the matched field in matches to true
    db.none(`UPDATE matches SET matched = true 
    WHERE (user1_id = $1 AND user2_id = $2) 
      OR (user1_id = $2 AND user2_id = $1);`, [user1_id, user2_id]);
  else {
    //insert a new row in matches with matched field as false
    db.none(`INSERT INTO matches (user1_id, user2_id, matched) 
    VALUES ($1, $2, false);`, [user1_id, user2_id]);
  }
}

async function returnAllMatches(user_id) {
  const matches = await db.any(
    `SELECT 
      m.user1_id,
      m.user2_id,
      m.matched,
      u.id AS other_user_id,
      u.username,
      u.name,
      u.email,
      u.age,
      u.gender,
      u.profile_picture_url
     FROM matches m
     JOIN users u
       ON u.id = CASE
                  WHEN m.user1_id = $1 THEN m.user2_id
                  ELSE m.user1_id
                END
     WHERE (m.user1_id = $1 OR m.user2_id = $1)
       AND m.matched = TRUE;`,
    [user_id]
  );

  return matches;
}

// GET /api/user/matches - Fetch all matches for logged-in user
app.get('/api/user/matches', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const loggedInUserId = req.session.user.id;

  try {
    // Get confirmed matches (matched = true)
    const confirmedMatches = await db.any(
      `SELECT 
        m.user1_id,
        m.user2_id,
        m.matched,
        u.id AS other_user_id,
        u.username,
        u.name,
        u.age,
        u.profile_picture_url
       FROM matches m
       JOIN users u
         ON u.id = CASE
                    WHEN m.user1_id = $1 THEN m.user2_id
                    ELSE m.user1_id
                  END
       WHERE (m.user1_id = $1 OR m.user2_id = $1)
         AND m.matched = TRUE
       ORDER BY m.user1_id, m.user2_id`,
      [loggedInUserId]
    );

    // Get pending requests sent (matched = false)
    // These are matches where the logged-in user is involved but matched is false
    // Note: We can't perfectly determine who initiated without additional tracking,
    // so we'll show all unmatched requests where the logged-in user is involved
    const sentRequests = await db.any(
      `SELECT 
        m.user1_id,
        m.user2_id,
        m.matched,
        u.id AS other_user_id,
        u.username,
        u.name,
        u.age,
        u.profile_picture_url
       FROM matches m
       JOIN users u
         ON u.id = CASE
                    WHEN m.user1_id = $1 THEN m.user2_id
                    ELSE m.user1_id
                  END
       WHERE (m.user1_id = $1 OR m.user2_id = $1)
         AND m.matched = FALSE
       ORDER BY m.user1_id, m.user2_id`,
      [loggedInUserId]
    );

    // Format confirmed matches
    const formattedConfirmed = await Promise.all(
      confirmedMatches.map(async (match) => {
        let matchScore = '??%';
        const similarity = await calculateSimilarity(loggedInUserId, match.other_user_id);
        if (similarity !== null && similarity !== undefined) {
          matchScore = `${Math.round(similarity)}%`;
        }

        return {
          id: match.other_user_id,
          username: match.username || 'Unknown',
          name: match.name || match.username || 'Unknown',
          age: match.age || '?',
          photoUrl: match.profile_picture_url || null,
          status: 'CONFIRMED',
          matchScore: matchScore
        };
      })
    );

    // Format sent requests
    const formattedSent = sentRequests.map(match => ({
      id: match.other_user_id,
      username: match.username || 'Unknown',
      name: match.name || match.username || 'Unknown',
      age: match.age || '?',
      photoUrl: match.profile_picture_url || null,
      status: 'SENT_PENDING'
    }));

    res.json({
      confirmed: formattedConfirmed,
      sent: formattedSent
    });
  } catch (err) {
    console.error('Error fetching user matches:', err);
    res.status(500).json({ error: "Error loading matches. Please try again." });
  }
});

// GET /api/match/next - Fetch next user (same cluster first, then different clusters)
app.get('/api/match/next', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const loggedInUserId = req.session.user.id;

  try {
    // First, get the logged-in user's cluster_id and feature data
    const currentUser = await db.oneOrNone(
      'SELECT cluster_id, average_song_acousticness, average_song_danceability, average_song_energy, average_song_instrumentalness, average_song_happiness FROM users WHERE id = $1',
      [loggedInUserId]
    );

    if (!currentUser || currentUser.cluster_id === null) {
      return res.status(204).json({ message: "Please complete your profile to start matching." });
    }

    const clusterId = currentUser.cluster_id;

    // Step 1: Try to get users with the same cluster_id first
    let availableUsers = await db.any(`
      SELECT u.id, u.username, u.name, u.age, u.gender, u.profile_picture_url, u.email, u.cluster_id,
             u.average_song_acousticness, u.average_song_danceability, u.average_song_energy, u.average_song_instrumentalness, u.average_song_happiness
      FROM users u
      WHERE u.cluster_id = $1
        AND u.id != $2
        AND NOT EXISTS (
          SELECT 1 FROM matches m
          WHERE ((m.user1_id = $2 AND m.user2_id = u.id)
             OR (m.user2_id = $2 AND m.user1_id = u.id))
             AND (m.matched = true OR m.initiated_by_user_id = $2)
        )
      ORDER BY u.id
      LIMIT 1
    `, [clusterId, loggedInUserId]);

    let isSameCluster = true;

    // Step 2: If no same-cluster users, get users from different clusters
    if (availableUsers.length === 0) {
      isSameCluster = false;
      availableUsers = await db.any(`
        SELECT u.id, u.username, u.name, u.age, u.gender, u.profile_picture_url, u.email, u.cluster_id,
               u.average_song_acousticness, u.average_song_danceability, u.average_song_energy, u.average_song_instrumentalness, u.average_song_happiness
        FROM users u
        WHERE u.cluster_id != $1
          AND u.cluster_id IS NOT NULL
          AND u.id != $2
          AND NOT EXISTS (
          SELECT 1 FROM matches m
          WHERE ((m.user1_id = $2 AND m.user2_id = u.id)
             OR (m.user2_id = $2 AND m.user1_id = u.id))
             AND (m.matched = true OR m.initiated_by_user_id = $2)
        )
        ORDER BY u.id
        LIMIT 1
      `, [clusterId, loggedInUserId]);
    }

    if (availableUsers.length === 0) {
      return res.status(204).json({ message: "No more profiles available. Check back later!" });
    }

    const user = availableUsers[0];

    // Debug logging to see what data we're getting
    console.log('User data from database:', {
      id: user.id,
      username: user.username,
      name: user.name,
      age: user.age,
      email: user.email,
      cluster_id: user.cluster_id,
      isSameCluster: isSameCluster
    });

    // Calculate match score using similarity for all users (same cluster and different cluster)
    let matchScore = "??%"; // Default fallback
    const similarity = await calculateSimilarity(loggedInUserId, user.id);
    if (similarity !== null && similarity !== undefined) {
      matchScore = `${Math.round(similarity)}%`;
    }

    // Get user's liked songs from users_to_songs table
    const likedSongs = await db.any(`
      SELECT s.title, s.artist
      FROM songs s
      JOIN users_to_songs uts ON s.id = uts.song_id
      WHERE uts.user_id = $1
      LIMIT 5
    `, [user.id]);

    // Format songs as array of strings
    const likedSongsArray = likedSongs.map(song =>
      song.title && song.artist ? `${song.title} by ${song.artist}` : `${song.title || song.artist || ''}`
    );

    // Determine display name - prefer name, fallback to username, then Anonymous
    // Handle null, undefined, and empty strings properly
    const userName = user.name && typeof user.name === 'string' && user.name.trim() ? user.name.trim() : null;
    const userUsername = user.username && typeof user.username === 'string' && user.username.trim() ? user.username.trim() : null;

    const displayName = userName || userUsername || 'Anonymous';
    const displayNameForBio = userName || userUsername || 'Music enthusiast';

    console.log('Display name resolved to:', displayName, '(from name:', userName, ', username:', userUsername, ')');

    // Build profile object matching what the frontend expects
    const profile = {
      id: user.id,
      name: displayName,
      age: user.age || '?',
      location: user.location || 'Location not set',
      bio: `Hey! I'm ${displayNameForBio}. Music connects us! 🎵`,
      photoUrl: user.profile_picture_url || null,
      matchScore: matchScore,
      hobbies: [], // Empty array for now since not stored in DB
      likedSongs: likedSongsArray.length > 0 ? likedSongsArray : ['No songs added yet']
    };

    console.log('Final profile object:', JSON.stringify(profile, null, 2));

    res.json(profile);
  } catch (err) {
    console.error('Error fetching next match:', err);
    res.status(500).json({ error: "Error loading matches. Please try again." });
  }
});

// POST /api/match/rate - Record like/dislike action
app.post('/api/match/rate', async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const loggedInUserId = req.session.user.id;
  const { profileId, rating } = req.body;

  if (!profileId || !rating) {
    return res.status(400).json({ error: "profileId and rating are required" });
  }

  if (rating !== 'like' && rating !== 'dislike') {
    return res.status(400).json({ error: "rating must be 'like' or 'dislike'" });
  }

  try {
    // Ensure user1_id < user2_id for consistent ordering
    const user1_id = Math.min(loggedInUserId, profileId);
    const user2_id = Math.max(loggedInUserId, profileId);

    // Check if match already exists
    const existingMatch = await db.oneOrNone(`
      SELECT * FROM matches 
      WHERE user1_id = $1 AND user2_id = $2
    `, [user1_id, user2_id]);

    if (existingMatch) {
      // Match already exists - check the current matched status
      if (rating === 'like') {
        // If matched is currently false, this is the second like - make it mutual!
        // If matched is already true, both users already like each other - no change needed
        if (existingMatch.matched === false) {
          await db.none(`
            UPDATE matches 
            SET matched = true
            WHERE user1_id = $1 AND user2_id = $2
          `, [user1_id, user2_id]);
        }
      } else {
        // Dislike - remove the match record entirely
        await db.none(`
          DELETE FROM matches 
          WHERE user1_id = $1 AND user2_id = $2
        `, [user1_id, user2_id]);
      }
    } else {
      // No existing match - creating first like
      if (rating === 'like') {
        await db.none(`
          INSERT INTO matches (user1_id, user2_id, matched, initiated_by_user_id)
          VALUES ($1, $2, false, $3)
        `, [user1_id, user2_id, loggedInUserId]);
      }
      // If it's a dislike and no match exists, nothing to do
    }

    res.json({ success: true, message: `User ${rating} recorded successfully` });
  } catch (err) {
    console.error('Error recording rating:', err);
    res.status(500).json({ error: "Error recording rating. Please try again." });
  }
});

// Start the server
const PORT = 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces so it's accessible from outside the container
const server = app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);

  try {
    // await K_clustering(4);
    //await getSpotifyId('Dancing Queen', 'ABBA');
  } catch (error) {
    console.error('failed to process song:', error.message);
  }

});

module.exports = server;