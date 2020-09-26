// Importing all dependencies
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Setting up Views Public and parsing
app.use('/', express.static('public'));
app.use('/auth', express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(cookieParser());

// Handling Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// Listening
app.listen(3000, () => {
    console.log('Server is listening!!!');
});