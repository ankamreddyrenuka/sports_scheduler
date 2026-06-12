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

const localMongo = 'mongodb://localhost:27017/sport-scheduler';
const looksLikeAtlas = typeof MONGO === 'string' && (MONGO.includes('mongodb.net') || MONGO.startsWith('mongodb+srv://'));
const forceAtlas = process.env.FORCE_ATLAS === 'true';
// If FORCE_ATLAS=true, attempt the provided MONGO (Atlas) URI first.
const sessionMongoUrl = (forceAtlas || !looksLikeAtlas) ? MONGO : localMongo;

/* DB */
async function connectDB() {
  if (!forceAtlas && looksLikeAtlas) {
    console.warn('Detected Atlas/ SRV Mongo URI and FORCE_ATLAS not set. Skipping remote connect and attempting local fallback to avoid DNS SRV resolution errors. Set FORCE_ATLAS=true to override.');
    try {
      await mongoose.connect(localMongo, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to local MongoDB');
      return;
    } catch (err) {
      console.error('Local Mongo connection failed', err);
      return;
    }
  }

  try {
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 5000 });
    console.log('Mongo connected');
  } catch (err) {
    console.error('Mongo error', err);
    if (MONGO !== localMongo) {
      console.log('Falling back to local MongoDB...');
      try {
        await mongoose.connect(localMongo, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to local MongoDB');
      } catch (err2) {
        console.error('Local Mongo connection failed', err2);
      }
    }
  }
}

connectDB();

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
  store: MongoStore.create({ mongoUrl: sessionMongoUrl }),
  // Use sessionMongoUrl to avoid SRV lookups when an Atlas URI is present
  // (sessionMongoUrl defined above)
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
