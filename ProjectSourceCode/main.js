const express = require('express'); // To build an application server or API
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
