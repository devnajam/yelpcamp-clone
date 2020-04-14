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

//Server
app.listen(3000, () => console.log('server has started!!!'));
