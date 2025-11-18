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

const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  defaultLayout: 'main',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
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
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: 'temp secret',
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
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const hash = await bcrypt.hash(req.body.password, 10);
  const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
  try {
    const insertedUser = await db.one(query, [username, hash])
    console.log(insertedUser);
    res.redirect('/login');
  }
  catch (err) {
    const error = true;
    console.log(err);
    res.status(400).render('pages/register', { message: "Username already exists", error: true });
  }
});

//Route for account customization
app.get("/account-custom", (req, res) => {
  res.render("pages/account-custom");
});

app.post("/account-custom", async (req, res) => {
  const { username, password, name, email, age, gender } = req.body;
  // const name = req.name;
  // const username = req.username;
  // const password = req.password;
  // const email = req.email;
  // const age = req.age;
  // const gender = req.gender;
  const hash = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (username, password, name, email, age, gender)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  try {
    const insertedUser = await db.one(query, [username, hash, name, email, age, gender]);
    console.log(insertedUser);
    res.render('pages/account-custom');
  }
  catch (err) {
    const error = true;
    console.log(err);
    res.render('pages/account-custom', { message: "Error creating profile.", error: true });
  }
});




//Lab 10 Dummy Endpoint
app.get('/welcome', (req, res) => {
  res.json({ status: 'success', message: 'Welcome!' });
});

//function to run rapidAPI endpoint to get track features
const RAPIDAPI_HOST = 'track-analysis.p.rapidapi.com';
async function getTrackFeatures(song, artist) {
  try {
    const response = await axios.get('https://track-analysis.p.rapidapi.com/pktx/analysis', {
      params: {
        song: song,
        artist: artist
      },
      headers: {
        'x-rapidapi-key': process.env.API_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching analysis for ${song} by ${artist}:`, error.message);
    return null;
  }
}

//Function to extract track feaures from API per song
async function processSongById(songId){
  try{
    const song = await db.oneOrNone('SELECT id, title, artist FROM songs WHERE id = $1', [songId]);
    if(!song){
      console.error('Song not found');
    }

    const analysis = await getTrackFeatures(song.title, song.artist);
    if(analysis.acousticness == null){
      console.error('Could not get track features from API');
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
  }catch(error){
    console.error('Error processing song:', error);
  }
}

//function to process all user songs and update user db
async function processUserSongs(userId){
  try{
    const songs = await db.any('SELECT id, title, artist, acousticness, danceability, energy, instrumentalness, happiness FROM songs WHERE user_id = $1', [userId]);
    if(songs.length == 0){
      console.error('No songs found from user');
    }
    for(const song of songs){
      if(song.acousticness == null || song.acousticness == undefined){
        const analysis = await getTrackFeatures(song.title, song.artist);
        if(analysis.acousticness !== null && analysis.acousticness !== undefined){
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
        }else{
          console.error(`Failed to get anaylsis for ${song.title}`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    const updatedSongs = await db.any('SELECT acousticness, danceability, energy, instrumentalness, happiness FROM songs WHERE user_id = $1 AND acousticness IS NOT NULL', [userId]);
    if(updatedSongs.length == 0){
      console.error(`No songs with analysis data from user: ${userId}`);
    }
    let average_song_acousticness = 0;
    let average_song_danceability = 0;
    let average_song_energy = 0;
    let average_song_instrumentalness = 0;
    let average_song_happiness = 0;
    const count = updatedSongs.length;
    for(const song of updatedSongs){
      average_song_acousticness += song.acousticness;
      average_song_danceability += song.danceability;
      average_song_energy += song.energy;
      average_song_instrumentalness += song.instrumentalness;
      average_song_happiness += song.happiness;
    }
    const averages = {
      acousticness: Math.round(average_song_acousticness/count),
      danceability: Math.round(average_song_danceability/count),
      energy: Math.round(average_song_energy/count),
      instrumentalness: Math.round(average_song_instrumentalness/count),
      happiness: Math.round(average_song_happiness/count)
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
  }catch(error){
    console.error(`Error processing user ${userId} songs`, error.message);
  }
}

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

// Start the server
const PORT = 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces so it's accessible from outside the container
const server = app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);

  try{
    await processUserSongs(2);
  }catch(error){
    console.error('failed to process song:', error.message);
  }

});

module.exports = server;