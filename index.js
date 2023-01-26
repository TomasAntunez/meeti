const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const router = require('./routes/index');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./config/db');
const bodyParser = require('body-parser');
const passport = require('./config/passport');

// Environment Variables
require('dotenv').config({ path: 'variables.env' });

// DB and models
require('./models/Users');
require('./models/Categories');
require('./models/Comments');
require('./models/Groups');
require('./models/Meeti');
db.sync().then(() => console.log('BD Connected')).catch((error) => console.log(error));

// Main application
const app = express();

// Body parser, read forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Enable EJS as template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
// Views location
app.set('views', path.join(__dirname, './views'));

// Static files
app.use(express.static('public'));

// Enable cookie parser
app.use(cookieParser());

// Create session
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Add flash messages
app.use(flash());

// Middleware (logged user, flash messages, current date)
app.use((req, res, next) => {
    res.locals.user = {...req.user} || null;
    res.locals.messages = req.flash();
    const date = new Date();
    res.locals.year = date.getFullYear();
    next();
});


// Routing
app.use('/', router());

// Read the host and the port
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;

app.listen(port, host, () => {
    console.log('Server running');
});