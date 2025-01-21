const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require('express-session');
const collection = require("./config");
const port = 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(
    session({
        secret: 'my-secret-key', // Secret to sign the session ID cookie
        resave: false,           // Avoid resaving session if unmodified
        saveUninitialized: false // Don't save uninitialized sessions
    })
);


app.set('view engine', 'ejs');
app.use(express.static('public'));


//the routes
app.get('/', (req, res) => {
    res.render("home");
});

app.get('/login', (req, res) => {
    const error = req.session.error;
    req.session.error = null; // Clear the error after displaying it
    res.render('login', { error });
});

app.get('/signup', (req, res) => {
    res.render("signup")
});


//the functions
app.post("/signup", async (req,res) => {
    const data = {
        name: req.body.username,
        password: req.body.password,
    };

    //check if username is taken
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser) {
        res.send("Username is taken, please enter different username.");
    } else {
        //hash password
        const saltRounds = 10;
        data.password =  await bcrypt.hash(data.password, saltRounds);
        
        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }
    res.render("login");
});


app.post("/login", async(req, res) => {
    try {
        const enteredName = req.body.username;
        const nameCheck = await collection.findOne({name: enteredName});
        if(!nameCheck) {
            res.send("username does not exist.");
        }

        const passwordMatch = await bcrypt.compare(req.body.password, nameCheck.password);

        if(passwordMatch) {
            req.session.user = enteredName; // Save user data in session
            return res.redirect('/dashboard');
        } 

        // Set error message in session
        req.session.error = 'Invalid username or password';
        res.redirect('/login'); // Reload login page
    } catch {
        res.send("Incorrect Details Submitted.")
    }
});


app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not logged in
    }
    res.render("dashboard", { username: req.session.user });
});
  
app.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy the session
    res.redirect('/login'); // Redirect to login
});


app.listen(port, ()=>{
    console.log(`server running on port: ${port}`);
});