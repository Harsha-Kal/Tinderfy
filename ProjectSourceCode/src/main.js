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
    try{
        const insertedUser = await db.one(query, [username, hash])
        console.log(insertedUser);
        res.redirect('/login');
    }
    catch(err){
        const error = true;
        console.log(err);
        res.render('pages/register', {message: "Username already exists", error: true});
    }
});

//Lab 10 Dummy Endpoint
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

//function to run rapidAPI endpoint to get track features
const RAPIDAPI_HOST = 'track-analysis.p.rapidapi.com';
async function getTrackFeatures(song, artist){
  try{
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
  }catch(error){
    console.error(`Error fetching analysis for ${song} by ${artist}:`, error.message);
    return null;
  }
}

async function processSongById(songId){
  try{
    const song = await db.oneOrNone('SELECT id, title, artist FROM songs WHERE id = $1', [songId]);
    if(!song){
      console.error('Song not found');
    }

    const analysis = await getTrackFeatures(song.title, song.artist);
    if(!analysis || analysis.acousticness == undefined){
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

// Start the server
const PORT = 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces so it's accessible from outside the container
const server = app.listen(PORT, HOST, async () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);

  try{
    await processSongById(1);
  }catch(error){
    console.error('failed to process song:', error.message);
  }

});

module.exports = server;