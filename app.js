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
  const isProduction = process.env.NODE_ENV === 'production';
  // Increase timeouts for production (Render, etc.)
  const serverSelectionTimeout = isProduction ? 30000 : 5000;
  const socketTimeout = isProduction ? 45000 : 10000;
  
  const mongoOptions = {
    serverSelectionTimeoutMS: serverSelectionTimeout,
    socketTimeoutMS: socketTimeout,
    connectTimeoutMS: serverSelectionTimeout,
    maxPoolSize: isProduction ? 10 : 5,
    minPoolSize: isProduction ? 2 : 1,
    retryWrites: true,
    w: 'majority'
  };

  // Add connection lifecycle logging to help diagnose deployment issues
  mongoose.connection.on('connecting', () => console.log('Mongoose: connecting...'));
  mongoose.connection.on('connected', () => console.log('Mongoose: connected'));
  mongoose.connection.on('error', (err) => console.error('Mongoose error:', err));
  mongoose.connection.on('disconnected', () => console.warn('Mongoose: disconnected'));

  if (!forceAtlas && looksLikeAtlas && !isProduction) {
    console.warn('Detected Atlas/ SRV Mongo URI and FORCE_ATLAS not set (dev mode). Skipping remote connect and attempting local fallback to avoid DNS SRV resolution errors. Set FORCE_ATLAS=true to override.');
    try {
      await mongoose.connect(localMongo, mongoOptions);
      console.log('Connected to local MongoDB');
      return;
    } catch (err) {
      console.error('Local Mongo connection failed', err);
      return;
    }
  }

  try {
    console.log(`Connecting to MongoDB... (env: ${isProduction ? 'production' : 'development'}, timeout: ${serverSelectionTimeout}ms)`);
    await mongoose.connect(MONGO, mongoOptions);
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    // On production (Render), don't fall back - let it fail clearly
    if (!isProduction && MONGO !== localMongo) {
      console.log('Falling back to local MongoDB...');
      try {
        await mongoose.connect(localMongo, mongoOptions);
        console.log('Connected to local MongoDB');
      } catch (err2) {
        console.error('Local Mongo connection failed', err2);
        throw err2;
      }
    } else {
      throw err;
    }
  }
}

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();

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
// Server is started after a successful DB connection in startServer()
