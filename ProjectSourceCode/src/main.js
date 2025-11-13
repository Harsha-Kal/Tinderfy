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

// Start the server
const PORT = 3000;
const HOST = '0.0.0.0'; // Bind to all interfaces so it's accessible from outside the container
const server = app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

module.exports = server;