require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/sport-scheduler';
const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';

/* DB */
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Mongo connected'))
  .catch(err => console.error('Mongo error', err));

/* Middlewares */
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

/* Sessions */
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

/* View engine */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

/* Make user available to templates */
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

/* Routes */
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/teams', require('./routes/teams'));
app.use('/events', require('./routes/events'));

/* Start */
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
