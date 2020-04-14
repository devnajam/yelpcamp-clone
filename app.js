const express = require('express');
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const morgan = require('morgan');

//routes
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/user');
const ratingRoutes = require('./routes/ratings');

//setup DB
mongoose.connect('mongodb://localhost:27017/yelpcamp_clone');

//setting up the middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.use(
  expressSession({
    secret: 'i live in pakistan',
    resave: false,
    saveUninitialized: false,
  })
);
//DO the passport setup
app.use(flash());

//Server
app.listen(3000, () => console.log('server has started!!!'));
