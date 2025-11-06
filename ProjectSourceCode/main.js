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

app.get("/", (req, res) => {
    //res.render('file');
});
app.get("/login", (req, res) => {
    //res.render('file');
});
app.get("/register", (req, res) => {
    //res.render(file);
});
app.post("/register", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const hash = await bcrypt.hash(req.body.password, 10);
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
    try{
        //const insertedUser = await db.one(query, [username, hash])
        //console.log(insertedUser);
        //res.redirect(login page);
    }
    catch(err){
        const error = true;
        console.log(err);
        //res.render(register page with error);
    }
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